@echo off
title Model Evaluation & Accuracy Metrics
color 0a

echo ======================================================================
echo             LOAN RISK RANDOM FOREST - EVALUATION METRICS
echo ======================================================================
echo.

cd /d "%~dp0"

echo Running python ml/evaluate_model.py ...
echo.
python ml\evaluate_model.py

echo.
pause
