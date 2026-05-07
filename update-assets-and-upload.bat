@echo off
setlocal EnableExtensions
chcp 65001 >nul

pushd "%~dp0" || (
    echo 当前目录切换失败：%~dp0
    pause
    exit /b 1
)

set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"

REM 如果标准路径没有 node.exe，就从 PATH 里找
if not exist "%NODE_EXE%" (
    set "NODE_EXE="
    for /f "delims=" %%I in ('where node.exe 2^>nul') do (
        if not defined NODE_EXE set "NODE_EXE=%%I"
    )
)

if not defined NODE_EXE (
    echo.
    echo 未找到 Node.js，请确认已经安装 Node.js，并且 node.exe 已加入 PATH。
    popd
    pause
    exit /b 1
)

echo 更新哈希文件 asset-manifest.json...
"%NODE_EXE%" "%CD%\build-asset-manifest.js"

if errorlevel 1 (
    echo.
    echo Failed to update asset-manifest.json.
    popd
    pause
    exit /b 1
)

echo.
echo 上传文件到 GitHub...
git upup

if errorlevel 1 (
    echo.
    echo git upup failed.
    popd
    pause
    exit /b 1
)

echo.
echo Done.
popd
pause
exit /b 0