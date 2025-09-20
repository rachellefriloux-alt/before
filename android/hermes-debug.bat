@echo off
setlocal enabledelayedexpansion
set "args="
for %%i in (%*) do (
    if "%%i"=="-O3" (
        set "args=!args! -O0"
    ) else (
        set "args=!args! %%i"
    )
)
"C:\Users\chell\Desktop\Sallie AI\node_modules\react-native\sdks\hermesc\win64-bin\hermesc.exe" !args!
