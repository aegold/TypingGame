@echo off
title Typing Game - Quick Stop
echo Stopping all Typing Game services...

:: Kill all Node.js processes
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

:: Kill cmd windows for our servers
taskkill /f /im "cmd.exe" /fi "WINDOWTITLE eq Frontend Server*" >nul 2>&1
taskkill /f /im "cmd.exe" /fi "WINDOWTITLE eq Backend Server*" >nul 2>&1

echo All services stopped!
timeout /t 2 /nobreak >nul
