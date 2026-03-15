@echo off
title Hikmat - Philosophy AI Live Tutor
color 0B
echo.
echo  ========================================
echo       حکمت - فلسفہ و منطق کا AI ٹیوٹر
echo  ========================================
echo.
echo  سرور شروع ہو رہا ہے...
echo  براؤزر خود کھل جائے گا۔
echo.
echo  بند کرنے کے لیے یہ ونڈو بند کریں۔
echo  ========================================
echo.

:: Open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8080"

:: Start vision server in a new window
start "Wisdom Eye Vision Server" cmd /c "cd vision && node server.js"

:: Start main unified server
cd /d "%~dp0"
node server.js
