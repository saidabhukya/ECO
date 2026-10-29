@echo off
title ECO TRACK - Launching System
echo ========================================================
echo   Launching ECO TRACK - Employee Management System
echo   Tagline: Track Employees. Manage Work. Drive Performance.
echo ========================================================
echo.

echo [1/2] Starting Backend API Server (Port 5000)...
start "ECO TRACK Backend" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Vite Client (Port 5173)...
start "ECO TRACK Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   ECO TRACK is running!
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:5000
echo ========================================================
echo Opening browser...
start http://localhost:5173

pause
