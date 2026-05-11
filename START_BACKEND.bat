@echo off
title Crypto Trading Backend Server
color 0A
echo.
echo ========================================
echo   CRYPTO TRADING BACKEND SERVER
echo ========================================
echo.
echo Starting backend on port 8080...
echo.
echo IMPORTANT: Is window ko band na karein!
echo Backend chalta rehna chahiye.
echo.
echo Frontend separate terminal mein chalayein:
echo   cd frontend
echo   npm run dev
echo.
echo ========================================
echo.

cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run -DskipTests

pause
