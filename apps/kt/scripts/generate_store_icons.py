"""Generate square Weir Here app icons for iOS, Android, and Play Store listing."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent.parent
LOGO = ROOT / "shared/src/commonMain/composeResources/drawable/weir_here_logo.png"
IOS_ICON = ROOT / "iosApp/iosApp/Assets.xcassets/AppIcon.appiconset/app-icon-1024.png"
ANDROID_RES = ROOT / "androidApp/src/androidMain/res"
PLAY_ICON = ROOT / "store-assets/play-icon-512.png"
FEATURE_GRAPHIC = ROOT / "store-assets/play-feature-graphic-1024x500.png"

# mipmap density -> launcher px
DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
# Adaptive icon foreground is typically 108dp with safe zone ~66dp
FG_DENSITIES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}


def crop_circular_emblem(src: Image.Image) -> Image.Image:
    """Crop the circular logo from the landscape source onto a square canvas."""
    im = src.convert("RGBA")
    w, h = im.size
    # Content detection: non-near-black opaque pixels
    pixels = im.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b, a = pixels[x, y]
            if a > 8 and (r + g + b) > 40:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if maxx <= minx or maxy <= miny:
        # Fallback: center square of the shorter side
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        return im.crop((left, top, left + side, top + side))

    # Expand slightly and force square around the circle
    pad = max(4, int(0.02 * max(maxx - minx, maxy - miny)))
    minx = max(0, minx - pad)
    miny = max(0, miny - pad)
    maxx = min(w - 1, maxx + pad)
    maxy = min(h - 1, maxy + pad)
    cw, ch = maxx - minx + 1, maxy - miny + 1
    side = max(cw, ch)
    cx = (minx + maxx) // 2
    cy = (miny + maxy) // 2
    left = max(0, min(w - side, cx - side // 2))
    top = max(0, min(h - side, cy - side // 2))
    return im.crop((left, top, left + side, top + side))


def fit_on_canvas(
    emblem: Image.Image,
    size: int,
    bg: tuple[int, int, int, int],
    scale: float = 0.92,
    circle_mask: bool = False,
) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), bg)
    target = max(1, int(size * scale))
    logo = emblem.copy()
    logo.thumbnail((target, target), Image.Resampling.LANCZOS)
    if circle_mask:
        mask = Image.new("L", logo.size, 0)
        ImageDraw.Draw(mask).ellipse((0, 0, logo.size[0] - 1, logo.size[1] - 1), fill=255)
        rounded = Image.new("RGBA", logo.size, (0, 0, 0, 0))
        rounded.paste(logo, (0, 0), mask)
        logo = rounded
    x = (size - logo.size[0]) // 2
    y = (size - logo.size[1]) // 2
    canvas.alpha_composite(logo, (x, y))
    return canvas


def save_rgb_no_alpha(im: Image.Image, path: Path) -> None:
    """iOS App Store icons must not include an alpha channel."""
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = Image.new("RGB", im.size, (0, 0, 0))
    rgb.paste(im, mask=im.split()[3] if im.mode == "RGBA" else None)
    rgb.save(path, format="PNG", optimize=True)


def main() -> None:
    emblem = crop_circular_emblem(Image.open(LOGO))
    print(f"Emblem crop: {emblem.size}")

    # iOS 1024 (opaque, black background matching brand)
    ios = fit_on_canvas(emblem, 1024, (0, 0, 0, 255), scale=0.96)
    save_rgb_no_alpha(ios, IOS_ICON)
    print(f"Wrote {IOS_ICON}")

    # Play Store high-res icon 512
    play = fit_on_canvas(emblem, 512, (0, 0, 0, 255), scale=0.96)
    PLAY_ICON.parent.mkdir(parents=True, exist_ok=True)
    play.convert("RGBA").save(PLAY_ICON, format="PNG", optimize=True)
    print(f"Wrote {PLAY_ICON}")

    # Optional feature graphic (logo centered on brand black)
    fg = Image.new("RGB", (1024, 500), (0, 0, 0))
    mark = fit_on_canvas(emblem, 420, (0, 0, 0, 255), scale=0.98)
    fg.paste(mark.convert("RGB"), ((1024 - 420) // 2, (500 - 420) // 2))
    fg.save(FEATURE_GRAPHIC, format="PNG", optimize=True)
    print(f"Wrote {FEATURE_GRAPHIC}")

    # Android launcher / round / foreground
    for folder, size in DENSITIES.items():
        out_dir = ANDROID_RES / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        full = fit_on_canvas(emblem, size, (0, 0, 0, 255), scale=0.96)
        full.save(out_dir / "ic_launcher.png", format="PNG", optimize=True)
        round_icon = fit_on_canvas(emblem, size, (0, 0, 0, 0), scale=0.96, circle_mask=True)
        # Composite round onto transparent then keep
        round_icon.save(out_dir / "ic_launcher_round.png", format="PNG", optimize=True)

    for folder, size in FG_DENSITIES.items():
        out_dir = ANDROID_RES / folder
        # Safe-zone ~66/108 ≈ 0.61 of canvas; keep logo a bit larger for readability
        fg_layer = fit_on_canvas(emblem, size, (0, 0, 0, 0), scale=0.72)
        fg_layer.save(out_dir / "ic_launcher_foreground.png", format="PNG", optimize=True)
        print(f"Wrote {folder} icons")

    # Adaptive icon XML if missing
    anydpi = ANDROID_RES / "mipmap-anydpi-v26"
    anydpi.mkdir(parents=True, exist_ok=True)
    (anydpi / "ic_launcher.xml").write_text(
        """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
""",
        encoding="utf-8",
    )
    (anydpi / "ic_launcher_round.xml").write_text(
        """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
""",
        encoding="utf-8",
    )
    values = ANDROID_RES / "values"
    values.mkdir(parents=True, exist_ok=True)
    colors = values / "ic_launcher_background.xml"
    if not (values / "colors.xml").exists() and not colors.exists():
        colors.write_text(
            """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#000000</color>
</resources>
""",
            encoding="utf-8",
        )
    else:
        colors_xml = values / "colors.xml"
        if colors_xml.exists():
            text = colors_xml.read_text(encoding="utf-8")
            if "ic_launcher_background" not in text:
                text = text.replace(
                    "</resources>",
                    '    <color name="ic_launcher_background">#000000</color>\n</resources>',
                )
                colors_xml.write_text(text, encoding="utf-8")
        elif not colors.exists():
            colors.write_text(
                """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#000000</color>
</resources>
""",
                encoding="utf-8",
            )

    print("Done.")


if __name__ == "__main__":
    main()
