# verify_merge.ps1 - quick verification of merge_report.json destinations
param(
  [string]$ReportPath = "C:\Users\chell\Desktop\newsal\merge_report.json",
  [int]$SampleMissing = 50
)
if (-not (Test-Path $ReportPath)) { Write-Host "ERROR: report not found: $ReportPath"; exit 2 }
# extract Dest values without full JSON parse to keep memory low
$dests = Select-String -Path $ReportPath -Pattern '"Dest"' -SimpleMatch | ForEach-Object {
  if ($_ -match '"Dest"\s*:\s*"([^"]+)"') { $Matches[1] }
}
$total = $dests.Count
$existCount = 0
$missing = @()
foreach ($p in $dests) {
  if (Test-Path $p) { $existCount++ } else { if ($missing.Count -lt $SampleMissing) { $missing += $p } }
}
Write-Host "total_dest_entries: $total"
Write-Host "existing: $existCount"
Write-Host "missing_sample_count: $($missing.Count)"
Write-Host "--- sample missing (up to $SampleMissing) ---"
foreach ($m in $missing) { Write-Host $m }
Write-Host "--- end ---"
exit 0
