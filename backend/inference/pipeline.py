from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import librosa
import numpy as np
import torch
from pydantic import BaseModel, Field

from config import (
    MIN_CONFIDENCE,
    MIN_STUTTER_PCT,
    STRIDE_SEC,
    STUTTER_CLASSES,
    WINDOW_SEC,
)


class WindowResult(BaseModel):
    start_sec: float
    end_sec: float
    label: str
    confidence: float
    probs: Dict[str, float]
    syllables: int = 0  # Number of syllables in this window


class InferenceResult(BaseModel):
    predicted_label: str
    confidence: float
    class_probs: Dict[str, float]
    stutter_pct: float
    fluency_pct: float  # Same as (100 - stutter_pct) excluding interjections
    duration_sec: float
    total_syllables: int = 0
    stuttered_syllables: int = 0
    fluent_syllables: int = 0
    syllable_stats: Dict[str, int] = Field(default_factory=dict)  # Syllables per class
    class_durations: Dict[str, float] = Field(default_factory=dict)  # Time spent in each class
    timeline: List[WindowResult] = Field(default_factory=list)


@dataclass
class _TypeReorder:
    indices: List[int]


def _detect_syllables(waveform_np: np.ndarray, sample_rate: int) -> int:
    """
    Detect approximate number of syllables using onset detection.
    Uses librosa's onset strength for finding syllable boundaries.
    """
    try:
        # Compute onset strength from the audio
        onset_env = librosa.onset.onset_strength(y=waveform_np, sr=sample_rate)
        
        # Detect onset times
        onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sample_rate, units='samples')
        
        # Return number of onsets (approximate syllable count)
        syllable_count = max(1, len(onsets))  # At least 1 syllable per window
        return syllable_count
    except Exception:
        # Fallback: estimate based on duration (4 syllables per second average)
        duration_sec = len(waveform_np) / sample_rate
        return max(1, int(duration_sec * 4))


