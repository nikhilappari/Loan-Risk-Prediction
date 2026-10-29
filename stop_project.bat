@echo off
title Stop Loan Risk Assessment Services
color 0c

echo ======================================================================
echo           STOPPING LOAN RISK ASSESSMENT SERVICES
echo ======================================================================
echo.

echo Terminating processes on Port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Terminating processes on Port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [DONE] Both Backend and Frontend services stopped.
echo.
pause
