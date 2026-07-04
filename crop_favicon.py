import sys
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def crop_transparent(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img_cropped = img.crop(bbox)
        # Create a square version if needed, but for now just save the cropped version
        # Favicons should ideally be square
        width, height = img_cropped.size
        size = max(width, height)
        new_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        new_img.paste(img_cropped, ((size - width) // 2, (size - height) // 2))
        
        # Save as PNG first
        new_img.save("public/logo_cropped.png")
        
        # Save as ICO (Pillow supports this directly)
        new_img.save(output_path, format="ICO", sizes=[(32, 32), (64, 64), (128, 128), (256, 256)])
        print("Cropped and saved successfully.")
    else:
        print("Image is entirely transparent.")

crop_transparent("public/logo.png", "public/favicon.ico")
