@echo off
title Crypto Trading Frontend
color 0B
echo.
echo ========================================
echo   CRYPTO TRADING FRONTEND
echo ========================================
echo.
echo Pehle backend start karein (START_BACKEND.bat)
echo Phir yeh script chalayein
echo.
echo Browser mein kholen: http://localhost:5173
echo.
echo ========================================
echo.

cd /d "%~dp0frontend"

echo Checking if npm is installed...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found! Please install Node.js
    pause
    exit /b 1
)

echo Installing dependencies if needed...
if not exist node_modules (
    echo Installing npm packages...
    call npm install
)

echo.
echo Starting frontend development server...
echo.
call npm run dev

pause
