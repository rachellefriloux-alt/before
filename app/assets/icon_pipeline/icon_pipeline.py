import os
from PIL import Image # Make sure Pillow is installed in your Python env (pip install Pillow)
import sys

# Define base asset and output paths relative to the script's location or project root
# For now, let's assume assets and output are relative to the project root or a defined base.
# It's often better to pass these as arguments or configure them.
ASSET_BASE_PATH = "app/icon_pipeline/assets" # Example: project_root/app/icon_pipeline/assets
OUTPUT_PATH_BASE = "app/icon_pipeline/output" # Example: project_root/app/icon_pipeline/output

def generate(persona, mood, season, event=None):
    # Ensure output directory exists
    if not os.path.exists(OUTPUT_PATH_BASE):
        os.makedirs(OUTPUT_PATH_BASE)

    base_image_path = os.path.join(ASSET_BASE_PATH, "base", f"{persona}.png")

    # Check if base persona image exists
    if not os.path.exists(base_image_path):
        print(f"❌ Error: Base persona icon not found at {base_image_path}")
        return

    final_image = Image.open(base_image_path).convert("RGBA")

    overlays_paths = [
        os.path.join(ASSET_BASE_PATH, "mood", f"{mood}.png"),
        os.path.join(ASSET_BASE_PATH, "season", f"{season}.png")
    ]
    if event:
        overlays_paths.append(os.path.join(ASSET_BASE_PATH, "events", f"{event}.png"))

    for overlay_path in overlays_paths:
        if os.path.exists(overlay_path):
            overlay_image = Image.open(overlay_path).convert("RGBA")
            # Ensure overlay is the same size as the base, or handle resizing
            if overlay_image.size != final_image.size:
                print(f"⚠️ Warning: Overlay {overlay_path} size {overlay_image.size} differs from base size {final_image.size}. Resizing overlay.")
                overlay_image = overlay_image.resize(final_image.size, Image.Resampling.LANCZOS)
            final_image = Image.alpha_composite(final_image, overlay_image)
        else:
            print(f"⚠️ Warning: Overlay not found at {overlay_path}, skipping.")

    output_filename = f"{persona}_{mood}_{season}{'_' + event if event else ''}.png"
    full_output_path = os.path.join(OUTPUT_PATH_BASE, output_filename)

    final_image.save(full_output_path)
    print(f"✅ Icon generated: {full_output_path}")

# Example usage (you'd call this from your build script or manually)
if __name__ == "__main__":
    args = sys.argv[1:]
    persona = args[0] if len(args) > 0 else "creator"
    mood = args[1] if len(args) > 1 else "high"
    season = args[2] if len(args) > 2 else "spring"
    event = args[3] if len(args) > 3 else None
    generate(persona, mood, season, event)

    # Create dummy asset folders and images for testing if they don't exist
    # In a real scenario, these assets would be pre-designed.
    dummy_asset_folders = [
        os.path.join(ASSET_BASE_PATH, "base"),
        os.path.join(ASSET_BASE_PATH, "mood"),
        os.path.join(ASSET_BASE_PATH, "season"),
        os.path.join(ASSET_BASE_PATH, "events")
    ]
    for folder in dummy_asset_folders:
        if not os.path.exists(folder):
            os.makedirs(folder)

    # Create dummy 100x100 transparent PNGs if they don't exist
    dummy_images_info = {
        os.path.join(ASSET_BASE_PATH, "base", "creator.png"): (100,100),
        os.path.join(ASSET_BASE_PATH, "mood", "high.png"): (100,100),
        os.path.join(ASSET_BASE_PATH, "season", "spring.png"): (100,100),
        os.path.join(ASSET_BASE_PATH, "events", "launch_day.png"): (100,100),
        os.path.join(ASSET_BASE_PATH, "mood", "calm.png"): (100,100), # for second example
        os.path.join(ASSET_BASE_PATH, "season", "winter.png"): (100,100) # for second example
    }
    for img_path, size in dummy_images_info.items():
        if not os.path.exists(img_path):
            try:
                img = Image.new("RGBA", size, (0,0,0,0)) # Transparent
                img.save(img_path)
                print(f"Created dummy asset: {img_path}")
            except Exception as e:
                print(f"Could not create dummy asset {img_path}: {e}")


    print("Running example icon generation...")
    generate("creator", "high", "spring", event="launch_day")
    generate("creator", "calm", "winter") # Example without event
