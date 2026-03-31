from __future__ import annotations

import os
import shutil
from pathlib import Path


def resolve_ffmpeg_executable() -> str:
    """Resolve the ffmpeg executable path.

    Resolution order:
    1) FFMPEG_PATH environment variable (absolute path to ffmpeg.exe)
    2) ffmpeg available on PATH
    3) Bundled ffmpeg from the `imageio-ffmpeg` package
    """

    env_path = (os.environ.get("FFMPEG_PATH") or "").strip().strip('"')
    if env_path:
        if Path(env_path).exists():
            return env_path

    which_path = shutil.which("ffmpeg")
    if which_path:
        return which_path

    try:
        import imageio_ffmpeg  # type: ignore

        candidate = imageio_ffmpeg.get_ffmpeg_exe()
        if candidate and Path(candidate).exists():
            return candidate
    except Exception:
        pass

    details: list[str] = []
    if env_path:
        details.append(f"FFMPEG_PATH was set but not found: {env_path}")
    details.append("ffmpeg was not found on PATH")
    details.append("imageio-ffmpeg fallback was not available")
    detail_text = "\n".join(f"- {d}" for d in details)

    raise RuntimeError(
        "ffmpeg executable not found.\n"
        "Fix options (Windows):\n"
        "1) Install ffmpeg and add its 'bin' folder to PATH, OR\n"
        "2) Set FFMPEG_PATH to the full path of ffmpeg.exe, OR\n"
        "3) Install the bundled fallback: pip install imageio-ffmpeg\n\n"
        f"Tried:\n{detail_text}"
    )
