import sys
from pathlib import Path
from PIL import Image, ImageDraw
import math
import random

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

MOOD_GRADIENTS = {
    "calm":        ("#B0E0E6", "#D8BFD8"),
    "focused":     ("#00CED1", "#4682B4"),
    "energized":   ("#FFA500", "#FF4500"),
    "reflective":  ("#9370DB", "#4B0082"),
    "guarded":     ("#556B2F", "#2F4F4F"),
    "celebratory": ("#FFD700", "#FF69B4"),
    "hopeful":     ("#ADFF2F", "#40E0D0"),
    "melancholy":  ("#708090", "#2E2E2E"),
    "playful":     ("#FFB6C1", "#FFE4B5"),
    "resolute":    ("#8B0000", "#00008B"),
}

DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Procedural orb generator

def create_glowing_mist_orb(start_hex, end_hex, size=512, glow_strength=0.6, mist_density=0.35):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = size // 2
    radius = int(size / 2.2)
    # Radial gradient core
    for r in range(radius, 0, -1):
        ratio = r / radius
        color = tuple(
            int(hex_to_rgb(start_hex)[i] * ratio + hex_to_rgb(end_hex)[i] * (1 - ratio)) for i in range(3)
        ) + (255,)
        draw.ellipse([
            center - r, center - r, center + r, center + r
        ], fill=color)
    # Glow effect
    for i in range(4):
        alpha = int(255 * glow_strength / (i + 1))
        glow_color = hex_to_rgb(start_hex) + (alpha,)
        r = radius + i * 8
        draw.ellipse([
            center - r, center - r, center + r, center + r
        ], outline=glow_color, width=6 + i * 4)
    # Mist overlay
    mist_particles = int(size * mist_density)
    for _ in range(mist_particles):
        px = int(math.floor(random.random() * size))
        py = int(math.floor(random.random() * size))
        alpha = int(255 * random.random() * 0.15)
        draw.ellipse([
            px, py, px + 4, py + 4
        ], fill=(255, 255, 255, alpha))
    return img

def main():
    try:
        mood = sys.argv[1] if len(sys.argv) > 1 else "calm"
        # Always use absolute path to res directory
        base_dir = Path(__file__).parent.parent / "src" / "main" / "res"
        # Correction: use app/src/main/res for output
        app_res_dir = Path(__file__).parent.parent.parent / "app" / "src" / "main" / "res"
        start_hex, end_hex = MOOD_GRADIENTS.get(mood, MOOD_GRADIENTS["calm"])
        orb = create_glowing_mist_orb(start_hex, end_hex)
        for dpi, size in DENSITIES.items():
            out_dir = app_res_dir / dpi
            out_dir.mkdir(parents=True, exist_ok=True)
            orb_resized = orb.resize((size, size), Image.LANCZOS)
            out_path = out_dir / "ic_launcher.png"
            print(f"Saving icon to: {out_path}")
            orb_resized.save(out_path)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(2)

if __name__ == "__main__":
    main()
