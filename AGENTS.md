# AGENTS.md

本文件是本项目给 Codex/代理工具使用的工作说明。除非用户另有明确要求，项目内的自动化、脚本和文件编辑都按这里执行。

## Shell

- 默认使用 PowerShell 7：
  - `E:\ReverseCode\PowerShell-7.6.1\pwsh.exe`
- 运行命令时优先使用：
  - `E:\ReverseCode\PowerShell-7.6.1\pwsh.exe -NoLogo -NoProfile -Command "<command>"`
- 不要默认改用 Windows PowerShell 5.1、Git Bash、cmd 或 WSL，除非用户明确要求，或某个工具只能在对应 shell 中运行。
- PowerShell 脚本应兼容 PowerShell 7。涉及编码时使用 PowerShell 7 的编码名称，例如 `utf8NoBOM`、`utf8BOM`。

## Encoding And Line Endings

本项目不再使用 `.editorconfig`。编码和换行约定以本节为准；不要因为打开或格式化文件而批量改动无关文件的编码或换行符。

| 文件类型 | 编码 | 换行 |
| --- | --- | --- |
| 默认文本文件 | UTF-8 no BOM | LF |
| `*.md` | UTF-8 no BOM | LF |
| `*.html` | UTF-8 no BOM | LF |
| `*.js` | UTF-8 no BOM | LF |
| `*.ts` | UTF-8 no BOM | LF |
| `*.json` | UTF-8 no BOM | LF |
| `*.csv` | UTF-8 no BOM | LF |
| `*.cpp` | UTF-8 no BOM | LF |
| `*.hpp` | UTF-8 no BOM | LF |
| `*.ps1` | UTF-8 no BOM | CRLF |
| `*.bat` | UTF-8 with BOM | CRLF |
| `*.cmd` | UTF-8 with BOM | CRLF |
| 二进制资源，如 `*.webp`、`*.glb`、`*.blend`、`*.ico` | 二进制 | 不适用 |

说明：

- 默认文本文件使用 UTF-8 no BOM、LF、保留文件末尾换行；不要自动清理行尾空白，除非任务明确要求。
- `*.bat` 和 `*.cmd` 必须保留 UTF-8 BOM 与 CRLF，避免 Windows 批处理中文路径或中文输出出现编码问题。
- 因为 `*.bat` 带 UTF-8 BOM 时，Windows `cmd.exe` 可能无法正确执行第一行的 `@echo off`，所以批处理文件开头如果需要关闭命令回显，应保留连续两行 `@echo off`；不要把第二行当作重复代码删除。
- `*.ps1` 使用 UTF-8 no BOM 与 CRLF。
- Markdown、HTML、JavaScript、TypeScript、JSON、CSV 等项目文本文件使用 UTF-8 no BOM 与 LF。
- 读写 JSON、CSV、HTML、JS、TS、MD 等文本文件时，不要转换成 ANSI、GBK、UTF-16 或 UTF-8 BOM。

## PowerShell File IO

PowerShell 7 中读写文本时优先使用明确编码：

```powershell
Get-Content -LiteralPath <path> -Encoding utf8
Set-Content -LiteralPath <path> -Value <text> -Encoding utf8NoBOM
```

写入批处理文件时使用：

```powershell
Set-Content -LiteralPath <path> -Value <text> -Encoding utf8BOM
```

如果必须精确控制 CRLF/LF，先构造完整文本，再写入指定编码；不要依赖编辑器或 shell 的默认换行转换。

## Editing Rules

- 优先保持现有代码风格、目录结构和命名方式。
- 修改范围要小，只改用户要求相关的文件。
- 不要重写或格式化大型文件，除非任务明确要求。
- 不要修改 `data/`、`csv/`、`model/`、`maps/`、`maps_textures/`、`weapons_textures/` 中的生成物或资源文件，除非任务明确要求。
- 修改脚本或生成流程后，尽量运行对应的最小验证命令。
- 修改 `update-assets-and-upload.bat` 后，必须实际运行脚本验证开头输出，确认没有回显 `cd /d`、`set`、`call`、`for /F`、`exit /b` 等批处理命令本身。

## Project Notes

- 这是一个 RWR 参数查询器项目，主要由静态前端、数据 JSON/CSV、模型和贴图资源组成。
- 根目录的 `index.html`、`model-viewer.html`、`sw.js` 是用户可见行为的重要入口，修改时要格外注意兼容性。
- `scripts/` 中的脚本负责资源或数据同步，修改数据结构时要同时检查脚本输出和前端读取逻辑。
