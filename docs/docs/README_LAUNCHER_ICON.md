## Customizing Launcher Icons with Open-Source Resources

Sallie can easily update the app's launcher icons using free, open-source icon sets. Here’s how:

### 1. Choose an Open-Source Icon Set
- [Material Icons](https://fonts.google.com/icons)
- [Heroicons](https://heroicons.com/)
- [Font Awesome](https://fontawesome.com/)

### 2. Download Your Icon
- Visit the icon site and select your desired icon.
- Download the icon in SVG or PNG format.

### 3. Convert SVGs to PNGs for Android Densities
- Use [svg2png.com](https://svg2png.com/) or [ImageMagick](https://imagemagick.org/) to create PNGs for each density:
  - mdpi (48x48)
  - hdpi (72x72)
  - xhdpi (96x96)
  - xxhdpi (144x144)
  - xxxhdpi (192x192)

### 4. Replace the Launcher Icon Files
- Place your PNGs in these folders:
  - `app/src/main/res/mipmap-mdpi/ic_launcher.png`
  - `app/src/main/res/mipmap-hdpi/ic_launcher.png`
  - `app/src/main/res/mipmap-xhdpi/ic_launcher.png`
  - `app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
  - `app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

### 5. Rebuild the Project
- Run `./gradlew clean assembleDebug` to see your new icon.

---

**Sallie can repeat this process any time to update the app’s look!**

If you want to enable runtime icon switching, ask GitHub Copilot for Android 8.0+ code support.
