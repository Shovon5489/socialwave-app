@echo off
echo ==============================================
echo   Seeding SocialWave Database with Test Data
echo ==============================================
echo.

cd /d %~dp0backend
node src/utils/seedData.js

echo.
pause
