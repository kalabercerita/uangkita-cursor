@echo off
setlocal enabledelayedexpansion

:: Create temporary directory
set "TEMP_DIR=%TEMP%\uangkita-08"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

:: Copy package.json to temp directory
copy "package.json" "%TEMP_DIR%"

:: Install dependencies in temp directory
cd /d "%TEMP_DIR%"
call npm install

:: Copy node_modules back to project
xcopy /E /I /H "%TEMP_DIR%\node_modules" "node_modules"

:: Return to project directory and run the app
cd /d "%~dp0"
call npm run dev 