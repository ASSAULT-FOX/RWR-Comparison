from pathlib import Path
import argparse
import sys

try:
    from PIL import Image
except ImportError:
    print("Missing dependency: Pillow. Install it with: python -m pip install pillow", file=sys.stderr)
    raise SystemExit(1)


def convert_pngs(root: Path, quality: int, lossless: bool, dry_run: bool) -> tuple[int, int]:
    converted = 0
    deleted = 0
    for png_path in sorted(root.rglob("*.png")):
        webp_path = png_path.with_suffix(".webp")
        if dry_run:
            action = "would convert" if not webp_path.exists() else "would overwrite"
            print(f"{action}: {png_path} -> {webp_path}")
            continue

        with Image.open(png_path) as image:
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA")
            image.save(webp_path, "WEBP", quality=quality, lossless=lossless, method=6)
        converted += 1
        png_path.unlink()
        deleted += 1
        print(f"converted and deleted: {png_path} -> {webp_path}")
    return converted, deleted


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert every PNG under a directory to same-name WebP, then delete the PNG.")
    parser.add_argument("root", nargs="?", default=".", help="Directory to scan. Defaults to current directory.")
    parser.add_argument("--quality", type=int, default=82, help="WebP quality for lossy output. Defaults to 82.")
    parser.add_argument("--lossless", action="store_true", help="Use lossless WebP output.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned conversions without writing or deleting files.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if not root.is_dir():
        print(f"Not a directory: {root}", file=sys.stderr)
        return 2

    converted, deleted = convert_pngs(root, args.quality, args.lossless, args.dry_run)
    if args.dry_run:
        print("dry run complete")
    else:
        print(f"complete: converted {converted}, deleted {deleted}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
