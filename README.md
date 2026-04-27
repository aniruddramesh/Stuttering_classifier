# Stuttering Detection Web App

This is a full-stack web application for detecting stuttering in audio/video files.
https://github.com/aniruddramesh/Stuttering_classifier
- **Backend**: FastAPI inference service (Python)
- **Frontend**: React + Vite + TypeScript web interface

---

## 📋 Prerequisites

Before you begin, install these tools:

1. **Git** - Download from [git-scm.com](https://git-scm.com/download/win) (used to download the code)
2. **Python** - Download from [python.org](https://www.python.org/downloads/) (version 3.8+)
3. **Node.js** - Download from [nodejs.org](https://nodejs.org/) (includes npm, needed for frontend)

> Check if these are installed by opening a terminal/PowerShell and running:
> ```bash
> git --version
> python --version
> node --version
> ```

---

## 🚀 Setup Instructions

### Step 1: Clone the Repository

1. Open **PowerShell** (right-click on desktop → "Open PowerShell here")
2. Copy this command and paste it into PowerShell:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Stuttering_classifier.git
   cd Stuttering_classifier
   ```
3. Press **Enter** - this downloads all the code files

### Step 2: Place the Model File

The application needs a trained model file to work:

1. Get the `best_model.pt` file (ask the project owner)
2. Copy it to: `backend/models/best_model.pt`
3. Create the folder if it doesn't exist

> ⚠️ The model file is NOT included in GitHub because it's too large.

### Step 3: Set Up and Run the Backend

1. Open **PowerShell** and navigate to the backend folder:
   ```bash
   cd Stuttering_classifier/backend
   ```

2. Create a Python virtual environment (keeps dependencies isolated):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   .\venv\Scripts\Activate.ps1
   ```
   > Your terminal should now show `(venv)` at the start

4. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

> You should see: `Uvicorn running on http://127.0.0.1:8000`
> Leave this terminal running!

### Step 4: Set Up and Run the Frontend

1. **Open a new PowerShell window** (don't close the backend one!)

2. Navigate to the frontend folder:
   ```bash
   cd Stuttering_classifier/frontend
   ```

3. Install frontend dependencies:
   ```bash
   npm install
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

> You should see: `Local: http://localhost:5173`

### Step 5: Use the Application

1. Open your web browser and go to: `http://localhost:5173`
2. Upload an audio or video file
3. Wait for the analysis to complete
4. View the stuttering detection results

---

## 🛑 Stopping the Application

- **Backend**: Press `Ctrl + C` in the backend terminal
- **Frontend**: Press `Ctrl + C` in the frontend terminal

---

## 🔧 Troubleshooting

### "Python not found"
- Make sure Python is installed and added to your PATH
- Restart your terminal after installing Python

### "npm not found"
- Make sure Node.js is installed (npm comes with it)
- Restart your terminal after installing Node.js

### "Module not found" errors
- Make sure you're in the `backend` folder
- Make sure the virtual environment is activated (you should see `(venv)`)
- Reinstall packages: `pip install -r requirements.txt`

### "Port 8000 already in use"
- Close any other applications using port 8000
- Or change the port in the command: `--port 8001`

### "No module named 'app'"
- Make sure you're in the `backend` folder when running the backend command

---

## 📝 Additional Notes

- **Model file**: Not included in GitHub. You must add `best_model.pt` to `backend/models/`
- **Keep both terminals open**: The backend and frontend need to run simultaneously
- **API**: Backend runs on `http://localhost:8000`, Frontend on `http://localhost:5173`

### Sample API command (for testing):
```bash
curl -F "file=@sample.mp4" http://localhost:8000/infer
```

---

## 📚 For More Details

- Backend setup: See [backend/README.md](backend/README.md)
- Frontend setup: See [frontend/README.md](frontend/README.md)
