from __future__ import annotations

import os
import tempfile

import numpy as np
import librosa
import soundfile as sf

from audio.ffmpeg_utils import resolve_ffmpeg_executable


def load_audio(path: str, target_sr: int = 16000) -> np.ndarray:
    """Load audio file as float32 mono waveform, resampled to target_sr."""
    try:
        data, sr = sf.read(path, always_2d=False)
        if isinstance(data, np.ndarray) and data.ndim == 2:
            data = np.mean(data, axis=1)
        data = np.asarray(data, dtype=np.float32)

        if sr != target_sr:
            data = librosa.resample(data, orig_sr=sr, target_sr=target_sr)
            data = np.asarray(data, dtype=np.float32)
        return data
    except Exception:
        # Fallback for formats that soundfile/libsndfile may not decode on some systems
        # (e.g., mp3/m4a on Windows). Convert to WAV with ffmpeg, then read.
        tmp_wav = None
        try:
            ffmpeg_exe = resolve_ffmpeg_executable()
            tmp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name

            cmd = [
                ffmpeg_exe,
                "-y",
                "-i",
                path,
                "-ac",
                "1",
                "-ar",
                str(int(target_sr)),
                "-f",
                "wav",
                tmp_wav,
            ]
            # Use capture_output so failures are surfaced cleanly as 500s from the API.
            import subprocess

            subprocess.run(cmd, check=True, capture_output=True, text=True)

            data, sr = sf.read(tmp_wav, always_2d=False)
            if isinstance(data, np.ndarray) and data.ndim == 2:
                data = np.mean(data, axis=1)
            data = np.asarray(data, dtype=np.float32)
            if sr != target_sr:
                data = librosa.resample(data, orig_sr=sr, target_sr=target_sr)
                data = np.asarray(data, dtype=np.float32)
            return data
        except RuntimeError:
            # ffmpeg missing / not resolvable → raise the helpful message from resolver.
            raise
        except Exception as e:
            # Last resort: librosa/audioread. If this also fails, re-raise the original
            # exception to preserve context.
            try:
                data, _ = librosa.load(path, sr=target_sr, mono=True)
                return np.asarray(data, dtype=np.float32)
            except Exception:
                raise e
        finally:
            if tmp_wav and os.path.exists(tmp_wav):
                try:
                    os.remove(tmp_wav)
                except Exception:
                    pass
