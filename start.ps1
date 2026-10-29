Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching ECO TRACK - Employee Management System" -ForegroundColor Red
Write-Host "  Tagline: Track Employees. Manage Work. Drive Performance." -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

Write-Host "[1/2] Starting Backend API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm start"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Frontend Vite Client (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  ECO TRACK is running!" -ForegroundColor Green
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green

Start-Process "http://localhost:5173"
