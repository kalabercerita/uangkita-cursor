@echo off
setlocal

:: Create temporary directory
set TEMP_DIR=%TEMP%\uangkita-08-temp
mkdir "%TEMP_DIR%" 2>nul

:: Copy package.json to temp directory
copy "package.json" "%TEMP_DIR%\" >nul

:: Install react-cropper and cropper in temp directory
cd "%TEMP_DIR%"
call npm install react-cropper@latest cropper@latest --no-package-lock

:: Copy packages to project
xcopy /E /I /H "%TEMP_DIR%\node_modules\react-cropper" "node_modules\react-cropper" >nul
xcopy /E /I /H "%TEMP_DIR%\node_modules\cropper" "node_modules\cropper" >nul

:: Clean up
cd "%~dp0"
rmdir /S /Q "%TEMP_DIR%"

echo react-cropper and cropper installed successfully!
pause 