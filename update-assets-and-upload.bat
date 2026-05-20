@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "BRANCH=main"
set "SAFE_DIR=%CD:\=/%"

echo Preparing Git environment...
git config --global --add safe.directory "%SAFE_DIR%" >nul 2>nul
git status --short >nul 2>nul
if errorlevel 1 (
  echo.
  echo Git repository check failed.
  git status --short
  pause
  exit /b 1
)

if exist ".git\rebase-merge" (
  echo.
  echo A Git rebase is already in progress. Run "git rebase --abort" or finish it, then run this script again.
  pause
  exit /b 1
)

if exist ".git\rebase-apply" (
  echo.
  echo A Git rebase or apply operation is already in progress. Run "git rebase --abort" or finish it, then run this script again.
  pause
  exit /b 1
)

if exist ".git\MERGE_HEAD" (
  echo.
  echo A Git merge is already in progress. Run "git merge --abort" or finish it, then run this script again.
  pause
  exit /b 1
)

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
echo Fetching remote changes...
git fetch origin %BRANCH%
if errorlevel 1 (
  echo.
  echo Failed to fetch remote changes.
  pause
  exit /b 1
)

git merge-base --is-ancestor origin/%BRANCH% HEAD
if errorlevel 1 (
  echo Merging remote history and keeping remote player data...
  git merge -s ours --no-commit origin/%BRANCH%
  if errorlevel 1 (
    echo.
    echo Failed to record remote history. Please resolve conflicts and run this script again.
    pause
    exit /b 1
  )

  git cat-file -e origin/%BRANCH%:data/rwr-players-pacific.json
  if not errorlevel 1 (
    git checkout origin/%BRANCH% -- "data\rwr-players-pacific.json"
    if errorlevel 1 (
      echo.
      echo Failed to restore data\rwr-players-pacific.json from origin/%BRANCH%.
      pause
      exit /b 1
    )
  )

  git cat-file -e origin/%BRANCH%:data/rwr-players-pacific.meta.json
  if not errorlevel 1 (
    git checkout origin/%BRANCH% -- "data\rwr-players-pacific.meta.json"
    if errorlevel 1 (
      echo.
      echo Failed to restore data\rwr-players-pacific.meta.json from origin/%BRANCH%.
      pause
      exit /b 1
    )
  )
) else (
  echo Remote history is already included locally.
)

echo Rebuilding assets after remote sync check...
cmd /c npm --prefix ts run build:ts
if errorlevel 1 (
  echo.
  echo Failed to compile TypeScript after remote sync check.
  pause
  exit /b 1
)

node scripts/build-asset-manifest.js
if errorlevel 1 (
  echo.
  echo Failed to update asset-manifest.json after remote sync check.
  pause
  exit /b 1
)

git add .
if errorlevel 1 (
  echo.
  echo git add failed after remote sync check.
  pause
  exit /b 1
)

if exist ".git\MERGE_HEAD" (
  echo Committing remote sync...
  git commit -m "Update assets"
  if errorlevel 1 (
    echo.
    echo remote sync commit failed.
    pause
    exit /b 1
  )
) else (
  git diff --cached --quiet
  if errorlevel 1 (
    echo Committing post-sync changes...
    git commit -m "Update assets"
    if errorlevel 1 (
      echo.
      echo post-sync commit failed.
      pause
      exit /b 1
    )
  ) else (
    echo No post-sync changes to commit.
  )
)

echo Running git push...
git push origin %BRANCH%
if errorlevel 1 (
  echo.
  echo git push failed.
  pause
  exit /b 1
)

echo.
echo Done.
pause
