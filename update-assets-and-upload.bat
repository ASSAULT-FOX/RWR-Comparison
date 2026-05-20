@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

set "BRANCH=main"
set "SAFE_DIR=%CD:\=/%"

call :initColors
@echo off

call :logStep "准备 Git 环境..."
git config --global --add safe.directory "%SAFE_DIR%" >nul 2>nul
git status --short >nul 2>nul
if errorlevel 1 (
  echo.
  call :logError "Git 仓库检查失败。"
  git status --short
  pause
  exit /b 1
)

if exist ".git\rebase-merge" (
  echo.
  call :logError "检测到 Git rebase 正在进行中。请先执行 git rebase --abort 或完成 rebase 后再运行本脚本。"
  pause
  exit /b 1
)

if exist ".git\rebase-apply" (
  echo.
  call :logError "检测到 Git rebase/apply 正在进行中。请先执行 git rebase --abort 或完成操作后再运行本脚本。"
  pause
  exit /b 1
)

if exist ".git\MERGE_HEAD" (
  echo.
  call :logError "检测到 Git merge 正在进行中。请先执行 git merge --abort 或完成 merge 后再运行本脚本。"
  pause
  exit /b 1
)

if not exist "ts\node_modules\typescript\bin\tsc" (
  call :logStep "缺少 TypeScript 依赖，正在安装..."
  cmd /c npm --prefix ts install
  if errorlevel 1 (
    echo.
    call :logError "TypeScript 依赖安装失败。"
    pause
    exit /b 1
  )
)

call :logStep "正在编译 TypeScript..."
cmd /c npm --prefix ts run build:ts
if errorlevel 1 (
  echo.
  call :logError "TypeScript 编译失败。"
  pause
  exit /b 1
)

call :logStep "正在从 CSV 更新 JSON 数据..."
node scripts/sync-csv-json.js csv-to-json
if errorlevel 1 (
  echo.
  call :logError "CSV 转 JSON 失败。"
  pause
  exit /b 1
)

call :logStep "正在更新 asset-manifest.json..."
node scripts/build-asset-manifest.js
if errorlevel 1 (
  echo.
  call :logError "更新 asset-manifest.json 失败。"
  pause
  exit /b 1
)

echo.
call :logStep "正在获取远端状态，用于判断提交类型..."
call :fetchRemoteState
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
call :logStep "正在暂存本地 Git 变更..."
git add .
if errorlevel 1 (
  echo.
  call :logError "git add 失败。"
  pause
  exit /b 1
)

call :commitStagedChanges "提交本地构建结果"
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
call :logStep "正在检查并合并远端更新..."
call :syncRemoteBeforePush
if errorlevel 1 (
  pause
  exit /b 1
)

call :logStep "远端同步检查后，正在重新编译 TypeScript..."
cmd /c npm --prefix ts run build:ts
if errorlevel 1 (
  echo.
  call :logError "远端同步检查后的 TypeScript 编译失败。"
  pause
  exit /b 1
)

call :logStep "远端同步检查后，正在重新生成 asset-manifest.json..."
node scripts/build-asset-manifest.js
if errorlevel 1 (
  echo.
  call :logError "远端同步检查后的 asset-manifest.json 更新失败。"
  pause
  exit /b 1
)

git add .
if errorlevel 1 (
  echo.
  call :logError "远端同步检查后的 git add 失败。"
  pause
  exit /b 1
)

if exist ".git\MERGE_HEAD" (
  call :commitMergeChanges "提交远端合并结果"
  if errorlevel 1 (
    pause
    exit /b 1
  )
) else (
  call :commitStagedChanges "提交同步后的变更"
  if errorlevel 1 (
    pause
    exit /b 1
  )
)

call :logStep "正在推送到远端..."
git push origin %BRANCH%
if errorlevel 1 (
  echo.
  call :logError "git push 失败。"
  pause
  exit /b 1
)

echo.
call :logSuccess "完成。"
pause
exit /b 0

:syncRemoteBeforePush
call :fetchRemoteState
if errorlevel 1 (
  exit /b 1
)

git merge-base --is-ancestor origin/%BRANCH% HEAD
if not errorlevel 1 (
  call :logInfo "远端历史已经包含在本地提交中，无需合并。"
  exit /b 0
)

for /f %%A in ('git rev-list --count HEAD..origin/%BRANCH%') do set "REMOTE_NEW_COMMITS=%%A"
call :logWarn "远端有 %REMOTE_NEW_COMMITS% 个新提交，上传前先合并 origin/%BRANCH%..."

