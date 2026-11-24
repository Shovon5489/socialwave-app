@echo off
title Push SocialWave to GitHub
echo ====================================================
echo   Pushing SocialWave Project to GitHub Repository
echo   Target: https://github.com/Shovon5489/socialwave-app
echo ====================================================
echo.

cd /d "C:\Users\stead\.gemini\antigravity\scratch\socialwave"

echo Current Git Status:
git status -s
echo.
echo Pushing to branch main...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================================
    echo   SUCCESS! All files are uploaded to GitHub:
    echo   https://github.com/Shovon5489/socialwave-app
    echo ====================================================
) else (
    echo.
    echo If permission was denied, make sure you are logged into
    echo account 'Shovon5489' in your browser.
)
echo.
pause
