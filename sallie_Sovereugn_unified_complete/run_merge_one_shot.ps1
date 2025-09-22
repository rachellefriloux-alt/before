Set-StrictMode -Version Latest
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$workspaceRoot = 'C:\Users\chell\Desktop'
$newsalRoot = Join-Path $workspaceRoot 'newsal'

# Source roots in priority order
$sourceRoots = @(
  "$workspaceRoot\Sallie\merged_sallie",
  "$workspaceRoot\Sallie\worktrees\import_Sallie0",
  "$workspaceRoot\Sallie\worktrees\import_sallie_1_0",
  "$workspaceRoot\Sallie\Sallie0"
)

$excludeDirs = @('node_modules','.git','dist','build')

function Should-Exclude($path) {
  foreach ($ex in $excludeDirs) { if ($path -like "*\\$ex\\*") { return $true } }
  return $false
}

function Get-CommentHeader($ext,$text) {
  switch ($ext.ToLower()) {
    '.ts'{return "/* $text */`n"}
    '.tsx'{return "/* $text */`n"}
    '.js'{return "/* $text */`n"}
    '.jsx'{return "/* $text */`n"}
    '.java'{return "/* $text */`n"}
    '.kt'{return "/* $text */`n"}
    '.kts'{return "/* $text */`n"}
    '.vue'{return "<!-- $text -->`n"}
    '.xml'{return "<!-- $text -->`n"}
    '.html'{return "<!-- $text -->`n"}
    '.json'{return "/* $text */`n"}
    '.md'{return "<!-- $text -->`n"}
    default { return "/* $text */`n" }
  }
}

function Is-TextFile($path) {
  try {
    $bytes = Get-Content -Path $path -Encoding Byte -TotalCount 512 -ErrorAction Stop
    foreach ($b in $bytes) { if ($b -eq 0) { return $false } }
    return $true
  } catch { return $false }
}

# Ensure target dirs exist
function Ensure-Dir($p) { if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null } }

# Collect files
Write-Host "Scanning sources..."
$all = @()
foreach ($root in $sourceRoots) {
  if (-not (Test-Path $root)) { continue }
  Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    if (Should-Exclude($_.FullName)) { return }
    $rel = $_.FullName.Substring($root.Length).TrimStart('\')
    $dir = Split-Path $rel -Parent
    if ($dir -eq '') { $dir = '.' }
    $basename = [System.IO.Path]::GetFileNameWithoutExtension($rel)
  # force extension to string (some pathological names produced a char)
  $ext = [string]([System.IO.Path]::GetExtension($rel))
    $h = $null
    try { $h = (Get-FileHash -Path $_.FullName -Algorithm SHA256 -ErrorAction Stop).Hash } catch {}
    $all += [PSCustomObject]@{ FullPath = $_.FullName; Root=$root; Relative=$rel; Dir=$dir; Basename=$basename; Ext=$ext; Hash=$h; LastWrite=$_.LastWriteTimeUtc; Length=$_.Length }
  }
}

