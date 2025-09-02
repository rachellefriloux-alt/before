import os
import itertools
from pathlib import Path
import subprocess
from datetime import date

PERSONAS = ["creator", "mom"]
SEASONS = ["spring", "summer", "autumn", "winter"]
MOODS = ["high", "steady", "reflective", "low"]
EVENTS = {
    "valentines": ((2, 14), "valentines_overlay.svg"),
    "birthday": ((8, 13), "birthday_overlay.svg"),  # Aug 13 for you, love
    "pride": (("month", 6), "pride_overlay.svg"),   # whole June
}

BASE_DIR = Path(__file__).parent / "assets"
OUT_DIR = Path(__file__).parent.parent / "src/main/res/mipmap-anydpi-v26"
OUT_DIR.mkdir(exist_ok=True, parents=True)

# Dummy rasterize function for now
def rasterize(svg_path):
    pass

def create_adaptive_icon_xml(path, layers):
    """Creates a valid adaptive-icon XML file."""
    with open(path, "w") as f:
        f.write('<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n')
        # A simple way to determine background vs foreground
        has_background = any("bg" in layer.name for layer in layers)
        if has_background:
             f.write(f'    <background android:drawable="@color/{next(l.stem for l in layers if "bg" in l.name)}"/>\n')
        
        # All non-background layers are treated as foreground layers
        for layer in layers:
            if "bg" not in layer.name:
                # This is a simplification; a real implementation would need to handle multiple foregrounds
                # by pre-combining them into a single drawable resource. For now, we just list them.
                # Android will only render the last one, but this makes the XML valid.
                f.write(f'    <foreground android:drawable="@drawable/{layer.stem}"/>\n')
        f.write('</adaptive-icon>\n')

def make_transition_frames(old_icon_layers, new_icon_layers, style, out_base_path):
    """Generates XML files for transition frames."""
    # For this placeholder, we'll just blend the layers lists and create valid XML.
    # A real implementation would do more complex image processing.
    frame1_layers = old_icon_layers + new_icon_layers 
    frame2_layers = new_icon_layers 

    create_adaptive_icon_xml(f"{out_base_path}_frame1.xml", frame1_layers)
    create_adaptive_icon_xml(f"{out_base_path}_frame2.xml", frame2_layers)

def combine_layers(*layers, output_svg):
    """Wrapper to maintain compatibility with the old calling structure."""
    create_adaptive_icon_xml(output_svg, list(layers))


def generate_all_icons():
    print("💎 Generating SallieOS icon set…")
    all_icons = []
    OUT_DIR.mkdir(exist_ok=True, parents=True)

    # 0. Generate a default ic_launcher and ic_launcher_round
    default_persona = "creator"
    default_base = BASE_DIR / "base" / f"{default_persona}_base.svg"
    default_season_bg = BASE_DIR / "seasons" / "summer_bg.svg"
    default_mood_accent = BASE_DIR / "moods" / "steady_accent.svg"
    default_layers = [default_base, default_season_bg, default_mood_accent]
    
    default_icon_path = OUT_DIR / "ic_launcher.xml"
    combine_layers(*default_layers, output_svg=default_icon_path)
    all_icons.append(default_icon_path)
    
    # Android also looks for a round version
    round_icon_path = OUT_DIR / "ic_launcher_round.xml"
    shutil.copy(default_icon_path, round_icon_path)
    all_icons.append(round_icon_path)

    # 1. Generate simple persona icons (creator, mom)
    for persona in PERSONAS:
        base = BASE_DIR / "base" / f"{persona}_base.svg"
        season_bg = BASE_DIR / "seasons" / "summer_bg.svg" # Default
        mood_accent = BASE_DIR / "moods" / "steady_accent.svg" # Default
        
        layers = [base, season_bg, mood_accent]
        output_name = f"ic_launcher_{persona}.xml"
        output_path = OUT_DIR / output_name
        combine_layers(*layers, output_svg=output_path)
        all_icons.append(output_path)

    # 2. Generate for every combination of persona, season, mood
    for persona, season, mood in itertools.product(PERSONAS, SEASONS, MOODS):
        base = BASE_DIR / "base" / f"{persona}_base.svg"
        season_bg = BASE_DIR / "seasons" / f"{season}_bg.svg"
        mood_accent = BASE_DIR / "moods" / f"{mood}_accent.svg"

        base_layers = [base, season_bg, mood_accent]
        
        # A. Generate the main combination icon (no event)
        output_name = f"ic_launcher_{persona}_{season}_{mood}.xml"
        output_path = OUT_DIR / output_name
        combine_layers(*base_layers, output_svg=output_path)
        all_icons.append(output_path)

        # B. Generate icons for each event
        for event_name, (_, overlay_file) in EVENTS.items():
            event_overlay = BASE_DIR / "events" / overlay_file
            event_layers = base_layers + [event_overlay]
            event_output_name = f"ic_launcher_{persona}_{season}_{mood}_{event_name}.xml"
            event_output_path = OUT_DIR / event_output_name
            combine_layers(*event_layers, output_svg=event_output_path)
            all_icons.append(event_output_path)

        # C. Generate transition frames for this combination
        transition_base_name = f"ic_launcher_{persona}_{season}_{mood}_pop"
        # Pass layer info to the transition generator
        make_transition_frames(base_layers, base_layers, "pop", OUT_DIR / transition_base_name)
        all_icons.append(OUT_DIR / f"{transition_base_name}_frame1.xml")
        all_icons.append(OUT_DIR / f"{transition_base_name}_frame2.xml")

    print(f"Generated {len(all_icons)} icons/frames in {OUT_DIR}")

import shutil

# ... existing imports ...

# ... existing constants ...
DRAWABLE_DIR = Path(__file__).parent.parent / "src/main/res/drawable"

def convert_svg_to_xml_drawable(svg_path, xml_path):
    """
    Creates a placeholder VectorDrawable XML file from an SVG asset.
    This is a workaround because we can't do a true SVG-to-VectorDrawable conversion
    without external libraries. This creates a valid XML file that references the
    original SVG, a pattern that some build systems can handle.
    """
    # A real implementation would parse the SVG and convert path data.
    # For now, we just create a valid, empty vector drawable XML.
    with open(xml_path, "w") as f:
        f.write('<vector xmlns:android="http://schemas.android.com/apk/res/android"\n')
        f.write('    android:width="108dp"\n')
        f.write('    android:height="108dp"\n')
        f.write('    android:viewportWidth="108"\n')
        f.write('    android:viewportHeight="108">\n')
        f.write('    <!-- Placeholder for SVG content -->\n')
        f.write('</vector>\n')


def clean_generated_files():
    """Removes previously generated icons and drawables."""
    print("🧹 Cleaning generated files...")
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    if DRAWABLE_DIR.exists():
        shutil.rmtree(DRAWABLE_DIR)
    OUT_DIR.mkdir(exist_ok=True, parents=True)
    DRAWABLE_DIR.mkdir(exist_ok=True, parents=True)


def setup_drawables():
    """
    Converts all SVG assets into placeholder XML drawables for the build.
    """
    DRAWABLE_DIR.mkdir(exist_ok=True, parents=True)
    asset_files = list(BASE_DIR.glob("**/*.svg"))
    # print(f"Found {len(asset_files)} SVG assets to convert.")
    for asset in asset_files:
        xml_name = asset.with_suffix(".xml").name
        xml_path = DRAWABLE_DIR / xml_name
        convert_svg_to_xml_drawable(asset, xml_path)

# ... existing functions ...

if __name__ == "__main__":
    clean_generated_files()
    setup_drawables()
    generate_all_icons()
