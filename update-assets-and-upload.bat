@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

if not exist "ts\node_modules\typescript\bin\tsc" (
  echo Installing TypeScript dependencies...
  cmd /c npm --prefix ts install
  if errorlevel 1 (
    echo.
    echo Failed to install TypeScript dependencies.
    pause
    exit /b 1
  )
)

echo Compiling TypeScript...
cmd /c npm --prefix ts run build:ts
if errorlevel 1 (
  echo.
  echo Failed to compile TypeScript.
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
echo Preparing local Git changes...
git add .
if errorlevel 1 (
  echo.
  echo git add failed.
  pause
  exit /b 1
)

git diff --cached --quiet
if errorlevel 1 (
  echo Committing local changes...
  git commit -m "Update assets"
  if errorlevel 1 (
    echo.
    echo git commit failed.
    pause
    exit /b 1
  )
) else (
  echo No local changes to commit before sync.
)

echo.
echo Fetching remote player data...
git fetch origin main
if errorlevel 1 (
  echo.
  echo Failed to fetch remote changes.
  pause
  exit /b 1
)

git merge -s ours --no-commit origin/main
if errorlevel 1 (
  echo.
  echo Failed to record remote history. Please resolve conflicts and run this script again.
  pause
  exit /b 1
)

git checkout origin/main -- "data\rwr-players-pacific.json"
if errorlevel 1 (
  echo.
  echo Failed to restore data\rwr-players-pacific.json from origin/main.
  pause
  exit /b 1
)

echo Rebuilding assets after remote player data sync...
cmd /c npm --prefix ts run build:ts
if errorlevel 1 (
  echo.
  echo Failed to compile TypeScript after remote player data sync.
  pause
  exit /b 1
)

node scripts/build-asset-manifest.js
if errorlevel 1 (
  echo.
  echo Failed to update asset-manifest.json after remote player data sync.
  pause
  exit /b 1
)

git add .
if errorlevel 1 (
  echo.
  echo git add failed after remote sync.
  pause
  exit /b 1
)

if exist ".git\MERGE_HEAD" (
  echo Committing remote player data sync...
  git commit -m "Update assets"
  if errorlevel 1 (
    echo.
    echo remote player data sync commit failed.
    pause
    exit /b 1
  )
) else (
  git diff --cached --quiet
  if errorlevel 1 (
    echo Committing remote player data sync...
    git commit -m "Update assets"
    if errorlevel 1 (
      echo.
      echo remote player data sync commit failed.
      pause
      exit /b 1
    )
  ) else (
    echo No remote player data changes to commit.
  )
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
