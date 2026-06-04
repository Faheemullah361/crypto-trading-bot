#!/usr/bin/env pwsh
# Simple PowerShell script to start backend from packaged JAR
Write-Host "Starting backend (PowerShell)" -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\backend"
$env:PORT = 10000
if (Test-Path "target\crypto-trading-app-1.0-SNAPSHOT.jar") {
    Write-Host "Starting backend on port $env:PORT..." -ForegroundColor Cyan
    & java -jar "target\crypto-trading-app-1.0-SNAPSHOT.jar"
} else {
    Write-Host "JAR not found in target\. Build first with: .\mvnw.cmd clean package -DskipTests" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}
