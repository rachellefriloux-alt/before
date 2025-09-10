<# SHORTPATH_BUILD.ps1
   Installs deps (optional) and runs Gradle assembleDebug from the short path.
   Usage: .\SHORTPATH_BUILD.ps1 [-skipInstall]
#>
param([switch]$skipInstall)
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot
if (-not $skipInstall) {
  Write-Host 'Running npm ci --no-audit --no-fund' -ForegroundColor Cyan
  npm ci --no-audit --no-fund
}
Write-Host 'Running Gradle assembleDebug...' -ForegroundColor Cyan
& '.\android\gradlew.bat' app:assembleDebug -x lint -x test --configure-on-demand --build-cache '-PreactNativeDevServerPort=34713' '-PreactNativeArchitectures=arm64-v8a,armeabi-v7a' --stacktrace
Pop-Location
