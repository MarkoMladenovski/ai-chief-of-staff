@echo off
echo Starting AI Chief of Staff backend...
cd /d "%~dp0backend"
echo Working directory: %CD%
echo.
npm start
echo.
echo === Server stopped (exit code: %ERRORLEVEL%) ===
pause
