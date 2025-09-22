<#
sallie_dedupe.ps1
Safely deduplicate identical files in the Sallie tree by replacing duplicates with NTFS hardlinks to a chosen master copy.
Creates a backup of every file it will modify under a timestamped folder on the Desktop.
Logs actions to \Sallie\sallie_dedupe_log.txt
#>
param(
    [string]$SalliePath = 'C:\Users\chell\Desktop\Sallie',
    [string]$BackupRoot = "C:\Users\chell\Desktop\sallie_dedupe_backup_$((Get-Date).ToString('yyyyMMdd_HHmmss'))",
    [string]$LogFile = "C:\Users\chell\Desktop\Sallie\sallie_dedupe_log.txt"
)

New-Item -Path $BackupRoot -ItemType Directory -Force | Out-Null
"START: $(Get-Date)" | Out-File $LogFile -Encoding utf8
"SalliePath: $SalliePath" | Out-File $LogFile -Append -Encoding utf8
"BackupRoot: $BackupRoot" | Out-File $LogFile -Append -Encoding utf8

Write-Output "Collecting files under $SalliePath..."
$files = Get-ChildItem -Path $SalliePath -Recurse -File -Force -ErrorAction SilentlyContinue
"Total files found: $($files.Count)" | Out-File $LogFile -Append -Encoding utf8

Write-Output "Computing SHA256 hashes (this may take a while)..."
$hashes = @()
foreach ($f in $files) {
    try {
        $h = Get-FileHash -Path $f.FullName -Algorithm SHA256
        $hashes += [PSCustomObject]@{ Path = $f.FullName; Hash = $h.Hash; Length = $f.Length }
    } catch {
        "ERROR: Could not hash $($f.FullName) : $($_.Exception.Message)" | Out-File $LogFile -Append -Encoding utf8
    }
}

$groups = $hashes | Group-Object -Property Hash | Where-Object { $_.Count -gt 1 }
"Duplicate groups found: $($groups.Count)" | Out-File $LogFile -Append -Encoding utf8

foreach ($g in $groups) {
    # sort candidates so larger (or lexicographically earlier) file becomes master for stability
    $members = $g.Group | Sort-Object Length -Descending, Path
    $master = $members[0].Path
    foreach ($m in $members[1..($members.Count - 1)]) {
        $dup = $m.Path
        if ($dup -eq $master) { continue }

        try {
            $masterDrive = (Get-Item $master).PSDrive.Name
            $dupDrive = (Get-Item $dup).PSDrive.Name
        } catch {
            "WARN: Could not determine drive for $dup or $master: $($_.Exception.Message)" | Out-File $LogFile -Append -Encoding utf8
            continue
        }

        if ($masterDrive -ne $dupDrive) {
            "SKIP: different volume - $dup -> $master" | Out-File $LogFile -Append -Encoding utf8
            continue
        }

        $rel = $dup.Substring($SalliePath.Length).TrimStart('\')
        $destBackup = Join-Path $BackupRoot $rel
        New-Item -ItemType Directory -Path (Split-Path $destBackup) -Force | Out-Null
        Copy-Item -Path $dup -Destination $destBackup -Force

        try {
            Remove-Item -Path $dup -Force
        } catch {
            "ERROR: Could not remove original duplicate $dup : $($_.Exception.Message)" | Out-File $LogFile -Append -Encoding utf8
            continue
        }

        try {
            New-Item -ItemType HardLink -Path $dup -Target $master | Out-Null
            "LINKED: $dup -> $master" | Out-File $LogFile -Append -Encoding utf8
        } catch {
            "FAIL_LINK: $dup -> $master : $($_.Exception.Message)" | Out-File $LogFile -Append -Encoding utf8
            # restore from backup
            try {
                Copy-Item -Path $destBackup -Destination $dup -Force
                "RESTORED: $dup from backup" | Out-File $LogFile -Append -Encoding utf8
            } catch {
                "CRITICAL: could not restore $dup from backup: $($_.Exception.Message)" | Out-File $LogFile -Append -Encoding utf8
            }
        }
    }
}

"DONE: $(Get-Date)" | Out-File $LogFile -Append -Encoding utf8
Write-Output "Dedupe complete. Log: $LogFile. Backups: $BackupRoot"
