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
call :syncRemoteBeforePush
if errorlevel 1 (
  pause
  exit /b 1
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
exit /b 0

:syncRemoteBeforePush
git fetch origin %BRANCH%
if errorlevel 1 (
  echo.
  echo Failed to fetch remote changes.
  exit /b 1
)

git merge-base --is-ancestor origin/%BRANCH% HEAD
if not errorlevel 1 (
  echo Remote history is already included locally.
  exit /b 0
)

for /f %%A in ('git rev-list --count HEAD..origin/%BRANCH%') do set "REMOTE_NEW_COMMITS=%%A"
echo Remote has %REMOTE_NEW_COMMITS% new commit(s). Merging origin/%BRANCH% before upload...

git merge --no-ff --no-commit origin/%BRANCH%
if not errorlevel 1 (
  echo Remote changes merged locally. Assets will be rebuilt before committing the merge.
  exit /b 0
)

call :resolveKnownMergeConflicts
if errorlevel 1 (
  exit /b 1
)

echo Known generated/data conflicts were resolved. Assets will be rebuilt before committing the merge.
exit /b 0

:resolveKnownMergeConflicts
set "CONFLICT_LIST=%TEMP%\rwr-upload-conflicts-%RANDOM%.txt"
git diff --name-only --diff-filter=U > "%CONFLICT_LIST%"

for /f "usebackq delims=" %%F in ("%CONFLICT_LIST%") do (
  if /i not "%%F"=="data/asset-manifest.json" if /i not "%%F"=="data/rwr-players-pacific.json" if /i not "%%F"=="data/rwr-players-pacific.meta.json" (
    echo.
    echo Automatic merge stopped because this file has a real conflict:
    echo   %%F
    echo Resolve it manually, then run this script again.
    del "%CONFLICT_LIST%" >nul 2>nul
    exit /b 1
  )
)

findstr /x /c:"data/asset-manifest.json" "%CONFLICT_LIST%" >nul 2>nul
if not errorlevel 1 (
  echo Resolving generated data/asset-manifest.json conflict...
  git checkout --ours -- "data\asset-manifest.json"
  if errorlevel 1 (
    del "%CONFLICT_LIST%" >nul 2>nul
    exit /b 1
  )
  git add "data\asset-manifest.json"
  if errorlevel 1 (
    del "%CONFLICT_LIST%" >nul 2>nul
    exit /b 1
  )
)

findstr /x /c:"data/rwr-players-pacific.json" "%CONFLICT_LIST%" >nul 2>nul
if not errorlevel 1 (
  echo Resolving data/rwr-players-pacific.json with remote GitHub Actions stream data...
  git checkout --theirs -- "data\rwr-players-pacific.json"
  if errorlevel 1 (
    del "%CONFLICT_LIST%" >nul 2>nul
    exit /b 1
  )
  git add "data\rwr-players-pacific.json"
  if errorlevel 1 (
    del "%CONFLICT_LIST%" >nul 2>nul
    exit /b 1
  )
)

findstr /x /c:"data/rwr-players-pacific.meta.json" "%CONFLICT_LIST%" >nul 2>nul
if not errorlevel 1 (
  echo Resolving data/rwr-players-pacific.meta.json with remote GitHub Actions stream metadata...
  git checkout --theirs -- "data\rwr-players-pacific.meta.json"
  if errorlevel 1 (
    del "%CONFLICT_LIST%" >nul 2>nul
    exit /b 1
  )
  git add "data\rwr-players-pacific.meta.json"
  if errorlevel 1 (
    del "%CONFLICT_LIST%" >nul 2>nul
    exit /b 1
  )
)

del "%CONFLICT_LIST%" >nul 2>nul
exit /b 0
