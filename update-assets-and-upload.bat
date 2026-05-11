@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo Updating JSON data from CSV...
node scripts/sync-csv-json.js csv-to-json
if errorlevel 1 (
  echo.
  echo Failed to update JSON data from CSV.
  pause
  exit /b 1
)

echo Updating asset-manifest.json...
node scripts/build-asset-manifest.js
if errorlevel 1 (
  echo.
  echo Failed to update asset-manifest.json.
  pause
  exit /b 1
)

echo.
echo Running git upup...
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
