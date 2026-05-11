@echo off
cd backend
echo Starting Backend Server...
.\mvnw.cmd spring-boot:run -DskipTests
pause