git merge --no-ff --no-commit origin/%BRANCH%
if not errorlevel 1 (
  call :logSuccess "远端更新已合并到本地。提交合并前会重新构建资源。"
  exit /b 0
)

call :resolveKnownMergeConflicts
if errorlevel 1 (
  exit /b 1
)

call :logSuccess "已自动解决已知生成物/玩家数据冲突。提交合并前会重新构建资源。"
exit /b 0

:resolveKnownMergeConflicts
set "CONFLICT_LIST=%TEMP%\rwr-upload-conflicts-%RANDOM%.txt"
git diff --name-only --diff-filter=U > "%CONFLICT_LIST%"

for /f "usebackq delims=" %%F in ("%CONFLICT_LIST%") do (
  if /i not "%%F"=="data/asset-manifest.json" if /i not "%%F"=="data/rwr-players-pacific.json" if /i not "%%F"=="data/rwr-players-pacific.meta.json" (
    echo.
    call :logError "自动合并停止：以下文件存在真实冲突，需要手动处理。"
    call :logError "%%F"
    call :logWarn "请解决冲突后重新运行本脚本。"
    del "%CONFLICT_LIST%" >nul 2>nul
    exit /b 1
  )
)

findstr /x /c:"data/asset-manifest.json" "%CONFLICT_LIST%" >nul 2>nul
if not errorlevel 1 (
  call :logWarn "正在处理生成物冲突：data/asset-manifest.json 保留本地版本，稍后重新生成。"
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
  call :logWarn "正在处理玩家数据冲突：data/rwr-players-pacific.json 采用远端 GitHub Actions 版本。"
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
  call :logWarn "正在处理玩家哈希元数据冲突：data/rwr-players-pacific.meta.json 采用远端 GitHub Actions 版本。"
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

:fetchRemoteState
git fetch origin %BRANCH%
if errorlevel 1 (
  echo.
  call :logError "获取远端更新失败。"
  exit /b 1
)
exit /b 0

:commitStagedChanges
set "COMMIT_LABEL=%~1"
git diff --cached --quiet
if not errorlevel 1 (
  call :logInfo "%COMMIT_LABEL%：没有需要提交的变更。"
  exit /b 0
)

call :chooseCommitMessage
call :logStep "%COMMIT_LABEL%：提交信息为“%COMMIT_MESSAGE%”。"
git commit -m "%COMMIT_MESSAGE%"
if errorlevel 1 (
  echo.
  call :logError "%COMMIT_LABEL%失败。"
  exit /b 1
)
exit /b 0

:commitMergeChanges
set "COMMIT_LABEL=%~1"
call :chooseCommitMessage
call :logStep "%COMMIT_LABEL%：提交信息为“%COMMIT_MESSAGE%”。"
git commit -m "%COMMIT_MESSAGE%"
if errorlevel 1 (
  echo.
  call :logError "%COMMIT_LABEL%失败。"
  exit /b 1
)
exit /b 0

:chooseCommitMessage
set "COMMIT_MESSAGE=功能增加或修复"
for /f "delims=" %%F in ('git diff --cached --name-only --diff-filter=ACMRT') do (
  git cat-file -e "origin/%BRANCH%:%%F" >nul 2>nul
  if errorlevel 1 set "COMMIT_MESSAGE=新增文件"
)
exit /b 0

:initColors
for /F "delims=" %%A in ('powershell -NoProfile -Command "[char]27"') do set "ESC=%%A"
if defined ESC (
  set "COLOR_RESET=%ESC%[0m"
  set "COLOR_STEP=%ESC%[96m"
  set "COLOR_INFO=%ESC%[94m"
  set "COLOR_SUCCESS=%ESC%[92m"
  set "COLOR_WARN=%ESC%[93m"
  set "COLOR_ERROR=%ESC%[91m"
) else (
  set "COLOR_RESET="
  set "COLOR_STEP="
  set "COLOR_INFO="
  set "COLOR_SUCCESS="
  set "COLOR_WARN="
  set "COLOR_ERROR="
)
exit /b 0

:logStep
echo(%COLOR_STEP%[步骤] %~1%COLOR_RESET%
exit /b 0

:logInfo
echo(%COLOR_INFO%[信息] %~1%COLOR_RESET%
exit /b 0

:logSuccess
echo(%COLOR_SUCCESS%[成功] %~1%COLOR_RESET%
exit /b 0

:logWarn
echo(%COLOR_WARN%[注意] %~1%COLOR_RESET%
exit /b 0

:logError
echo(%COLOR_ERROR%[错误] %~1%COLOR_RESET%
exit /b 0
