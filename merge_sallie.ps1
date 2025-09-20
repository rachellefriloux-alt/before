# Merge multiple Sallie copies into a single directory without data loss
# Usage: run in PowerShell (pwsh)
#   pwsh -File .\merge_sallie.ps1

$ErrorActionPreference = 'Stop'

# --- Configure sources here (absolute paths) ---
$workspace = "C:\Users\chell\Desktop\Sallie"
$sources = @(
    "$workspace\Sallie0",
    "$workspace\sallie_1.0",
    "$workspace\worktrees\import_Sallie0",
    "$workspace\worktrees\import_sallie_1_0"
)
$dest = "$workspace\merged_sallie"

# Create destination
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }

function Get-FileHashSafe([string]$path){
    try { (Get-FileHash -Algorithm SHA256 -Path $path).Hash } catch { return $null }
}

$manifest = [ordered]@{
    createdAt = (Get-Date).ToString('o')
    workspace = $workspace
    sources = @()
    mergedTo = $dest
    files = @()
    duplicates = @()
    conflicts = @()
}

foreach ($src in $sources) {
    $manifest.sources += $src
    if (-not (Test-Path $src)) {
        Write-Host "[SKIP] source missing: $src"
        continue
    }
    Write-Host "[SCAN] $src"
    Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
        $file = $_
        $rel = $file.FullName.Substring($src.Length).TrimStart('\')
        $destPath = Join-Path $dest $rel
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

        if (-not (Test-Path $destPath)) {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
            $manifest.files += [ordered]@{ source = $src; sourcePath = $file.FullName; mergedPath = $destPath }
        } else {
            # Destination exists -- compare content
            $srcHash = Get-FileHashSafe $file.FullName
            $dstHash = Get-FileHashSafe $destPath

            if ($srcHash -and $dstHash -and $srcHash -eq $dstHash) {
                $manifest.duplicates += [ordered]@{ source = $src; sourcePath = $file.FullName; mergedPath = $destPath }
            } else {
                # Conflict: keep both by writing a suffixed copy
                $base = [IO.Path]::GetFileNameWithoutExtension($destPath)
                $ext = [IO.Path]::GetExtension($destPath)
                $dir = Split-Path $destPath -Parent
                $srcName = (Split-Path $src -Leaf) -replace '[^0-9A-Za-z_.-]','_'
                $timestamp = (Get-Date).ToString('yyyyMMddHHmmss')
                $newName = "${base}__from__${srcName}__${timestamp}${ext}"
                $newPath = Join-Path $dir $newName
                Write-Host "[CONFLICT] $rel -> keeping as $newName"
                Copy-Item -Path $file.FullName -Destination $newPath -Force
                $manifest.conflicts += [ordered]@{ source = $src; sourcePath = $file.FullName; mergedPath = $newPath; existing = $destPath }
            }
        }
    }
}

# Write manifest files (JSON)
$manifestJson = $manifest | ConvertTo-Json -Depth 6
$manifestPath = Join-Path $dest 'merge_manifest.json'
Set-Content -Path $manifestPath -Value $manifestJson -Encoding UTF8
Set-Content -Path (Join-Path $workspace 'merge_manifest.json') -Value $manifestJson -Encoding UTF8

Write-Host "\nMerge complete. Merged into: $dest"
Write-Host "Manifest written to: $manifestPath and $workspace\merge_manifest.json"
Write-Host "Conflicts: $($manifest.conflicts.Count), Duplicates: $($manifest.duplicates.Count), Files copied: $($manifest.files.Count)"

# Exit with success
exit 0
