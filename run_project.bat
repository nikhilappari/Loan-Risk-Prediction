@echo off
title Intelligent Loan Risk Assessment - Launcher
color 0b

echo ======================================================================
echo           INTELLIGENT LOAN RISK ASSESSMENT SYSTEM
echo           Model: Random Forest Classifier (91.0%% Holdout Accuracy)
echo ======================================================================
echo.

:: Ensure current working directory is the project root
cd /d "%~dp0"

:: 1. Check Python
echo [1/4] Checking Python installation...
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not found in your PATH!
    echo Please install Python 3.11+ and add it to your PATH.
    pause
    exit /b 1
)
python --version

:: 2. Check Node.js & npm
echo.
echo [2/4] Checking Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not found in your PATH!
    echo Please install Node.js 22.12+ from https://nodejs.org/
    pause
    exit /b 1
)
node --version

:: 3. Check / Train Model Artifact
echo.
echo [3/4] Verifying Machine Learning Model...
if not exist "model\loan_risk_pipeline.joblib" (
    echo [INFO] Model artifact not found. Training Random Forest model now...
    python ml\train_model.py
    if errorlevel 1 (
        echo [ERROR] Model training failed!
        pause
        exit /b 1
    )
) else (
    echo [OK] Trained Random Forest pipeline found in model\
)

:: 4. Start Backend & Frontend Servers
echo.
echo [4/4] Launching application services...
echo Starting FastAPI Backend on port 8000...
start "Loan Risk Backend (FastAPI)" /d "%~dp0" cmd /k python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

echo Starting React + Vite Frontend on port 5173...
start "Loan Risk Frontend (Vite/React)" /d "%~dp0frontend" cmd /k npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort

echo.
echo Waiting 4 seconds for services to initialize...
timeout /t 4 /nobreak >nul

echo Opening browser at http://127.0.0.1:5173 ...
start http://127.0.0.1:5173

echo.
echo ======================================================================
echo  Services launched. Check the server windows for startup errors.
echo   - Frontend: http://127.0.0.1:5173
echo   - Backend:  http://127.0.0.1:8000
echo   - API Docs: http://127.0.0.1:8000/docs
echo.
echo  To shut down, simply close the opened Backend and Frontend command windows.
echo ======================================================================
echo.
pause