class StutterPipeline:
    def __init__(self, model, device: str, sample_rate: int):
        self.model = model
        self.device = torch.device(device)
        self.sample_rate = sample_rate
        self.window_samples = int(round(WINDOW_SEC * sample_rate))
        self.stride_samples = int(round(STRIDE_SEC * sample_rate))

        if not hasattr(model, "type_map"):
            raise ValueError("Model is missing required attribute 'type_map'.")
        self.type_map = getattr(model, "type_map")
        self._reorder = self._build_reorder(self.type_map)

        self.model.to(self.device)
        self.model.eval()

    @staticmethod
    def _build_reorder(type_map: Dict[str, int]) -> _TypeReorder:
        key_for_class = {
            "Fluent": "fluent",
            "Repetition": "repetition",
            "Prolongation": "prolongation",
            "Block": "blocking",
        }
        indices: List[int] = []
        lower_map = {str(k).lower(): int(v) for k, v in type_map.items()}
        for cls in STUTTER_CLASSES:
            expected_key = key_for_class.get(cls)
            if expected_key is None or expected_key not in lower_map:
                raise ValueError(
                    f"Checkpoint type_map missing key for class '{cls}'. Expected '{expected_key}'."
                )
            indices.append(lower_map[expected_key])
        return _TypeReorder(indices=indices)

    def _infer_window(self, waveform_np: np.ndarray) -> np.ndarray:
        if waveform_np.ndim != 1:
            raise ValueError("waveform_np must be a mono 1D numpy array")

        x = torch.from_numpy(waveform_np.astype(np.float32, copy=False)).unsqueeze(0)
        x = x.to(self.device)

        with torch.no_grad():
            binary_logits, type_logits = self.model(x)
            type_probs_raw = (
                torch.softmax(type_logits, dim=-1)
                .squeeze(0)
                .detach()
                .cpu()
                .numpy()
            )
            bin_probs = (
                torch.softmax(binary_logits, dim=-1)
                .squeeze(0)
                .detach()
                .cpu()
                .numpy()
            )

        type_probs = type_probs_raw[np.array(self._reorder.indices, dtype=np.int64)]

        p_fluent = float(bin_probs[0])
        p_stutter = float(bin_probs[1])

        combined = np.zeros((len(STUTTER_CLASSES),), dtype=np.float32)
        combined[0] = p_fluent

        stutter_mass = float(np.sum(type_probs[1:]))
        if stutter_mass > 0.0:
            combined[1:] = p_stutter * (type_probs[1:] / stutter_mass)
        else:
            combined[1:] = p_stutter / 4.0

        return combined

    def run(self, waveform_np: np.ndarray) -> InferenceResult:
        if waveform_np.ndim != 1:
            raise ValueError("Audio must be mono.")
        if waveform_np.size == 0:
            raise ValueError("Empty audio.")

        duration_sec = float(waveform_np.shape[0] / self.sample_rate)

        timeline: List[WindowResult] = []
        combined_list: List[np.ndarray] = []
        class_durations: Dict[str, float] = {cls: 0.0 for cls in STUTTER_CLASSES}
        syllable_stats: Dict[str, int] = {cls: 0 for cls in STUTTER_CLASSES}

        total = waveform_np.shape[0]
        start = 0
        window_duration = float(self.window_samples / self.sample_rate)
        
        while start < total:
            end = start + self.window_samples
            window = waveform_np[start:end]
            if window.shape[0] < self.window_samples:
                pad = self.window_samples - window.shape[0]
                window = np.pad(window, (0, pad), mode="constant")

            combined = self._infer_window(window)
            combined_list.append(combined)

            # Detect syllables in this window
            syllables_in_window = _detect_syllables(window, self.sample_rate)

            start_sec = float(start / self.sample_rate)
            end_sec = float(min(end, total) / self.sample_rate)
            pred_idx = int(np.argmax(combined))
            label = STUTTER_CLASSES[pred_idx]
            confidence = float(combined[pred_idx])
            probs = {
                STUTTER_CLASSES[i]: float(combined[i]) for i in range(len(STUTTER_CLASSES))
            }

            # Update class durations and syllable stats
            class_durations[label] += window_duration
            syllable_stats[label] += syllables_in_window

            timeline.append(
                WindowResult(
                    start_sec=start_sec,
                    end_sec=end_sec,
                    label=label,
                    confidence=confidence,
                    probs=probs,
                    syllables=syllables_in_window,
                )
            )

            if self.stride_samples <= 0:
                break
            start += self.stride_samples

        mean_probs = np.mean(np.stack(combined_list, axis=0), axis=0)
        
        # Calculate stutter_pct (now only 4 classes: Fluent, Repetition, Prolongation, Block)
        fluent_prob = float(mean_probs[0])
        stutter_mass = float(np.sum(mean_probs[1:4]))  # Repetition, Prolongation, Block
        
        # Normalize probabilities
        total = fluent_prob + stutter_mass
        if total > 0:
            stutter_pct = float((stutter_mass / total) * 100.0)
            fluency_pct = float((fluent_prob / total) * 100.0)
        else:
            stutter_pct = 0.0
            fluency_pct = 100.0
        
        # Determine predicted label
        pred_idx = int(np.argmax(mean_probs))
        predicted_label = STUTTER_CLASSES[pred_idx]
        confidence = float(mean_probs[pred_idx])

        if predicted_label != "Fluent":
            if confidence < MIN_CONFIDENCE or stutter_pct < MIN_STUTTER_PCT:
                predicted_label = "Fluent"
                confidence = fluent_prob

        class_probs = {
            STUTTER_CLASSES[i]: float(mean_probs[i]) for i in range(len(STUTTER_CLASSES))
        }
        
        # Calculate syllable statistics
        total_syllables = sum(syllable_stats.values())
        stuttered_syllables = sum(syllable_stats[cls] for cls in ["Repetition", "Prolongation", "Block"])
        fluent_syllables = syllable_stats["Fluent"]

        return InferenceResult(
            predicted_label=predicted_label,
            confidence=confidence,
            class_probs=class_probs,
            stutter_pct=stutter_pct,
            fluency_pct=fluency_pct,
            duration_sec=duration_sec,
            total_syllables=total_syllables,
            stuttered_syllables=stuttered_syllables,
            fluent_syllables=fluent_syllables,
            syllable_stats=syllable_stats,
            class_durations=class_durations,
            timeline=timeline,
        )
