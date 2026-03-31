from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any, Dict, Tuple


def _windows_torch_dll_workaround() -> None:
    if os.name != "nt":
        return

    try:
        venv_root = Path(sys.executable).resolve().parent.parent
        candidates = [
            venv_root,
            venv_root / "Scripts",
            venv_root / "Lib" / "site-packages" / "sklearn" / ".libs",
            venv_root / "Lib" / "site-packages" / "scipy" / ".libs",
            venv_root / "Lib" / "site-packages" / "numpy" / ".libs",
        ]
        for d in candidates:
            if d.is_dir():
                try:
                    os.add_dll_directory(str(d))
                except Exception:
                    pass
    except Exception:
        return


_windows_torch_dll_workaround()

try:
    import torch
    import torch.nn as nn
except OSError as e:  # pragma: no cover
    raise RuntimeError(
        "PyTorch failed to load its native DLLs. "
        "On Windows, install/repair the Microsoft Visual C++ 2015–2022 "
        "Redistributable (x64), then restart your terminal/VS Code."
    ) from e
from transformers import Wav2Vec2Config, Wav2Vec2Model


def _wav2vec2_base_config() -> Wav2Vec2Config:
    # Wav2Vec2 Base (12 layers, 768 hidden)
    # This is intentionally an offline config (no from_pretrained/downloads).
    # It must match the training checkpoint shipped as models/best_model.pt.
    return Wav2Vec2Config(
        vocab_size=32,
        hidden_size=768,
        num_hidden_layers=12,
        num_attention_heads=12,
        intermediate_size=3072,
        hidden_act="gelu",
        hidden_dropout=0.1,
        activation_dropout=0.1,
        attention_dropout=0.1,
        feat_proj_dropout=0.0,
        feat_extract_activation="gelu",
        feat_extract_norm="group",
        feat_extract_dropout=0.0,
        layerdrop=0.1,
        layer_norm_eps=1e-5,
        initializer_range=0.02,
        conv_dim=(512, 512, 512, 512, 512, 512, 512),
        conv_stride=(5, 2, 2, 2, 2, 2, 2),
        conv_kernel=(10, 3, 3, 3, 3, 2, 2),
        conv_bias=False,
        num_conv_pos_embeddings=128,
        num_conv_pos_embedding_groups=16,
        do_stable_layer_norm=False,
        apply_spec_augment=True,
        mask_time_prob=0.05,
        mask_time_length=10,
        mask_feature_prob=0.0,
        mask_feature_length=10,
        gradient_checkpointing=False,
        use_weighted_layer_sum=False,
    )


class FinalStutterModel(nn.Module):
    def __init__(self, type_map: Dict[str, int] | None = None):
        super().__init__()
        self.backbone = Wav2Vec2Model(_wav2vec2_base_config())

        self.attn_pool = nn.Sequential(
            nn.Linear(768, 128),
            nn.Tanh(),
            nn.Linear(128, 1),
        )

        self.shared = nn.Sequential(
            nn.LayerNorm(768),
            nn.Linear(768, 512),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.GELU(),
            nn.Dropout(0.3),
        )

        self.binary_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(128, 2),
        )

        self.type_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(128, 5),
        )

        self.type_map: Dict[str, int] = type_map or {}

    def forward(self, waveform: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        out = self.backbone(input_values=waveform)
        h = out.last_hidden_state  # (B, S, 768)

        scores = self.attn_pool(h)  # (B, S, 1)
        attn = torch.softmax(scores, dim=1)
        pooled = torch.sum(attn * h, dim=1)  # (B, 768)

        z = self.shared(pooled)  # (B, 256)
        binary_logits = self.binary_head(z)  # (B, 2)
        type_logits = self.type_head(z)  # (B, 5)
        return binary_logits, type_logits


def load_model(path: str, device: str) -> FinalStutterModel:
    checkpoint: Dict[str, Any] = torch.load(path, map_location=device)
    if "state_dict" not in checkpoint:
        raise ValueError("Checkpoint dict is missing 'state_dict'.")
    if "type_map" not in checkpoint:
        raise ValueError("Checkpoint dict is missing 'type_map'.")

    model = FinalStutterModel(type_map=checkpoint["type_map"])

    state = checkpoint["state_dict"]
    model.load_state_dict(state, strict=True)

    model.to(torch.device(device))
    model.eval()
    return model
