@echo off
title Typing Game - Starting All Services
echo ================================================
echo           TYPING GAME - START ALL
echo ================================================
echo.

echo [1/3] Starting Backend Server...
echo ------------------------------------------------
cd /d "%~dp0typing-game-backend"
start "Backend Server" cmd /k "echo Backend Server Started && npm start"

echo.
echo [2/3] Waiting for Backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Frontend Development Server...
echo ------------------------------------------------
cd /d "%~dp0typing-game"
start "Frontend Server" cmd /k "echo Frontend Server Started && npm start"

echo.
echo ================================================
echo             ALL SERVICES STARTED!
echo ================================================
echo.
echo Backend Server: Running on port 5000
echo Frontend Server: Running on port 3000
echo.
echo Frontend will open automatically in your browser.
echo.
echo To stop all services, run: stop_all.bat
echo ================================================
echo.
pause
