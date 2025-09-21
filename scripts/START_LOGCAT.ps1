# START_LOGCAT.ps1 - Starts adb logcat filtered for app package 'Sallie' (case-sensitive)
adb logcat | findstr /R /C:"Sallie"