Write-Host "Found $($all.Count) source files. Grouping by logical path..."
# group by Dir + Basename
$groups = $all | Group-Object -Property @{Expression={ (Join-Path $_.Dir $_.Basename).TrimStart('\') }}

$report = [System.Collections.ArrayList]::new()

# prepare mirror and master roots
$mirrorRoot = Join-Path $newsalRoot 'merged_sources'
$mastersRoot = Join-Path $newsalRoot 'merged_master'
Ensure-Dir $mirrorRoot
Ensure-Dir $mastersRoot

# extension preference
$priority = @('.ts','.tsx','.js','.jsx','.vue','.kt','.java','.xml','.json','.md','.txt')

foreach ($g in $groups) {
  $key = $g.Name
  $items = $g.Group | Sort-Object -Property LastWrite

  # mirror originals
  foreach ($it in $items) {
    $destMirror = Join-Path $mirrorRoot $it.Relative
    $destDir = Split-Path $destMirror -Parent
    Ensure-Dir $destDir
    if (-not (Test-Path $destMirror)) {
      try {
        Copy-Item -Path $it.FullPath -Destination $destMirror -Force -ErrorAction Stop
      } catch {
        Write-Host "WARN: failed to copy mirror for $($it.FullPath) -> ${destMirror} : $($_.Exception.Message)"
      }
    }
  }

  # unique by hash; if hash null treat as unique by path
  $uniqMap = @{}
  foreach ($it in $items) {
    $h = $it.Hash
    if (-not $h) { $h = (Get-Random -Maximum 1000000000).ToString() + '::' + ([IO.Path]::GetFileName($it.FullPath)) }
    if (-not $uniqMap.ContainsKey($h)) { $uniqMap[$h] = @() }
    $uniqMap[$h] += $it
  }
  $unique = $uniqMap.Values | ForEach-Object { $_[0] }

  # determine destination dir under newsal (preserve dir structure)
  $first = $items[0]
  $destRelDir = if ($first.Dir -eq '.' ) { '' } else { $first.Dir }
  $destDirFull = Join-Path $newsalRoot $destRelDir
  Ensure-Dir $destDirFull

  if ($unique.Count -eq 1) {
    # single unique -> copy representative into newsal at correct path with original extension
    $rep = $unique[0]
    $destPath = Join-Path $destDirFull ([IO.Path]::GetFileName($rep.Relative))
    # ensure parent dir
    $destParent = Split-Path $destPath -Parent
    Ensure-Dir $destParent
    # backup if exists and differs
    if (Test-Path $destPath) {
      $existingHash = $null
      try { $existingHash = (Get-FileHash -Path $destPath -Algorithm SHA256).Hash } catch {}
  if ($existingHash -ne $rep.Hash) { try { Copy-Item -Path $destPath -Destination ($destPath + '.bak') -Force -ErrorAction Stop } catch { Write-Host "WARN: backup failed for ${destPath}: $($_.Exception.Message)" } }
    }
  try { Copy-Item -Path $rep.FullPath -Destination $destPath -Force -ErrorAction Stop } catch { Write-Host "WARN: failed to copy $($rep.FullPath) -> ${destPath} : $($_.Exception.Message)" }
    $report.Add([PSCustomObject]@{ Key=$key; Action='copied'; Dest=$destPath; Sources=($items | Select-Object -ExpandProperty Relative) }) | Out-Null
  }
  else {
    # multiple unique versions -> create one master file
    # choose preferred extension
    $exts = $unique | Select-Object -ExpandProperty Ext -Unique
  $preferred = $exts | Where-Object { $priority -contains $_ } | Select-Object -First 1
  if (-not $preferred) { $preferred = $exts[0] }
  if (-not $preferred) { $preferred = '.txt' }
  if ($preferred -eq '') { $preferred = '.txt' }

    $masterName = $first.Basename + $preferred
    $masterPath = Join-Path $destDirFull $masterName

    # Build master: provenance header + deduped contents (line-level) for text files, otherwise concat with separators
    $linesSeen = [System.Collections.Generic.HashSet[string]]::new()
    $sb = New-Object System.Text.StringBuilder
    $prov = "Merged master for logical file: $key`nSources:`n"
    foreach ($u in $unique) { $prov += " - $($u.FullPath) (hash:$($u.Hash))`n" }
    $sb.AppendLine((Get-CommentHeader $preferred $prov)) | Out-Null

    foreach ($u in $unique) {
      $sep = "---- source: $($u.FullPath) | ext: $($u.Ext) | sha: $($u.Hash) ----"
      $sb.AppendLine((Get-CommentHeader $preferred $sep)) | Out-Null
      if (Is-TextFile $u.FullPath) {
        try {
          $content = Get-Content -Path $u.FullPath -Raw -ErrorAction Stop
          $l = $content -split "`r?`n"
          foreach ($ln in $l) { if ($linesSeen.Add($ln)) { $sb.AppendLine($ln) | Out-Null } }
        } catch {
          $sb.AppendLine("[ERROR reading $($u.FullPath)]") | Out-Null
        }
      } else {
        # binary or unreadable -> put a note and copy representative binary
        $sb.AppendLine("[BINARY FILE - original copied to merged_sources: $($u.Relative)]") | Out-Null
      }
      $sb.AppendLine() | Out-Null
    }

    # ensure parent and backup existing
    $masterParent = Split-Path $masterPath -Parent
    Ensure-Dir $masterParent
    if (Test-Path $masterPath) { try { Copy-Item -Path $masterPath -Destination ($masterPath + '.bak') -Force -ErrorAction Stop } catch { Write-Host "WARN: backup master failed for ${masterPath}: $($_.Exception.Message)" } }
    try {
      $sb.ToString() | Out-File -FilePath $masterPath -Encoding utf8 -Force
    } catch {
      Write-Host "ERROR: failed to write master ${masterPath} : $($_.Exception.Message)"
      # fallback: write master to mirror root with safe name
      $safe = Join-Path $mirrorRoot ($key -replace '[\\/:*?"<>|]','_') + '.master.txt'
      try { $sb.ToString() | Out-File -FilePath $safe -Encoding utf8 -Force; Write-Host "WROTE fallback master: $safe" } catch { Write-Host "FAILED fallback write: $($_.Exception.Message)" }
    }

    $report.Add([PSCustomObject]@{ Key=$key; Action='merged'; Dest=$masterPath; Sources=($items | Select-Object -ExpandProperty Relative) }) | Out-Null
  }
}

# write report
$reportPath = Join-Path $newsalRoot 'merge_report.json'
$report | ConvertTo-Json -Depth 6 | Out-File -FilePath $reportPath -Encoding utf8 -Force
Write-Host "Merge complete. Report: $reportPath"

# show short summary
Write-Host "Processed groups: $($report.Count)"

exit 0
