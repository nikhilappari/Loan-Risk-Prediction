@echo off
title Machine Learning Model Comparison & Leaderboard
color 0b

echo ======================================================================
echo           MACHINE LEARNING MODEL BENCHMARKING & COMPARISON
echo ======================================================================
echo.

cd /d "%~dp0"

echo Running python ml/compare_models.py ...
echo.
python ml\compare_models.py

echo.
pause
