# Stuttering Detection Web App

This repository contains a full-stack stuttering detection web application:

- Backend: FastAPI inference service
- Frontend: React + Vite + TypeScript UI

## Quick start — run backend then frontend

### 1) Place the model checkpoint

Copy your checkpoint to:

- `stuttering-app/backend/models/best_model.pt`

> The backend does **not** download any model weights at runtime.

### 2) Run the backend

See `stuttering-app/backend/README.md` for step-by-step Windows setup.

### 3) Run the frontend

See `stuttering-app/frontend/README.md`.

## Sample curl command

```bash
curl -F "file=@sample.mp4" http://localhost:8000/infer
```
