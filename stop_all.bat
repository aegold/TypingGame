@echo off
title Typing Game - Stopping All Services
echo ================================================
echo           TYPING GAME - STOP ALL
echo ================================================
echo.

echo [1/4] Stopping Node.js processes...
echo ------------------------------------------------
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js processes stopped
) else (
    echo ✗ No Node.js processes found
)

echo.
echo [2/4] Stopping React Development Server...
echo ------------------------------------------------
taskkill /f /im "cmd.exe" /fi "WINDOWTITLE eq Frontend Server*" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend server stopped
) else (
    echo ✗ Frontend server not found
)

echo.
echo [3/4] Stopping Backend Server...
echo ------------------------------------------------
taskkill /f /im "cmd.exe" /fi "WINDOWTITLE eq Backend Server*" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend server stopped
) else (
    echo ✗ Backend server not found
)

echo.
echo [4/4] Cleaning up remaining processes...
echo ------------------------------------------------
:: Kill any remaining npm processes
taskkill /f /im npm.exe >nul 2>&1
:: Kill any remaining cmd windows with our titles
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq cmd.exe" /fo csv ^| find "cmd.exe"') do (
    taskkill /f /pid %%i >nul 2>&1
)

echo.
echo ================================================
echo          ALL SERVICES STOPPED!
echo ================================================
echo.
echo All Node.js processes have been terminated.
echo All command windows have been closed.
echo.
echo To start services again, run: start_all.bat
echo ================================================
echo.
echo Press any key to close this window...
pause >nul
