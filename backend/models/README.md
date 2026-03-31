# Models

This folder contains model checkpoint files used by the backend.

## Required file

- `best_model.pt`

This file is **not committed to git** (checkpoint files like `*.pt` are ignored).

## How to run the backend

1. Place your model at:

   - `backend/models/best_model.pt`

2. Start the backend from the `backend/` folder:

   - `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

If you change the model path, update `MODEL_PATH` in `backend/config.py`.
