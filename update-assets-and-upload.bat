@echo off
setlocal EnableExtensions

cd /d "%~dp0"

set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"

REM 如果标准路径没有 node.exe，就从 PATH 里找
if not exist "%NODE_EXE%" (
    set "NODE_EXE="
    for %%I in (node.exe) do set "NODE_EXE=%%~$PATH:I"
)

if not defined NODE_EXE (
    echo.
    echo 未找到 Node.js，请确认已经安装 Node.js，并且 node.exe 已加入 PATH。
    pause
    exit /b 1
)

echo 更新哈希文件 asset-manifest.json...
"%NODE_EXE%" "%~dp0build-asset-manifest.js"

if errorlevel 1 (
    echo.
    echo Failed to update asset-manifest.json.
    pause
    exit /b 1
)

echo.
echo 上传文件到 GitHub...
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