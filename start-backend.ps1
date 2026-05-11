#!/usr/bin/env pwsh
# Crypto Trading Backend Startup Script

Write-Host "Starting Crypto Trading Backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend"

# Start Spring Boot on alternate port to avoid conflicts
$port = 8081
Write-Host "Starting Spring Boot on port $port..." -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run -DskipTests "-Dspring-boot.run.arguments=--server.port=$port"

# Keep terminal open if error occurs
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend failed to start!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
