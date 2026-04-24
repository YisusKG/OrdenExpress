@echo off
title 🎓 Lanzador Maestro OrdenExpress - Desarrollo Software II
color 0B

echo.
echo ==========================================
echo    🚀 INICIANDO ECOSISTEMA ORDENEXPRESS
echo ==========================================
echo.

REM 1. API .NET (Puerto ~7000)
echo [1/3] 🚀 API .NET Core + JWT + Stripe...
start "API .NET OrdenExpress" cmd /k "cd OrdenExpressAPI && dotnet run"

REM Esperar 3s
timeout /t 3 /nobreak >nul

REM 2. Backend Node.js + Socket.io (Puerto 3000)
echo [2/3] 🔌 Servidor Node + Real-time Sockets...
start "Node Server + Sockets" cmd /k "node server.js"

REM Esperar 2s
timeout /t 2 /nobreak >nul

REM 3. Frontend npm (Puerto 5000) Auto-refresh!
echo [3/3] 🎨 Frontend + npm start + Live Reload...
start "Frontend Live" cmd /k "npm start"

REM Abrir navegador
timeout /t 5 /nobreak >nul
start http://localhost:5000

echo.
echo ==========================================
echo    🎉 TODO FUNCIONANDO! URLs:
echo    🔹 Frontend: http://localhost:5000
echo    🔹 API Swagger: https://localhost:7xxx/swagger
echo    🔹 Backend Node: http://localhost:3000
echo ==========================================
echo.
pause

