@echo off
title Crypto Trading App - Full Startup
color 0E
echo.
echo ========================================
echo   CRYPTO TRADING APP - FULL STARTUP
echo ========================================
echo.
echo Yeh script dono services start karega:
echo   1. Backend (Port 8080)
echo   2. Frontend (Port 5173)
echo.
echo 2 terminal windows khulenge.
echo Dono ko running rehne dein!
echo.
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Backend Server...
start "Crypto Backend" /D "%~dp0backend" cmd /k "call mvnw.cmd spring-boot:run -DskipTests"

echo.
echo Waiting 15 seconds for backend to initialize...
timeout /t 15 /nobreak >nul

echo.
echo [2/2] Starting Frontend...
start "Crypto Frontend" /D "%~dp0frontend" cmd /k "call npm run dev"

echo.
echo ========================================
echo   STARTUP COMPLETE!
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Browser mein kholen: http://localhost:5173
echo.
echo Dono terminals ko band na karein!
echo.
pause
