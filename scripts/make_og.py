"""Build the share preview (og-image.png, 1200x630) and icons for Vika's Academy.

Run from the project root: python scripts/make_og.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
BG = (3, 7, 18)
EM = (52, 211, 153)
CYAN = (34, 211, 238)
CLAY = (251, 146, 60)
INK = (243, 244, 246)
SOFT = (156, 163, 175)
FONTS = Path("C:/Windows/Fonts")


def font(name, size):
    for n in (name, "segoeuib.ttf", "arialbd.ttf"):
        p = FONTS / n
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def yu(draw, x, y, s):
    """The «Ю» mark: bar = barrel, connector, «О» = orange clay target with rings. s = height."""
    k = s / 64
    draw.rounded_rectangle([x + 6 * k, y + 8 * k, x + 15 * k, y + 56 * k], radius=3 * k, fill=EM)
    draw.rounded_rectangle([x + 15 * k, y + 28 * k, x + 27 * k, y + 36 * k], radius=2 * k, fill=EM)
    cx, cy = x + 42 * k, y + 32 * k
    draw.ellipse([cx - 17 * k, cy - 17 * k, cx + 17 * k, cy + 17 * k], fill=CLAY)
    w = max(2, int(2.5 * k))
    draw.ellipse([cx - 11.5 * k, cy - 11.5 * k, cx + 11.5 * k, cy + 11.5 * k], outline=(110, 62, 30), width=w)
    draw.ellipse([cx - 5 * k, cy - 5 * k, cx + 5 * k, cy + 5 * k], fill=(160, 90, 40))


def og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), BG)
    glow = Image.new("RGB", (W, H), BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-300, -360, 700, 520], fill=(6, 60, 46))
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    img = Image.blend(img, glow, 0.9)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([24, 24, W - 24, H - 24], radius=28, outline=(30, 41, 59), width=2)
    yu(d, 800, 135, 360)
    d.text((80, 92), "CLAYAWAY ACADEMY", font=font("segoeuib.ttf", 30), fill=EM)
    d.text((76, 150), "Академія", font=font("seguibl.ttf", 104), fill=INK)
    d.text((76, 270), "Віки", font=font("seguibl.ttf", 104), fill=INK)
    d.text((80, 420), "Sporting · Compak · рушниці · техніка", font=font("segoeui.ttf", 34), fill=SOFT)
    d.text((80, 466), "мова тренера · 394 терміни · квізи", font=font("segoeui.ttf", 34), fill=SOFT)
    d.rounded_rectangle([80, 530, 262, 576], radius=10, fill=(0, 0, 0))
    d.text((98, 534), "ClayArena", font=font("segoeuib.ttf", 30), fill=CYAN)
    img.save(ROOT / "og-image.png", optimize=True)


def icon(size, name, pad=0.1):
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    s = size * (1 - 2 * pad)
    yu(d, size * pad - s * 0.0, size * pad, s)
    img.save(ROOT / name, optimize=True)


if __name__ == "__main__":
    og()
    icon(180, "apple-touch-icon.png")
    icon(512, "icon-512.png")
    icon(32, "favicon.png", pad=0.02)
    print("ok")
