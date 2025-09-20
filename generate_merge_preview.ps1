# Generates merge_preview.json and merge_summary.json for non-destructive merge preview
$roots = @(
  'C:\Users\chell\Desktop\newsal',
  'C:\Users\chell\Desktop\Sallie\merged_sallie',
  'C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0',
  'C:\Users\chell\Desktop\Sallie\worktrees\import_sallie_1_0',
  'C:\Users\chell\Desktop\Sallie\Sallie0'
)

$all = @()
foreach ($root in $roots) {
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
      relative = $rel
      full = $full
      size = $_.Length
      sha256 = $sha
      lastWriteUtc = $_.LastWriteTimeUtc.ToString("o")
    }
  }
}

# output files
$previewPath = 'C:\Users\chell\Desktop\newsal\merge_preview.json'
$summaryPath = 'C:\Users\chell\Desktop\newsal\merge_summary.json'

# write full preview
$all | ConvertTo-Json -Depth 6 | Out-File -FilePath $previewPath -Encoding utf8

# build summary
$totalFiles = $all.Count
$groups = $all | Group-Object -Property relative
$collisionList = @()
foreach ($g in $groups) {
  if ($g.Count -gt 1) {
    $distinctHashes = ($g.Group | Select-Object -ExpandProperty sha256 | Select-Object -Unique)
    $collisionList += [pscustomobject]@{
      relative = $g.Name
      count = $g.Count
      distinctHashCount = $distinctHashes.Count
      samples = $g.Group | Select-Object -Property source,full,sha256,size,lastWriteUtc
    }
  }
}

$summary = [pscustomobject]@{
  generated = (Get-Date).ToString("o")
  totalFiles = $totalFiles
  uniqueRelativePaths = $groups.Count
  collisions = $collisionList.Count
  collisionSamples = $collisionList | Select-Object -First 50
}

$summary | ConvertTo-Json -Depth 6 | Out-File -FilePath $summaryPath -Encoding utf8

Write-Host "Preview written to $previewPath and summary to $summaryPath"
