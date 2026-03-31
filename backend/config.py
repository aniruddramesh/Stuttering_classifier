import os
import sys
from pathlib import Path


def _windows_torch_dll_workaround() -> None:
    """Ensure the active venv DLL dirs are searchable on Windows.

    Some Windows setups hit `WinError 1114` when importing torch because a
    dependency DLL (commonly `vcomp140.dll`) is present inside the venv but not
    discoverable by the loader.
    """

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
        # Best-effort only.
        return


_windows_torch_dll_workaround()

try:
    import torch
except OSError as e:  # pragma: no cover
    raise RuntimeError(
        "PyTorch failed to load its native DLLs. "
        "On Windows, this commonly means the Microsoft Visual C++ 2015–2022 "
        "Redistributable (x64) is missing or corrupted (e.g., vcomp140.dll). "
        "Install/repair it, then restart your terminal/VS Code and try again."
    ) from e

SAMPLE_RATE: int = 16000
WINDOW_SEC: float = 5.0
STRIDE_SEC: float = 2.5
MIN_CONFIDENCE: float = 0.5
MIN_STUTTER_PCT: float = 10.0

STUTTER_CLASSES = [
    "Fluent",
    "Repetition",
    "Prolongation",
    "Block",
    "Interjection",
]

MODEL_PATH: str = "models/best_model.pt"


def _auto_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


DEVICE: str = os.environ.get("DEVICE", "").strip().lower() or _auto_device()
