<#
Archive `newsal` to a timestamped zip, generate SHA256 manifest for Sallie, then run `sallie_dedupe.ps1`.
#>
param(
    [string]$NewsalPath = 'C:\Users\chell\Desktop\newsal',
    [string]$SalliePath = 'C:\Users\chell\Desktop\Sallie'
)

if (-not (Test-Path $NewsalPath)) { Write-Output "newsal not found: $NewsalPath"; exit 1 }

$ts = (Get-Date).ToString('yyyyMMdd_HHmmss')
$zip = "C:\Users\chell\Desktop\newsal_archive_$ts.zip"
Write-Output "Creating archive: $zip"
Add-Type -AssemblyName System.IO.Compression.FileSystem
function Add-FilesToZip([string]$root, [string]$zipFile) {
    if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($root, $zipFile)
}
Add-FilesToZip -root $NewsalPath -zipFile $zip
Write-Output "Archive created: $zip"

# Remove original newsal after archive
$backupDir = "C:\Users\chell\Desktop\newsal_removed_backup_$ts"
Move-Item -Path $NewsalPath -Destination $backupDir -Force
Write-Output "Moved original newsal to backup: $backupDir"

# Generate SHA256 manifest for Sallie
$manifest = Join-Path $SalliePath 'sallie_sha256_manifest.txt'
Write-Output "Generating SHA256 manifest: $manifest"
Get-ChildItem -Path $SalliePath -Recurse -File -Force | Sort-Object FullName | ForEach-Object {
    $hash = Get-FileHash -Path $_.FullName -Algorithm SHA256
    "{0}  {1}" -f $hash.Hash, ($_.FullName.Substring($SalliePath.Length).TrimStart('\'))
} | Out-File -FilePath $manifest -Encoding utf8
Write-Output "Manifest written: $manifest"

# Run dedupe
$sallieDedupe = Join-Path $SalliePath 'sallie_dedupe.ps1'
if (Test-Path $sallieDedupe) {
    Write-Output "Running dedupe script..."
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $sallieDedupe -SalliePath $SalliePath
} else {
    Write-Output "Dedupe script not found: $sallieDedupe"
}

Write-Output "ALL DONE"
