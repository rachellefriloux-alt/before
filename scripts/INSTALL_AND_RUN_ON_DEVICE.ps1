<# INSTALL_AND_RUN_ON_DEVICE.ps1
   Builds and installs the app on a connected Android device and starts the app.
   Usage: .\INSTALL_AND_RUN_ON_DEVICE.ps1 [-skipBuild]
#>
param([switch]$skipBuild)
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot
if (-not $skipBuild) {
  Write-Host 'Building debug APK' -ForegroundColor Cyan
  & '.\android\gradlew.bat' app:assembleDebug -x lint -x test --stacktrace
}
# find APK
$apk = Get-ChildItem -Path '.\android\app\build\outputs\apk\debug' -Recurse -Filter '*-debug.apk' | Select-Object -First 1
if ($null -eq $apk) { Write-Error 'APK not found after build'; exit 1 }
Write-Host "Installing $($apk.FullName) to device..." -ForegroundColor Cyan
adb install -r $apk.FullName
Pop-Location
