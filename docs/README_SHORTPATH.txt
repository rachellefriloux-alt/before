SHORT PATH HELPERS

Files created:
 - SHORTPATH_BUILD.ps1        : npm ci (unless -skipInstall) and Gradle assembleDebug (port 34713)
 - INSTALL_AND_RUN_ON_DEVICE.ps1 : Build APK and adb install -r to connected device
 - START_LOGCAT.ps1           : Start filtered logcat (search for "Sallie")
 - CLEAN_ANDROID.ps1          : Runs Gradle clean

Usage notes:
 - Run these from PowerShell with execution policy that allows local scripts: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
 - Ensure Java, Android SDK (adb on PATH) and ANDROID_HOME are set.
 - These are convenience wrappers; review before running.
