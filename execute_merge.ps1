<#
Non-destructive merge script.
For each file across the configured source roots this script groups files by their directory + base filename (ignoring extension).

Outputs:

No originals are deleted.
#>

Set-StrictMode -Version Latest
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$workspaceRoot = "C:\Users\chell\Desktop"
$newsalRoot = Join-Path $workspaceRoot 'newsal'

# Source roots to scan (order indicates priority when choosing preferred extension)
$sourceRoots = @(
    Join-Path $workspaceRoot 'Sallie\merged_sallie',
    Join-Path $workspaceRoot 'Sallie\worktrees\import_Sallie0',
    Join-Path $workspaceRoot 'Sallie\worktrees\import_sallie_1_0',
    Join-Path $workspaceRoot 'Sallie\Sallie0'
)

$excludeDirs = @('node_modules', '.git', 'build', 'dist', '.history')

Function Should-ExcludePath($path) {
    foreach ($ex in $excludeDirs) {
        if ($path -like "*\$ex\*") { return $true }
    }
    return $false
}

Function Choose-PreferredExtension($exts) {
    $priority = '.ts','.tsx','.js','.jsx','.vue','.kt','.java','.xml','.json','.md'
    foreach ($p in $priority) { if ($exts -contains $p) { return $p } }
    return $exts[0]
}

Function Comment-Header($ext, $text) {
    switch ($ext) {
        { $_ -in @('.ts','.tsx','.js','.jsx','.java','.kt') } { return "/* $text */`n" }
        '.vue' { return "<!-- $text -->`n" }
        '.xml' { return "<!-- $text -->`n" }
        '.json' { return "/* $text */`n" }
        '.md' { return "<!-- $text -->`n" }
        default { return "/* $text */`n" }
    }
}

# Merge script: group by relative path + basename, dedupe exact copies, combine remaining unique versions
# - Writes master files into newsal at the correct relative path (backing up any overwritten files as .bak)
# - Creates a companion metadata file for provenance: <file>.__meta.json
# - Produces a report at newsal/merge_report.json

Param()

Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent (Resolve-Path "..\" )
$newsalRoot = (Resolve-Path ".").ProviderPath

# Define source roots to search (add or remove as needed)
$sourceRoots = @(
  (Join-Path $repoRoot 'merged_sallie'),
  (Join-Path $repoRoot 'worktrees\import_Sallie0'),
  (Join-Path $repoRoot 'worktrees\import_sallie_1_0'),
  (Join-Path $repoRoot 'Sallie0')
)

# Normalize source roots: keep only existing directories
$sourceRoots = $sourceRoots | Where-Object { Test-Path $_ }

Write-Host "Source roots: $($sourceRoots -join ', ')"

# File extensions to skip (node_modules, build outputs)
$excludeDirs = @('node_modules','dist','build','.git')

function Get-AllSourceFiles {
  param($roots)
  $files = @()
  foreach ($root in $roots) {
    if (-not (Test-Path $root)) { continue }
    Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
      foreach ($ex in $excludeDirs) { if ($_.FullName -like "*\\$ex\\*") { return $false } }
      return $true
    } | ForEach-Object {
      $files += [PSCustomObject]@{
        FullPath = $_.FullName
        Root = $root
        RelativePath = $_.FullName.Substring($root.Length).TrimStart('\')
        Directory = $_.DirectoryName
        Name = $_.Name
        BaseName = $_.BaseName
        Extension = $_.Extension.TrimStart('.')
        LastWriteTime = $_.LastWriteTimeUtc
        Length = $_.Length
      }
    }
  }
  return $files
}

function Get-Hash($path) {
  try { return (Get-FileHash -Algorithm SHA256 -Path $path).Hash } catch { return $null }
}

# Map of extensions to comment styles (blockStart, blockEnd, linePrefix)
$commentStyles = @{
  'js' = @{start='/*'; end='*/'; line='//'}
  'ts' = @{start='/*'; end='*/'; line='//'}
  'jsx' = @{start='/*'; end='*/'; line='//'}
  'tsx' = @{start='/*'; end='*/'; line='//'}
  'java' = @{start='/*'; end='*/'; line='//'}
  'kt' = @{start='/*'; end='*/'; line='//'}
  'kts' = @{start='/*'; end='*/'; line='//'}
  'gradle' = @{start='/*'; end='*/'; line='//'}
  'vue' = @{start='<!--'; end='-->'; line='<!--'}
  'xml' = @{start='<!--'; end='-->'; line='<!--'}
  'html' = @{start='<!--'; end='-->'; line='<!--'}
  'py' = @{start='"""'; end='"""'; line='#'}
  'sh' = @{start=''; end=''; line='#'}
  'bash' = @{start=''; end=''; line='#'}
  'json' = @{start=''; end=''; line=''}
  'md' = @{start='<!--'; end='-->'; line='<!--'}
}

function Get-CommentStyle($ext) {
  if ($commentStyles.ContainsKey($ext)) { return $commentStyles[$ext] }
  return @{start='/*'; end='*/'; line='//'}
}

Write-Host "Scanning source roots..."
$allFiles = Get-AllSourceFiles -roots $sourceRoots

Write-Host "Found $($allFiles.Count) files in sources"

# Group key: relative directory + BaseName (i.e. same logical file across extensions)
$groups = @{}
foreach ($f in $allFiles) {
  $relDir = Split-Path $f.RelativePath -Parent
  if ($relDir -eq '') { $relDir = '.' }
  $key = (Join-Path $relDir $f.BaseName).Replace('/','\\')
  if (-not $groups.ContainsKey($key)) { $groups[$key] = @() }
  $hash = Get-Hash $f.FullPath
  $groups[$key] += [PSCustomObject]@{
    FullPath = $f.FullPath
    Root = $f.Root
    RelativePath = $f.RelativePath
    BaseName = $f.BaseName
    Extension = $f.Extension
    Hash = $hash
    LastWriteTime = $f.LastWriteTime
    Length = $f.Length
  }
}

$report = [System.Collections.Generic.List[object]]::new()

# Ensure target directories
function Ensure-Dir($path) { if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path -Force | Out-Null } }

