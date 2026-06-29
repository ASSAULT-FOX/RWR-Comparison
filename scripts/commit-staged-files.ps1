param(
    [string]$RepoPath = ".",
    [string]$Branch = "main",
    [string]$MessageScript = ""
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $RepoPath
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:LC_ALL = 'C.UTF-8'

if (-not $MessageScript) {
    $MessageScript = Join-Path $RepoPath 'scripts/generate-commit-message.ps1'
}

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

function Get-StagedChange {
    $raw = git diff --cached --name-status -z
    if (-not $raw) { return @() }

    $parts = $raw -split "`0" | Where-Object { $_ -ne "" }
    $changes = @()
    for ($i = 0; $i -lt $parts.Count; $i++) {
        $status = $parts[$i]
        if ($status -match '^R') {
            if ($i + 2 -ge $parts.Count) { break }
            $oldPath = $parts[$i + 1]
            $newPath = $parts[$i + 2]
            $i += 2
            $changes += [pscustomobject]@{
                Status = $status
                Paths = @($oldPath, $newPath)
                Label = "$oldPath -> $newPath"
            }
            continue
        }

        if ($i + 1 -ge $parts.Count) { break }
        $path = $parts[$i + 1]
        $i += 1
        $changes += [pscustomobject]@{
            Status = $status
            Paths = @($path)
            Label = $path
        }
    }

    return $changes
}

$changes = @(Get-StagedChange)
if ($changes.Count -eq 0) {
    Write-Output "没有需要提交的变更。"
    exit 0
}

$patchFile = Join-Path $env:TEMP ("rwr-staged-changes-{0}.patch" -f ([guid]::NewGuid().ToString("N")))
$messageFile = Join-Path $env:TEMP ("rwr-commit-msg-{0}.txt" -f ([guid]::NewGuid().ToString("N")))

try {
    Invoke-Git diff --cached --binary --output $patchFile
    Invoke-Git reset -q

    foreach ($change in $changes) {
        foreach ($path in $change.Paths) {
            Invoke-Git add -- $path
        }

        $hasStagedChanges = $true
        & git diff --cached --quiet
        if ($LASTEXITCODE -eq 0) {
            $hasStagedChanges = $false
        } elseif ($LASTEXITCODE -ne 1) {
            throw "git diff --cached --quiet failed with exit code $LASTEXITCODE"
        }

        if (-not $hasStagedChanges) {
            Write-Output "跳过无实际变更：$($change.Label)"
            continue
        }

        if (Test-Path -LiteralPath $MessageScript) {
            & powershell -NoProfile -ExecutionPolicy Bypass -File $MessageScript -RepoPath $RepoPath -Branch $Branch > $messageFile
            if ($LASTEXITCODE -ne 0) {
                throw "生成提交信息失败：$($change.Label)"
            }
        } else {
            [System.IO.File]::WriteAllText($messageFile, "更新 $($change.Label)", [System.Text.UTF8Encoding]::new($false))
        }

        $message = (Get-Content -LiteralPath $messageFile -Raw -Encoding utf8).Trim()
        if (-not $message) {
            [System.IO.File]::WriteAllText($messageFile, "更新 $($change.Label)", [System.Text.UTF8Encoding]::new($false))
            $message = "更新 $($change.Label)"
        }

        Write-Output "提交：$message"
        Invoke-Git commit -F $messageFile
        Remove-Item -LiteralPath $messageFile -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Error $_
    exit 1
} finally {
    Remove-Item -LiteralPath $messageFile -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $patchFile -Force -ErrorAction SilentlyContinue
}
