@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo Syncing remote changes...
git fetch origin main
if errorlevel 1 (
  echo.
  echo Failed to fetch remote changes.
  pause
  exit /b 1
)

git merge origin/main
if errorlevel 1 (
  echo.
  echo Failed to merge remote changes. Please resolve conflicts and run this script again.
  pause
  exit /b 1
)

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
git add .
if errorlevel 1 (
  echo.
  echo git add failed.
  pause
  exit /b 1
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