foreach ($key in $groups.Keys) {
  $entries = $groups[$key]
  # dedupe exact-copy hashes
  $uniqueByHash = $entries | Group-Object -Property Hash | ForEach-Object { $_.Group | Select-Object -First 1 }
  $unique = $uniqueByHash

  $relDir = Split-Path $key -Parent
  $baseName = Split-Path $key -Leaf

  # determine destination relative dir under newsal
  $destRelDir = if ($relDir -eq '.') { '' } else { $relDir }
  $destDir = Join-Path $newsalRoot $destRelDir
  Ensure-Dir $destDir

  if ($unique.Count -eq 0) { continue }
  elseif ($unique.Count -eq 1) {
    # single unique file: copy into newsal at same relative path (preserve extension)
    $src = $unique[0].FullPath
    $dest = Join-Path $destDir $unique[0].Name
    $action = 'copied'
    # backup existing dest if exists and differs
    if (Test-Path $dest) {
      $existingHash = Get-Hash $dest
      if ($existingHash -ne $unique[0].Hash) {
        Copy-Item -Path $dest -Destination ($dest + '.bak') -Force
      } else { $action = 'skipped-same' }
    }
    if ($action -ne 'skipped-same') { Copy-Item -Path $src -Destination $dest -Force }

    $report.Add(@{
      key = $key; action = $action; master = $dest; sources = @($src)
    })
  }
  else {
    # multiple unique versions -> create a master file
    # choose master extension: newest LastWriteTime among unique entries
    $chosen = $unique | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1
    $masterExt = $chosen.Extension
    $masterName = "$baseName.$masterExt"
    $masterPath = Join-Path $destDir $masterName

    # Build master content: include provenance and unique contents deduplicated by line
    $seenLines = [System.Collections.Generic.HashSet[string]]::new()
    $sb = New-Object System.Text.StringBuilder

    # If the extension supports block comments, add a top provenance block
    $style = Get-CommentStyle $masterExt
    if ($style.start -and $style.end) {
      $sb.AppendLine($style.start) | Out-Null
      $sb.AppendLine("Merged master for logical file: $key") | Out-Null
      $sb.AppendLine("Sources:") | Out-Null
      foreach ($u in $unique) { $sb.AppendLine(" - $($u.FullPath)  (hash: $($u.Hash))") | Out-Null }
      $sb.AppendLine($style.end) | Out-Null
      $sb.AppendLine() | Out-Null
    } else {
      # for files that don't support block comments, create companion meta file
      # meta file will be created below
    }

    foreach ($u in $unique | Sort-Object -Property LastWriteTime) {
      $sep = "----- source: $($u.FullPath) (hash: $($u.Hash)) -----"
      # If style has a line prefix, output separator as commented line
      if ($style.line) { $sb.AppendLine("$($style.line) $sep") | Out-Null } else { $sb.AppendLine($sep) | Out-Null }
      $content = Get-Content -Raw -LiteralPath $u.FullPath -ErrorAction SilentlyContinue
      if ($null -eq $content) { continue }
      # write content skipping duplicate exact lines
      $lines = $content -split "\r?\n"
      foreach ($line in $lines) {
        if ($seenLines.Add($line)) { $sb.AppendLine($line) | Out-Null }
      }
      $sb.AppendLine() | Out-Null
    }

    # Backup existing master if present
    if (Test-Path $masterPath) { Copy-Item -Path $masterPath -Destination ($masterPath + '.bak') -Force }

    # Write master
    $sb.ToString() | Out-File -FilePath $masterPath -Encoding utf8 -Force

    # For formats that didn't support block comments for provenance, create companion meta
    if (-not ($style.start -and $style.end)) {
      $meta = @{
        logical = $key
        master = $masterPath
        sources = @()
      }
      foreach ($u in $unique) { $meta.sources += @{ path=$u.FullPath; hash=$u.Hash; ext=$u.Extension; lastWrite=$u.LastWriteTime } }
      $metaPath = $masterPath + '.__meta.json'
      $meta | ConvertTo-Json -Depth 5 | Out-File -FilePath $metaPath -Encoding utf8 -Force
    }

    $report.Add(@{
      key = $key; action = 'merged'; master = $masterPath; sources = ($unique | ForEach-Object { $_.FullPath })
    })
  }
}

