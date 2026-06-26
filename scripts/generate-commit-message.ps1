<#
.SYNOPSIS
根据 Git 暂存区变更生成智能提交信息，带 emoji 图标，并描述具体变更内容。
#>

param(
    [string]$RepoPath = ".",
    [string]$Branch = "main",
    [switch]$IsMerge
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $RepoPath
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:LC_ALL = 'C.UTF-8'

# --- JSON 数据文件的名称字段映射 ---
$jsonNameKeys = @{
    'data/weapons.json'   = '枪械名称'
    'data/vehicles.json'  = '载具名'
    'data/maps.json'      = 'group'
}

# --- 文件分类规则 ---
$rules = @(
    @{ Pattern = '^ts/';                     Emoji = '🎨'; Label = '前端源码' }
    @{ Pattern = 'scripts/index\.js$';       Emoji = '🎨'; Label = '前端构建' }
    @{ Pattern = '^scripts/';               Emoji = '🔧'; Label = '工具脚本' }
    @{ Pattern = 'data/asset-manifest\.json$'; Emoji = '📋'; Label = '资源清单' }
    @{ Pattern = '^data/weapons\.json$';    Emoji = '🔫'; Label = '武器数据' }
    @{ Pattern = '^data/vehicles\.json$';   Emoji = '🚗'; Label = '载具数据' }
    @{ Pattern = '^data/maps\.json$';       Emoji = '🗺️'; Label = '地图数据' }
    @{ Pattern = '^data/rwr-players';       Emoji = '👥'; Label = '玩家列表' }
    @{ Pattern = '^data/';                  Emoji = '📊'; Label = '数据' }
    @{ Pattern = '^csv/weapons';            Emoji = '🔫'; Label = '武器CSV' }
    @{ Pattern = '^csv/vehicles';           Emoji = '🚗'; Label = '载具CSV' }
    @{ Pattern = '^csv/';                   Emoji = '📊'; Label = 'CSV源数据' }
    @{ Pattern = '\.html$';                 Emoji = '🌐'; Label = '页面' }
    @{ Pattern = '\.md$';                   Emoji = '📝'; Label = '文档' }
    @{ Pattern = '\.bat$';                  Emoji = '⚙️'; Label = '批处理' }
    @{ Pattern = '\.ps1$';                  Emoji = '⚙️'; Label = '脚本' }
    @{ Pattern = '^maps_textures/';          Emoji = '🖼️'; Label = '地图贴图' }
    @{ Pattern = '^maps/';                   Emoji = '🗺️'; Label = '地图' }
    @{ Pattern = '^weapons_textures/';       Emoji = '🖼️'; Label = '武器贴图' }
    @{ Pattern = '^model/';                  Emoji = '🗿'; Label = '3D模型' }
    @{ Pattern = '^sw\.js$';                Emoji = '🔧'; Label = 'SW缓存' }
)

# --- 操作类型映射 ---
$actions = @{
    'A' = @{ Emoji = '✨'; Verb = '新增' }
    'M' = @{ Emoji = '✏️'; Verb = '修改' }
    'D' = @{ Emoji = '🗑️'; Verb = '删除' }
    'R' = @{ Emoji = '🔄'; Verb = '重命名' }
    'T' = @{ Emoji = '📝'; Verb = '类型变更' }
}

# --- 辅助函数：对比 JSON 数组，找出新增/删除/修改的条目名称 ---
function Get-JsonDiffNames {
    param(
        [string]$FilePath,
        [string]$NameKey
    )
    $result = @{ Added = @(); Removed = @(); Modified = @() }

    try {
        # 暂存区版本
        $stagedRaw = git show ":$FilePath" 2>$null
        if (-not $stagedRaw) { return $result }
        $staged = $stagedRaw | ConvertFrom-Json

        # HEAD 版本
        $headRaw = git show "HEAD:$FilePath" 2>$null
        if (-not $headRaw) {
            # 全新文件，所有条目都是新增
            $result.Added = @($staged | ForEach-Object { $_.$NameKey } | Where-Object { $_ })
            return $result
        }
        $head = $headRaw | ConvertFrom-Json

        # 建立 HEAD 的名称索引
        $headMap = @{}
        foreach ($item in $head) {
            $name = $item.$NameKey
            if ($name) { $headMap[$name] = ($item | ConvertTo-Json -Compress) }
        }

        # 建立 staged 的名称索引
        $stagedMap = @{}
        foreach ($item in $staged) {
            $name = $item.$NameKey
            if ($name) { $stagedMap[$name] = ($item | ConvertTo-Json -Compress) }
        }

        # 找新增和修改
        foreach ($name in $stagedMap.Keys) {
            if (-not $headMap.Contains($name)) {
                $result.Added += $name
            } elseif ($stagedMap[$name] -ne $headMap[$name]) {
                $result.Modified += $name
            }
        }

        # 找删除
        foreach ($name in $headMap.Keys) {
            if (-not $stagedMap.Contains($name)) {
                $result.Removed += $name
            }
        }
    } catch {
        # JSON 解析失败，放弃细节
    }

    return $result
}

# --- 辅助函数：从文件路径提取有意义的短名称 ---
function Get-ShortName {
    param([string]$FilePath)
    $leaf = Split-Path $FilePath -Leaf
    # 去掉常见扩展名中的无意义前缀
    $leaf = $leaf -replace '\.(webp|png|jpg|json|js|ts|html|csv|glb|blend)$', ''
    $leaf = $leaf -replace '^hud_', ''
    return $leaf
}

# --- 辅助函数：从 TypeScript diff 提取关键变更描述 ---
function Get-TsDiffSummary {
    param([string]$FilePath)
    try {
        $diff = git diff --cached -U0 -- $FilePath 2>$null
        if (-not $diff) { return $null }

        $keywords = @()
        foreach ($line in ($diff -split "`n")) {
            # 匹配函数定义变更
            if ($line -match '^\+.*function\s+(\w+)') {
                $keywords += $Matches[1]
            }
            # 匹配类/接口变更
            if ($line -match '^\+.*(class|interface)\s+(\w+)') {
                $keywords += $Matches[2]
            }
            # 匹配重要的 addEventListener / querySelector 等
            if ($line -match "^\+.*getElementById\(['\x22](\w+)['\x22]\)") {
                $keywords += $Matches[1]
            }
        }

        if ($keywords.Count -gt 0) {
            $unique = $keywords | Select-Object -Unique | Select-Object -First 3
            return ($unique -join '、')
        }
    } catch {}
    return $null
}

# === 主逻辑 ===

# 获取暂存区变更
$changes = git diff --cached --name-status 2>$null
if (-not $changes -or $changes.Count -eq 0) {
    Write-Output '📦 更新文件'
    exit 0
}

# 解析每个变更文件
$entries = @()
foreach ($line in ($changes -split "`n")) {
    $line = $line.Trim()
    if (-not $line) { continue }

    if ($line -match '^(\w)\t(.+)$') {
        $status = $Matches[1]
        $file = $Matches[2]
    } elseif ($line -match '^(\w)\s+(.+)$') {
        $status = $Matches[1]
        $file = $Matches[2].Trim()
    } else {
        continue
    }

    # 确定文件分类
    $catEmoji = '📦'
    $catLabel = '其他'
    foreach ($rule in $rules) {
        if ($file -match $rule.Pattern) {
            $catEmoji = $rule.Emoji
            $catLabel = $rule.Label
            break
        }
    }

    $entries += @{
        Status   = $status
        File     = $file
        CatEmoji = $catEmoji
        CatLabel = $catLabel
    }
}

if ($entries.Count -eq 0) {
    Write-Output '📦 更新文件'
    exit 0
}

# --- 生成描述 ---
$parts = @()

# 按分类分组
$grouped = [ordered]@{}
foreach ($e in $entries) {
    $key = "$($e.Status)|$($e.CatEmoji)|$($e.CatLabel)"
    if (-not $grouped.Contains($key)) {
        $grouped[$key] = @()
    }
    $grouped[$key] += $e.File
}

foreach ($g in $grouped.GetEnumerator()) {
    $status, $catEmoji, $catLabel = $g.Key.Split('|')
    $files = $g.Value
    $action = $actions[$status]
    if (-not $action) { $action = @{ Emoji = '📝'; Verb = '变更' } }

    $detail = $null

    # 尝试从 JSON 数据文件提取具体条目名称
    if ($files.Count -eq 1 -and $jsonNameKeys.Contains($files[0]) -and $status -eq 'M') {
        $nameKey = $jsonNameKeys[$files[0]]
        $diff = Get-JsonDiffNames -FilePath $files[0] -NameKey $nameKey
        $descs = @()
        if ($diff.Added.Count -gt 0) {
            $names = ($diff.Added | Select-Object -First 3) -join '、'
            if ($diff.Added.Count -gt 3) { $names += "等$($diff.Added.Count)项" }
            $descs += "新增$names"
        }
        if ($diff.Modified.Count -gt 0) {
            $names = ($diff.Modified | Select-Object -First 3) -join '、'
            if ($diff.Modified.Count -gt 3) { $names += "等$($diff.Modified.Count)项" }
            $descs += "调整$names"
        }
        if ($diff.Removed.Count -gt 0) {
            $names = ($diff.Removed | Select-Object -First 3) -join '、'
            if ($diff.Removed.Count -gt 3) { $names += "等$($diff.Removed.Count)项" }
            $descs += "移除$names"
        }
        if ($descs.Count -gt 0) {
            $detail = $descs -join '，'
        }
    }

    # 尝试从 TypeScript 源码 diff 提取关键变更
    if (-not $detail -and $catLabel -eq '前端源码' -and $status -eq 'M') {
        foreach ($f in $files) {
            $tsSummary = Get-TsDiffSummary -FilePath $f
            if ($tsSummary) {
                $detail = $tsSummary
                break
            }
        }
    }

    # 默认：列出文件名
    if (-not $detail) {
        if ($files.Count -le 3) {
            $detail = ($files | ForEach-Object { Get-ShortName $_ }) -join '、'
        } else {
            $detail = "$($files.Count) 个文件"
        }
    }

    $parts += "$($action.Emoji)$catEmoji$($action.Verb)$catLabel`：$detail"
}

$message = $parts -join ' | '

# 合并提交加前缀
if ($IsMerge) {
    $message = "🔀合并远端 | $message"
}

# 长度控制
if ($message.Length -gt 120) {
    # 保留前两个 part
    $short = ($parts[0..([Math]::Min(1, $parts.Count - 1))] -join ' | ')
    if ($parts.Count -gt 2) {
        $remaining = $parts.Count - 2
        $short += " +$remaining"
    }
    $message = $short
}

Write-Output $message
