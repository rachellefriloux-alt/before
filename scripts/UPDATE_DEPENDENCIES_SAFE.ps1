<# UPDATE_DEPENDENCIES_SAFE.ps1
   Conservative dependency updater: updates minor/patch versions only for key packages to compatible releases.
   - Does NOT perform major version bumps
   - Creates package.json.backup before modifying
   - Runs npm install (with --legacy-peer-deps fallback)
   Usage: .\UPDATE_DEPENDENCIES_SAFE.ps1
#>
Set-StrictMode -Version Latest
$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $PSScriptRoot
$pkgPath = Join-Path $PSScriptRoot 'package.json'
if (-not (Test-Path $pkgPath)) { Write-Error 'package.json not found in this folder'; exit 1 }
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
Copy-Item $pkgPath "$pkgPath.backup" -Force
Write-Host 'Backed up package.json to package.json.backup' -ForegroundColor Green

function BumpIfSafe([string]$current, [string]$recommended) {
    if ($current -match '^[~^]?([0-9]+)\.([0-9]+)\.([0-9]+)') {
        $cMajor = [int]$matches[1]; $cMinor = [int]$matches[2]; $cPatch = [int]$matches[3]
        if ($recommended -match '^([0-9]+)\.([0-9]+)\.([0-9]+)') {
            $rMajor = [int]$matches[1]; $rMinor = [int]$matches[2]; $rPatch = [int]$matches[3]
            if ($rMajor -eq $cMajor -and ($rMinor -gt $cMinor -or ($rMinor -eq $cMinor -and $rPatch -ge $cPatch))) {
                return "~$rMajor.$rMinor.$rPatch"
            }
        }
    }
    return $current
}

# Conservative recommendations (manual curated list)
$recommended = @{
    'expo' = '53.0.3';
    'react' = '18.3.1';
    'react-native' = '0.76.9';
    'expo-constants' = '17.1.7';
    'expo-router' = '4.0.23';
}

$updated = $false
foreach ($depType in @('dependencies','devDependencies')) {
    if ($pkg.$depType -ne $null) {
        foreach ($prop in $pkg.$depType.PSObject.Properties) {
            $name = $prop.Name
            if ($recommended.ContainsKey($name)) {
                $old = $pkg.$depType.$name
                $new = BumpIfSafe $old $recommended[$name]
                if ($new -ne $old) {
                    Write-Host ("Updating {0}: {1} -> {2}" -f $name, $old, $new)
                    $pkg.$depType.$name = $new
                    $updated = $true
                }
            }
        }
    }
}

if ($updated) {
    $pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Force
    Write-Host 'package.json updated (safe bumps applied)'
} else {
    Write-Host 'No safe bumps needed'
}

# Try clean install
try {
    Write-Host 'Running npm ci --no-audit --no-fund' -ForegroundColor Cyan
    npm ci --no-audit --no-fund
} catch {
    Write-Warning 'npm ci failed, retrying with --legacy-peer-deps npm install'
    npm install --legacy-peer-deps --no-audit --no-fund
}
Pop-Location
