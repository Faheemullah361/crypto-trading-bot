@echo off
cd /d "%~dp0backend"
echo Starting Backend...
call mvnw.cmd spring-boot:run -DskipTests "-Dspring-boot.run.arguments=--server.port=8081"
pause
