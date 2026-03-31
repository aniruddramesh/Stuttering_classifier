import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from audio.extract_audio import extract_audio
from audio.load_audio import load_audio
from config import DEVICE, MODEL_PATH, SAMPLE_RATE
from inference.pipeline import StutterPipeline
from models.final_model import load_model


BACKEND_ROOT = Path(__file__).resolve().parents[1]
MODEL_ABS_PATH = str((BACKEND_ROOT / MODEL_PATH).resolve())


def _is_video(path: str) -> bool:
    ext = Path(path).suffix.lower().lstrip(".")
    return ext in {"mp4", "avi", "mov", "mkv"}


ALLOWED_EXTS = {"mp4", "avi", "mov", "mkv", "wav", "mp3", "m4a", "flac"}

app = FastAPI(title="Stuttering Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


_MODEL = load_model(MODEL_ABS_PATH, DEVICE)
_PIPELINE = StutterPipeline(model=_MODEL, device=DEVICE, sample_rate=SAMPLE_RATE)


@app.get("/health")
def health():
    return {"status": "ok", "device": str(_PIPELINE.device)}


@app.post("/infer")
async def infer(file: UploadFile = File(...)):
    filename = file.filename or "uploaded"
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Supported: {sorted(ALLOWED_EXTS)}",
        )

    input_tmp: Optional[str] = None
    audio_tmp: Optional[str] = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as f:
            input_tmp = f.name
            content = await file.read()
            if not content:
                raise ValueError("Uploaded file is empty.")
            f.write(content)

        audio_path = input_tmp
        duration_sec: Optional[float] = None

        if _is_video(input_tmp):
            audio_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
            duration_sec = extract_audio(input_tmp, audio_tmp)
            audio_path = audio_tmp

        waveform = load_audio(audio_path, target_sr=SAMPLE_RATE)
        result = _PIPELINE.run(waveform)

        if duration_sec is not None:
            result.duration_sec = duration_sec

        return result
    except HTTPException:
        raise
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")
    finally:
        for p in [audio_tmp, input_tmp]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass
