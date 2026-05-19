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
echo Preparing Git changes...
git diff --quiet -- "data\rwr-players-pacific.json"
if errorlevel 1 (
  echo.
  echo data\rwr-players-pacific.json has local changes.
  echo This file is managed by GitHub Actions. Please discard or sync it before uploading other assets.
  pause
  exit /b 1
)

git add .
if errorlevel 1 (
  echo.
  echo git add failed.
  pause
  exit /b 1
)

if exist "data\rwr-players-pacific.json" (
  git reset -- "data\rwr-players-pacific.json"
  if errorlevel 1 (
    echo.
    echo Failed to exclude data\rwr-players-pacific.json from upload.
    pause
    exit /b 1
  )
)

git diff --cached --quiet
if errorlevel 1 (
  echo Committing changes...
  git commit -m "Update assets"
  if errorlevel 1 (
    echo.
    echo git commit failed.
    pause
    exit /b 1
  )
) else (
  echo No new changes to commit.
)

echo Running git push...
git push
if errorlevel 1 (
  echo.
  echo git push failed.
  pause
  exit /b 1
)

echo.
echo Done.
pause
