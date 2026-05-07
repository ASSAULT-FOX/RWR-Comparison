@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo 更新哈希文件 asset-manifest.json...
node build-asset-manifest.js
if errorlevel 1 (
  echo.
  echo Failed to update asset-manifest.json.
  pause
  exit /b 1
)

echo.
echo 上传文件到GitHub...
git upup
if errorlevel 1 (
  echo.
  echo git upup failed.
  pause
  exit /b 1
)

echo.
echo Done.
pause
