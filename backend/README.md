# Backend (FastAPI)

## Windows setup step by step

1. Install Python 3.10+
2. (Recommended) Install **Microsoft Visual C++ Redistributable 2015–2022 (x64)**

   - This is required by PyTorch on Windows.
   - If you see `WinError 1114` while importing `torch` (e.g., `c10.dll` / `vcomp140.dll`), this is the fix.
   - You may need admin rights to install it.

   Alternative (no admin): the code adds common venv DLL folders (including `.libs` folders from scientific Python wheels) to the DLL search path automatically.

3. ffmpeg setup (required for video → audio extraction)

   Option A (no system install; easiest): use a bundled ffmpeg via pip

   - This project will auto-detect ffmpeg from the `imageio-ffmpeg` package.
   - Just install dependencies in step 6 (it includes `imageio-ffmpeg`).

   Option B: install ffmpeg system-wide and add to PATH

   - Download from https://ffmpeg.org/
   - Add the `bin/` folder to your Windows PATH

   Option C: set an explicit path

   - Set `FFMPEG_PATH` to the full path of `ffmpeg.exe`
     (example: `C:\\ffmpeg\\bin\\ffmpeg.exe`)

4. Create a virtual environment:

   ```powershell
   cd stuttering-app\backend
   python -m venv .venv
   ```

5. Activate it:

   ```powershell
   .venv\Scripts\activate
   ```

6. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

7. Copy best_model.pt to backend/models/best_model.pt

   - `stuttering-app/backend/models/best_model.pt`
   - Note: model checkpoint files (`*.pt`) are not committed to git. Keep them locally.

8. Run the server (run from the `stuttering-app\backend` folder):

   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   If you want to run it from the workspace root instead, use `--app-dir`:

   ```powershell
   uvicorn app.main:app --app-dir stuttering-app\backend --host 0.0.0.0 --port 8000 --reload
   ```

Note: first startup slow — building model from checkpoint
