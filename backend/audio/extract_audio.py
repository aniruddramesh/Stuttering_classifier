import subprocess

import soundfile as sf

from audio.ffmpeg_utils import resolve_ffmpeg_executable


def extract_audio(input_path: str, output_path: str) -> float:
    """Extract mono 16kHz WAV audio from a video file using ffmpeg.

    Returns duration in seconds.
    """

    ffmpeg_exe = resolve_ffmpeg_executable()

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i",
        input_path,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "wav",
        output_path,
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except FileNotFoundError as e:
        raise RuntimeError(
            "ffmpeg could not be executed (FileNotFoundError). "
            "If you're on Windows, either install ffmpeg on PATH or set FFMPEG_PATH."
        ) from e
    except subprocess.CalledProcessError as e:
        stderr = (e.stderr or "").strip()
        stdout = (e.stdout or "").strip()
        msg = "ffmpeg failed while extracting audio."
        if stderr:
            msg += f"\n{stderr}"
        if stdout:
            msg += f"\n{stdout}"
        raise RuntimeError(msg) from e

    info = sf.info(output_path)
    if info.frames <= 0 or info.samplerate <= 0:
        raise RuntimeError("Extracted audio is empty or invalid.")
    return float(info.frames / info.samplerate)
