@echo off
echo ==============================================
echo   Starting SocialWave Social Media Platform
echo ==============================================
echo.

start "SocialWave Backend API (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"
start "SocialWave Frontend App (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Servers are launching in separate windows!
echo - Backend API:  http://localhost:5000
echo - Frontend App: http://localhost:5173
echo.
pause
