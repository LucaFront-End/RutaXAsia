import os
from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

output_dir = r"d:\Workspace\Assets\RutaXAsia\public\images\juan-ale"
os.makedirs(output_dir, exist_ok=True)

images_to_convert = [
    (r"d:\Workspace\Assets\RutaXAsia\IMG_9800 (1).HEIC", "juan-ale-hero.jpg"),
    (r"d:\Workspace\Assets\RutaXAsia\FD00640B-0A3D-489E-BC3F-2D29A3ABBD08.jpg.jpeg", "bitacora-1.jpg"),
    (r"d:\Workspace\Assets\RutaXAsia\IMG_0041.HEIC", "bitacora-2.jpg"),
    (r"d:\Workspace\Assets\RutaXAsia\IMG_0638.HEIC", "bitacora-3.jpg"),
]

for src, name in images_to_convert:
    if os.path.exists(src):
        out_path = os.path.join(output_dir, name)
        print(f"Converting {src} -> {out_path}")
        img = Image.open(src)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img.save(out_path, "JPEG", quality=90)
        print(f"Saved {name} successfully!")
    else:
        print(f"File not found: {src}")
