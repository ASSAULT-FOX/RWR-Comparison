@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo 正在同步远端变更...
git fetch origin main
if errorlevel 1 (
  echo.
  echo 拉取远端变更失败。
  pause
  exit /b 1
)

git merge origin/main
if errorlevel 1 (
  echo.
  echo 合并远端变更失败。请先解决冲突，然后重新运行此脚本。
  pause
  exit /b 1
)

echo 正在从 CSV 更新 JSON 数据...
node scripts/sync-csv-json.js csv-to-json
if errorlevel 1 (
  echo.
  echo 从 CSV 更新 JSON 数据失败。
  pause
  exit /b 1
)

echo 正在更新 asset-manifest.json...
node scripts/build-asset-manifest.js
if errorlevel 1 (
  echo.
  echo 更新 asset-manifest.json 失败。
  pause
  exit /b 1
)

echo.
echo 正在准备 Git 变更...
git add .
if errorlevel 1 (
  echo.
  echo git add 失败。
  pause
  exit /b 1
)

git diff --cached --quiet
if errorlevel 1 (
  echo 正在提交变更...
  git commit -m "Update assets"
  if errorlevel 1 (
    echo.
    echo git commit 失败。
    pause
    exit /b 1
  )
) else (
  echo 没有新的变更需要提交。
)

echo 正在推送到远端...
git push
if errorlevel 1 (
  echo.
  echo git push 失败。
  pause
  exit /b 1
)

echo.
echo 完成。
pause
