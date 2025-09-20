# CLEAN_ANDROID.ps1 - Clean Android build artifacts
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot
& '.\android\gradlew.bat' clean
Pop-Location
