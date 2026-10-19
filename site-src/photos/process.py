"""Turn original photos into the two sizes the site embeds, and write manifest.json.

  full/<slug>.webp   gallery, lightbox and commercial hero  (long edge <= 1400px)
  helix/<slug>.jpg   landing-page helix thumbnails           (long edge <= 560px)

Usage:  python3 -I site-src/photos/process.py <folder-with-originals>

To add a photo: append a row to PHOTOS (display order), re-run, then rebuild
the site with `node site-src/build.mjs`. Every output is re-encoded from
pixels only, so EXIF/GPS metadata never reaches the site, and wide-gamut
(e.g. Display P3) photos are converted to sRGB so colors render as shot.
"""
import io
import json
import os
import sys

from PIL import Image, ImageChops, ImageCms, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
FULL_EDGE, HELIX_EDGE = 1400, 560

# slug, original file, title, category, alt text — in gallery display order
PHOTOS = [
    ('fire', '8c2c2674-image.png', 'Fire', 'editorial',
     'Portrait of a man in a jeweled beanie and white tank top against a wall of flames'),
    ('red-portrait', '6969aa65-image.png', 'Portrait in red', 'portrait',
     'Studio profile portrait of a man in black sunglasses against a red backdrop'),
    ('phone-lights', '49de0cae-image.png', 'Phone lights', 'live',
     'Black-and-white concert crowd holding up phone lights toward a performer on stage'),
    ('milky-way', '84eab97a-image.jpg', 'Under the Milky Way', 'nature',
     'Silhouette of a figure in a cowboy hat standing on sandstone beneath the Milky Way'),
    ('oyster', '9e14275a-image.jpg', 'Oyster, uni & roe', 'culinary',
     'Oyster topped with uni, salmon roe, chives and a purple flower on a ceramic plate'),
    ('embrace', 'a3f6fdaf-image.jpg', 'The embrace', 'live',
     'Two women embracing at an event, one smiling over the other\'s shoulder'),
    ('on-the-hood', '46cefabd-image.png', 'On the hood', 'editorial',
     'Black-and-white shot of a performer in a red bandana singing on the hood of a classic car, dancers around him'),
    ('headlight', 'b529a16b-image.jpg', 'Headlight study', 'editorial',
     'Macro of a car headlight glowing red against black'),
    ('lake', '193a4df3-image.jpg', 'Lake at first light', 'nature',
     'Misty lake at sunrise reflecting autumn trees, seen from a wooden dock'),
    ('camo', '806a36e5-image.jpg', 'Camo wrap', 'portrait',
     'Young man seated on the pavement beside a camo-wrapped car'),
    ('the-ring', '8ab7d1d3-image.jpg', 'The ring', 'live',
     'Close-up of a hand with yellow nails and a diamond ring holding a glass of white wine'),
    ('lampposts', '0a7d7f88-image.jpg', 'Among the lampposts', 'portrait',
     'Black-and-white portrait of a man in a cap leaning on a vintage lamppost among many others'),
    ('green-eyes', 'ecbfaeff-image.jpg', 'Green eyes', 'nature',
     'Grey cat with green eyes stretched out in grass and fallen leaves'),
    ('sorbet', 'a4919a9f-image.jpg', 'Sorbet, black bowl', 'culinary',
     'Overhead view of a quenelle of yellow sorbet and a black spoon in a dark bowl on wood'),
]

SRGB = ImageCms.createProfile('sRGB')


def load(path):
    im = ImageOps.exif_transpose(Image.open(path))
    icc = im.info.get('icc_profile')
    if icc:  # convert wide-gamut sources to sRGB so browsers show the intended color
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        if im.mode not in ('RGB', 'RGBA'):
            im = im.convert('RGB')
        im = ImageCms.profileToProfile(im, src, SRGB, outputMode=im.mode)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (13, 13, 13, 255))  # Midnight Obsidian
        im = Image.alpha_composite(bg, im)
    im = im.convert('RGB')
    # trim solid white padding (e.g. a portrait exported with white bars)
    diff = ImageChops.difference(im, Image.new('RGB', im.size, (255, 255, 255)))
    box = diff.convert('L').point(lambda v: 255 if v > 14 else 0).getbbox()
    if box and (box[2] - box[0]) * (box[3] - box[1]) < im.size[0] * im.size[1] * 0.97:
        # shave 3px off each trimmed side: the anti-aliased seam between photo
        # and padding is light grey and would otherwise survive as a thin line
        w, h = im.size
        box = (box[0] + (3 if box[0] > 0 else 0), box[1] + (3 if box[1] > 0 else 0),
               box[2] - (3 if box[2] < w else 0), box[3] - (3 if box[3] < h else 0))
        im = im.crop(box)
    return im


def save(im, edge, path, fmt, budget=None, **opts):
    """Resize to fit `edge` and encode; if `budget` (bytes) is set, step quality
    down to 62, then shrink, until the file fits — highly textured shots
    (fur, grass, grain) otherwise weigh several times more than the rest."""
    while True:
        out = im.copy()
        out.thumbnail((edge, edge), Image.LANCZOS)  # never upscales
        q = opts.get('quality', 80)
        while True:
            buf = io.BytesIO()
            out.save(buf, fmt, **dict(opts, quality=q))
            if not budget or buf.tell() <= budget or q <= 62:
                break
            q -= 4
        if not budget or buf.tell() <= budget or edge * 0.9 < 1100:
            break  # keep at least ~1100px so the lightbox stays sharp
        edge = int(edge * 0.9)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(buf.getvalue())
    return out.size


def main(src_dir):
    manifest = []
    for slug, name, title, cat, alt in PHOTOS:
        im = load(os.path.join(src_dir, name))
        full = save(im, FULL_EDGE, os.path.join(HERE, 'full', slug + '.webp'), 'WEBP',
                    budget=190_000, quality=76, method=6)
        save(im, HELIX_EDGE, os.path.join(HERE, 'helix', slug + '.jpg'), 'JPEG',
             quality=70, optimize=True, progressive=True)
        manifest.append({'slug': slug, 'title': title, 'cat': cat, 'alt': alt,
                         'ar': round(im.size[0] / im.size[1], 3), 'w': full[0], 'h': full[1]})
        print(f'{slug:14} {im.size[0]}x{im.size[1]} -> full {full[0]}x{full[1]}')
    with open(os.path.join(HERE, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=1)
        f.write('\n')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
