<#
sallie_prune.ps1
Surgical cleanup of Sallie project - archives non-essential files safely
#>
param(
    [string]$SalliePath = 'C:\Users\chell\Desktop\Sallie',
    [string]$ArchivePath = "C:\Users\chell\Desktop\sallie_prune_archive_$((Get-Date).ToString('yyyyMMdd_HHmmss')).zip"
)

Write-Output "=== SALLIE SURGICAL PRUNE ==="
Write-Output "Target: $SalliePath"
Write-Output "Archive: $ArchivePath"
Write-Output ""

# Define cleanup candidates
$cleanupItems = @(
    # Import duplicates (backup files from merge)
    "$SalliePath\*__from__import_*",
    # Merged duplicates folder
    "$SalliePath\merged_sallie",
    # Build artifacts
    "$SalliePath\Sallie\dist",
    "$SalliePath\dist",
    "$SalliePath\node_modules",
    # Merge artifacts
    "$SalliePath\merge_plan.json",
    "$SalliePath\MERGE_MANIFEST.json",
    "$SalliePath\MERGE_README.md",
    "$SalliePath\merge_status.txt",
    "$SalliePath\MERGE_SUMMARY.md",
    "$SalliePath\merge_unmerged.txt",
    "$SalliePath\dedupe_report.json",
    "$SalliePath\merged_conflicts",
    "$SalliePath\dedup_backup",
    # Archive files
    "$SalliePath\sallie_1.0.zip",
    "$SalliePath\sallie_1.0.zip.zip",
    "$SalliePath\ssallie_1.0.zip",
    # IDE files
    "$SalliePath\Sallie.iml",
    "$SalliePath\Sallie__from_src1.iml",
    "$SalliePath\Sallie.code-workspace",
    "$SalliePath\sallie_1.0.code-workspace",
    "$SalliePath\sallie_1.0__from_src1.code-workspace",
    "$SalliePath\sally done.code-workspace",
    # Debug files
    "$SalliePath\java_pid2052.hprof",
    # Scripts (keep only essentials)
    "$SalliePath\execute_merge.ps1",
    "$SalliePath\generate_icons.ps1",
    "$SalliePath\generate_merge_preview.ps1",
    "$SalliePath\merge_sallie.ps1",
    "$SalliePath\run_merge_one_shot.ps1",
    "$SalliePath\verify_merge.ps1",
    "$SalliePath\sallie_archive_and_dedupe.ps1",
    "$SalliePath\sallie_dedupe.ps1"
)

Write-Output "=== CANDIDATES FOR ARCHIVAL ==="
$foundItems = @()
foreach ($item in $cleanupItems) {
    $matches = Get-ChildItem -Path $item -ErrorAction SilentlyContinue
    if ($matches) {
        $matches | ForEach-Object {
            Write-Output "  $($_.FullName)"
            $foundItems += $_
        }
    }
}

if ($foundItems.Count -eq 0) {
    Write-Output "No cleanup candidates found!"
    exit 0
}

Write-Output ""
Write-Output "Found $($foundItems.Count) items to archive."

# Create archive
Write-Output ""
Write-Output "=== CREATING ARCHIVE ==="
$tempDir = "$env:TEMP\sallie_prune_temp"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

foreach ($item in $foundItems) {
    $relativePath = $item.FullName.Substring($SalliePath.Length).TrimStart('\')
    $destPath = Join-Path $tempDir $relativePath

    if ($item.PSIsContainer) {
        # Directory
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        Copy-Item -Path "$($item.FullName)\*" -Destination $destPath -Recurse -Force
    } else {
        # File
        $destDir = Split-Path $destPath
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item -Path $item.FullName -Destination $destPath -Force
    }
}

# Create ZIP
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $ArchivePath)

# Remove temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Output "Archive created: $ArchivePath"

# Remove originals
Write-Output ""
Write-Output "=== REMOVING ORIGINALS ==="
foreach ($item in $foundItems) {
    try {
        Remove-Item -Path $item.FullName -Recurse -Force
        Write-Output "Removed: $($item.FullName)"
    } catch {
        Write-Output "ERROR removing $($item.FullName): $($_.Exception.Message)"
    }
}

Write-Output ""
Write-Output "=== PRUNE COMPLETE ==="
Write-Output "Archive: $ArchivePath"
Write-Output ""
Write-Output "Next steps:"
Write-Output "1. Verify Sallie still builds: npm install && npm run build"
Write-Output "2. Test launcher functionality"
Write-Output "3. If issues, restore from archive"
</content>
<parameter name="filePath">C:\Users\chell\Desktop\Sallie\sallie_prune.ps1