# Write report
$reportPath = Join-Path $newsalRoot 'merge_report.json'
$report | ConvertTo-Json -Depth 5 | Out-File -FilePath $reportPath -Encoding utf8 -Force

Write-Host "Merge complete. Report written to: $reportPath"

Write-Host "Starting merge: building file index..."

$fileIndex = @{}

foreach ($root in $sourceRoots) {
    if (-not (Test-Path $root)) { Write-Host "Source root not found: $root"; continue }
    Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
        $f = $_
        if (Should-ExcludePath($f.FullName)) { return }
        # Compute relative path from the root
        $rel = $f.FullName.Substring($root.Length).TrimStart('\')
        $dir = Split-Path $rel -Parent
        $basename = [System.IO.Path]::GetFileNameWithoutExtension($rel)
        $ext = [System.IO.Path]::GetExtension($rel)
        $key = (Join-Path $dir $basename).TrimStart('\')

        $hash = (Get-FileHash -Path $f.FullName -Algorithm SHA256).Hash
        $entry = [PSCustomObject]@{
            SourceRoot = $root
            FullPath = $f.FullName
            Relative = $rel -replace '\\','/'
            Dir = $dir -replace '\\','/'
            Basename = $basename
            Ext = $ext
            Hash = $hash
            Length = $f.Length
            LastWriteTime = $f.LastWriteTimeUtc
        }

        if (-not $fileIndex.ContainsKey($key)) { $fileIndex[$key] = @() }
        $fileIndex[$key] += $entry
        # also copy original into newsal/merged_sources for traceability
        $srcMirror = Join-Path $newsalRoot 'merged_sources'
        $destMirrorPath = Join-Path $srcMirror $rel
        $destMirrorDir = Split-Path $destMirrorPath -Parent
        if (-not (Test-Path $destMirrorDir)) { New-Item -ItemType Directory -Path $destMirrorDir -Force | Out-Null }
        if (-not (Test-Path $destMirrorPath)) {
            Copy-Item -Path $f.FullName -Destination $destMirrorPath -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Indexed $($fileIndex.Keys.Count) logical file groups. Generating masters..."

$mastersRoot = Join-Path $newsalRoot 'merged_master'
if (-not (Test-Path $mastersRoot)) { New-Item -ItemType Directory -Path $mastersRoot -Force | Out-Null }

$report = [System.Collections.ArrayList]::new()

foreach ($key in $fileIndex.Keys) {
    $group = $fileIndex[$key]
    # group by hash to find unique contents
    $uniq = $group | Group-Object -Property Hash | ForEach-Object { $_.Group[0] }
    $exts = ($group | Select-Object -ExpandProperty Ext -Unique)
    $preferredExt = Choose-PreferredExtension $exts

    # compute mirror dir and basename
    $first = $group[0]
    $mirroredDir = $first.Dir -replace '/','\'
    $basename = $first.Basename

    $destDir = Join-Path $mastersRoot $mirroredDir
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

    if ($uniq.Count -eq 1) {
        # single unique file: copy representative to master area using its original extension
        $rep = $uniq[0]
        $destPath = Join-Path $destDir ($basename + $rep.Ext)
        Copy-Item -Path $rep.FullPath -Destination $destPath -Force
        $action = 'copied'
        $report += [PSCustomObject]@{
            Key = $key; Action = $action; Dest = $destPath; Sources = ($group | Select-Object -ExpandProperty Relative)
        }
    }
    else {
        # multiple unique versions: create merged master file
        $masterName = $basename + '.master' + $preferredExt
        $destPath = Join-Path $destDir $masterName
        # write merged content with provenance headers for each unique file
        $sb = New-Object System.Text.StringBuilder
        foreach ($u in $uniq) {
            $hdr = "Source: $($u.FullPath) | Ext: $($u.Ext) | Size: $($u.Length) | SHA256: $($u.Hash) | LastWriteUtc: $($u.LastWriteTime)"
            $sb.AppendLine((Comment-Header $u.Ext $hdr)) | Out-Null
            try {
                $content = Get-Content -Path $u.FullPath -Raw -ErrorAction Stop
            } catch {
                $content = "[ERROR reading file: $($u.FullPath)]`n"
            }
            $sb.AppendLine($content) | Out-Null
            $sb.AppendLine("`n/* ---- next version ---- */`n") | Out-Null
        }
        $sb.ToString() | Out-File -FilePath $destPath -Encoding utf8 -Force
        $action = 'merged'
        $report += [PSCustomObject]@{
            Key = $key; Action = $action; Dest = $destPath; Sources = ($group | Select-Object -ExpandProperty Relative)
        }
    }
}

# write report
$reportPath = Join-Path $newsalRoot 'merge_report.json'
$report | ConvertTo-Json -Depth 6 | Out-File -FilePath $reportPath -Encoding utf8 -Force

Write-Host "Merge complete. Masters: $mastersRoot; Report: $reportPath"
Write-Host "Summary: $($report.Count) groups processed."

Exit 0
Param(
  [string[]]$Roots = @( 
    'C:\Users\chell\Desktop\newsal',
    'C:\Users\chell\Desktop\Sallie\merged_sallie',
    'C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0',
    'C:\Users\chell\Desktop\Sallie\worktrees\import_sallie_1_0',
    'C:\Users\chell\Desktop\Sallie\Sallie0'
  ),
  [string]$OutPreview = 'C:\Users\chell\Desktop\newsal\merge_preview.json',
  [string]$OutReport = 'C:\Users\chell\Desktop\newsal\merge_report.json',
  [string]$MergedSources = 'C:\Users\chell\Desktop\newsal\merged_sources',
  [string]$MergedMaster = 'C:\Users\chell\Desktop\newsal\merged_master'
)

Write-Host "Starting non-destructive merge execution..."

# collect files
$all = @()
foreach ($root in $Roots) {
  if (-Not (Test-Path $root)) { continue }
  Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $full = $_.FullName
    try {
      $h = Get-FileHash -Path $full -Algorithm SHA256 -ErrorAction Stop
      $sha = $h.Hash
    } catch {
      $sha = $null
    }
    $rel = $full.Substring($root.Length + 1)
    $all += [pscustomobject]@{
      source = $root
      sourceName = ([IO.Path]::GetFileName($root) -replace '[:\\/ ]','_')
      relative = $rel -replace '\\','/'
      full = $full
      size = $_.Length
      sha256 = $sha
      lastWriteUtc = $_.LastWriteTimeUtc
    }
  }
}

if ($all.Count -eq 0) { Write-Host "No files found in specified roots."; exit 0 }

# ensure output dirs
New-Item -ItemType Directory -Path $MergedSources -Force | Out-Null
New-Item -ItemType Directory -Path $MergedMaster -Force | Out-Null

# copy all files into merged_sources preserving relative tree under a folder named for the source
foreach ($item in $all) {
  $destDir = Join-Path $MergedSources (Join-Path $item.sourceName ([IO.Path]::GetDirectoryName($item.relative)))
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
  $destPath = Join-Path $destDir ([IO.Path]::GetFileName($item.relative))
  try {
    Copy-Item -Path $item.full -Destination $destPath -Force
  } catch {
  Write-Warning ("Failed to copy {0} -> {1}: {2}" -f $item.full, $destPath, $_)
  }
}

# group by relative path without extension (normalize separators)
$groups = $all | Group-Object -Property @{Expression = { $_.relative -replace '\.[^/.]+$','' }}

$report = @()

foreach ($g in $groups) {
  $keyNoExt = $g.Name
  $members = $g.Group | Sort-Object -Property lastWriteUtc
  $distinctHashes = $members | Group-Object -Property sha256

  # prepare master paths
  $sampleRel = $members[0].relative
  $sampleDir = [IO.Path]::GetDirectoryName($sampleRel)
  if ([string]::IsNullOrEmpty($sampleDir)) { $sampleDir = '.' }
  $sampleFileName = [IO.Path]::GetFileName($sampleRel)

  # if all have same hash (including null), pick the newest and copy once to merged_master path preserving extension
  if ($distinctHashes.Count -eq 1) {
    $chosen = $members | Sort-Object -Property lastWriteUtc -Descending | Select-Object -First 1
    $targetDir = Join-Path $MergedMaster $sampleDir
    if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
    $targetPath = Join-Path $targetDir $sampleFileName
    Copy-Item -Path $chosen.full -Destination $targetPath -Force
    $report += [pscustomobject]@{
      relative = $keyNoExt
      action = 'deduped_single_copy'
      kept = $chosen.full
      targets = @($targetPath)
      sources = ($members | Select-Object -Property source,full,sha256,lastWriteUtc,size)
    }
    continue
  }

  # multiple different contents -> create a combined master file with provenance blocks
  $masterBaseName = ([IO.Path]::GetFileNameWithoutExtension($sampleFileName))
  $masterFileName = "$masterBaseName__MASTER.merged"
  $masterDir = Join-Path $MergedMaster $sampleDir
  if (-not (Test-Path $masterDir)) { New-Item -ItemType Directory -Path $masterDir -Force | Out-Null }
  $masterPath = Join-Path $masterDir $masterFileName

  $sb = New-Object System.Text.StringBuilder
  $idx = 0
  foreach ($h in $distinctHashes) {
    foreach ($m in ($h.Group | Sort-Object -Property lastWriteUtc)) {
      $idx++
      $prov = "--- PROVENANCE BLOCK $idx ---`nSource: $($m.source)`nSourceName: $($m.sourceName)`nFullPath: $($m.full)`nLastWriteUtc: $($m.lastWriteUtc.ToString('o'))`nSha256: $($m.sha256)`nSize: $($m.size)`n--- END PROVENANCE ---`n"
      [void]$sb.AppendLine($prov)
      try {
        $content = Get-Content -Raw -LiteralPath $m.full -ErrorAction Stop
      } catch {
        $content = "<failed to read content: $_>"
      }
      [void]$sb.AppendLine($content)
      [void]$sb.AppendLine("`n")

      # also copy each distinct version with a provenance suffix for quick access
      $suffixName = "{0}__from__{1}__{2}{3}" -f ([IO.Path]::GetFileNameWithoutExtension($m.relative)), $m.sourceName, ($m.lastWriteUtc.ToString('yyyyMMddHHmmss')), ([IO.Path]::GetExtension($m.relative))
      $copyTarget = Join-Path $masterDir $suffixName
      try {
        Copy-Item -Path $m.full -Destination $copyTarget -Force
      } catch {
  Write-Warning ("Failed to copy distinct version {0} -> {1}: {2}" -f $m.full, $copyTarget, $_)
      }
    }
  }

  # write master file
  try {
    $sb.ToString() | Out-File -FilePath $masterPath -Encoding utf8 -Force
  } catch {
  Write-Warning ("Failed to write master file {0}: {1}" -f $masterPath, $_)
  }

  $report += [pscustomobject]@{
    relative = $keyNoExt
    action = 'combined_master_created'
    master = $masterPath
    versions = ($members | Select-Object -Property source,full,sha256,lastWriteUtc,size)
  }
}

# write report
$out = [pscustomobject]@{
  generated = (Get-Date).ToString('o')
  roots = $Roots
  totalFiles = $all.Count
  groups = $groups.Count
  actions = $report
}

$out | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutReport -Encoding utf8

Write-Host "Merge execution complete. Preview: $OutPreview  Report: $OutReport  Merged sources: $MergedSources  Masters: $MergedMaster"
