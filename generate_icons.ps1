# Generate remaining launcher icons
$basePath = "C:\Users\chell\Desktop\Sallie\app\src\main\res\mipmap-anydpi-v26"

# Colors for different icons
$colors = @(
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#F8C471", "#82E0AA", "#F1948A", "#85C1E9", "#D7BDE2",
    "#AED6F1", "#A3E4D7", "#F9E79F", "#D2B4DE", "#A9DFBF",
    "#FAD7A0", "#ABEBC6", "#F5B7B1", "#AED6F1", "#D7BDE2",
    "#A9CCE3", "#A2D9CE", "#F9E79F", "#D2B4DE", "#A9DFBF",
    "#FAD7A0", "#ABEBC6", "#F5B7B1", "#AED6F1", "#D7BDE2"
)

# Shapes for different icons
$shapes = @(
    "M45,35 L63,35 L63,45 L55,45 L55,55 L63,55 L63,65 L45,65 Z",  # S
    "M35,45 L45,35 L55,45 L65,35 L75,45 L65,55 L75,65 L65,75 L55,65 L45,75 L35,65 L45,55 Z",  # Star
    "M40,40 L68,40 L68,68 L40,68 Z",  # Square
    "M54,34 L64,44 L54,54 L44,44 Z",  # Diamond
    "M54,34 C60,34 64,38 64,44 C64,50 60,54 54,54 C48,54 44,50 44,44 C44,38 48,34 54,34 Z"  # Circle
)

for ($i = 2; $i -le 35; $i++) {
    $colorIndex = ($i - 1) % $colors.Length
    $shapeIndex = ($i - 1) % $shapes.Length

    $color = $colors[$colorIndex]
    $shape = $shapes[$shapeIndex]

    $content = @"
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <path android:fillColor="$color"
      android:pathData="M54,54m-40,0a40,40 0,1 1,80 0a40,40 0,1 1,-80 0" />
  <path android:fillColor="#FFFFFF"
      android:pathData="$shape" />
</vector>
"@

    $filePath = "$basePath\ic_launcher$i.xml"
    $content | Out-File -FilePath $filePath -Encoding UTF8
    Write-Host "Created $filePath"
}
