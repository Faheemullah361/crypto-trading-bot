@echo off
REM Simple script to start backend from packaged JAR
cd /d "%~dp0backend"
set PORT=10000
if exist "target\crypto-trading-app-1.0-SNAPSHOT.jar" (
  echo Starting backend on port %PORT%...
  java -jar "target\crypto-trading-app-1.0-SNAPSHOT.jar"
) else (
  echo JAR not found in target\. Build first:
  echo    .\mvnw.cmd clean package -DskipTests
  pause
)
