#!/usr/bin/env python3
"""
Sort Joe's 30th birthday trip media into chronological Day folders.

Reads creation date metadata from each photo/video using exiftool, then
copies (or moves) into Day 1-6 subfolders with a renamed prefix that
preserves order when sorted alphabetically.

Trip dates: Wed 29 Apr 2026 - Mon 04 May 2026.

Usage examples:
    # Dry-run first to see what will happen
    python sort_by_day.py "G:\\" --dry-run

    # Copy into G:\\sorted\\Day 1...\\ subfolders (originals untouched)
    python sort_by_day.py "G:\\"

    # Move (faster, no duplicates) once you're happy with the dry-run
    python sort_by_day.py "G:\\" --move

    # Recurse into nested subfolders
    python sort_by_day.py "G:\\" --recursive

    # Send sorted output to a different folder
    python sort_by_day.py "G:\\" --dest "D:\\joe30-sorted"

Requires:
    Python 3.7+
    exiftool          (https://exiftool.org  or  `winget install OliverBetz.ExifTool`)
"""

import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


# ---- Trip configuration ----
TRIP_DAYS = [
    (datetime(2026, 4, 29), "Day 1 - Wed 29 Apr - Travel & Arrival"),
    (datetime(2026, 4, 30), "Day 2 - Thu 30 Apr - Settling In"),
    (datetime(2026, 5, 1),  "Day 3 - Fri 01 May - Adventure"),
    (datetime(2026, 5, 2),  "Day 4 - Sat 02 May - THE BIG DAY"),
    (datetime(2026, 5, 3),  "Day 5 - Sun 03 May - Last Full Day"),
    (datetime(2026, 5, 4),  "Day 6 - Mon 04 May - Au Revoir"),
]
TRIP_START = TRIP_DAYS[0][0].date()
TRIP_END_EXCLUSIVE = datetime(2026, 5, 5).date()

MEDIA_EXTS = {'.jpg', '.jpeg', '.png', '.heic', '.mp4', '.mov', '.m4v',
              '.avi', '.mkv', '.webp', '.gif'}


def have_exiftool() -> bool:
    try:
        subprocess.run(['exiftool', '-ver'],
                       capture_output=True, check=True)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def read_dates_batch(source: Path, recursive: bool = False) -> list:
    """Run exiftool once on the whole folder for speed."""
    args = ['exiftool', '-json',
            '-DateTimeOriginal', '-CreateDate', '-MediaCreateDate',
            '-FileModifyDate']
    for ext in MEDIA_EXTS:
        args += ['-ext', ext.lstrip('.')]
    if recursive:
        args.append('-r')
    args.append(str(source))

    result = subprocess.run(args, capture_output=True, text=True)
    if not result.stdout:
        if result.stderr:
            print(f"exiftool stderr: {result.stderr.strip()}", file=sys.stderr)
        return []
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as e:
        print(f"Failed to parse exiftool output: {e}", file=sys.stderr)
        return []


def parse_date(item: dict):
    for key in ['DateTimeOriginal', 'CreateDate',
                'MediaCreateDate', 'FileModifyDate']:
        val = item.get(key)
        if not val:
            continue
        # Strip timezone offsets like '+01:00' or 'Z'
        val = val.split('+')[0].split('Z')[0].strip()
        try:
            return datetime.strptime(val[:19], '%Y:%m:%d %H:%M:%S')
        except ValueError:
            continue
    return None


def categorize(dt):
    if dt is None:
        return ("00 - Undated", "X")
    d = dt.date()
    if d < TRIP_START:
        return ("00 - Pre-trip", "PRE")
    if d >= TRIP_END_EXCLUSIVE:
        return ("07 - Post-trip", "POST")
    day_index = (d - TRIP_START).days
    if 0 <= day_index < len(TRIP_DAYS):
        return (TRIP_DAYS[day_index][1], f"D{day_index + 1}")
    return ("00 - Undated", "X")


def main():
    p = argparse.ArgumentParser(
        description="Sort Joe's 30th trip media into Day 1-6 folders by EXIF date.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split('Requires:')[0],
    )
    p.add_argument('source', help='Source folder (e.g. G:\\)')
    p.add_argument('--dest',
                   help='Destination folder (default: <source>/sorted)')
    p.add_argument('--move', action='store_true',
                   help='Move files instead of copying (no duplicates)')
    p.add_argument('--recursive', '-r', action='store_true',
                   help='Recurse into subfolders of source')
    p.add_argument('--dry-run', action='store_true',
                   help='Print actions without doing them')
    args = p.parse_args()

    if not have_exiftool():
        print("ERROR: exiftool not found.\n"
              "  Install:  https://exiftool.org\n"
              "  Windows:  winget install OliverBetz.ExifTool\n"
              "  macOS:    brew install exiftool",
              file=sys.stderr)
        sys.exit(1)

    source = Path(args.source).resolve()
    if not source.is_dir():
        print(f"ERROR: not a directory: {source}", file=sys.stderr)
        sys.exit(1)

    dest = Path(args.dest).resolve() if args.dest else source / 'sorted'

    print(f"Source:      {source}")
    print(f"Destination: {dest}")
    print(f"Mode:        {'MOVE' if args.move else 'COPY'}"
          f"{'  (DRY RUN)' if args.dry_run else ''}")
    print(f"Reading metadata from all files (can take a minute)...")

    items = read_dates_batch(source, recursive=args.recursive)
    if not items:
        print("No media files found.", file=sys.stderr)
        sys.exit(1)
    print(f"Found {len(items)} media files.\n")

    stats = {}
    for i, item in enumerate(items, 1):
        src_path = Path(item['SourceFile'])
        # Skip files already in the destination (re-runs)
        try:
            if src_path.resolve().is_relative_to(dest):
                continue
        except AttributeError:
            # Python <3.9: fall back to string check
            if str(src_path.resolve()).startswith(str(dest)):
                continue

        dt = parse_date(item)
        folder, prefix = categorize(dt)
        ts = dt.strftime('%H%M%S') if dt else '000000'
        new_name = f"{prefix}_{ts}_{src_path.name}"
        target_dir = dest / folder
        target = target_dir / new_name

        stats[folder] = stats.get(folder, 0) + 1
        # Print first 20 + every 50th so progress is visible without spam
        if i <= 20 or i % 50 == 0:
            print(f"  [{i:>4}/{len(items)}]  "
                  f"{src_path.name[:40]:<40}  ->  {folder}/{new_name[:50]}")

        if not args.dry_run:
            target_dir.mkdir(parents=True, exist_ok=True)
            if target.exists():
                # Avoid collisions on re-runs
                continue
            if args.move:
                shutil.move(str(src_path), str(target))
            else:
                shutil.copy2(str(src_path), str(target))

    print("\n=== Summary ===")
    for folder in sorted(stats.keys()):
        print(f"  {stats[folder]:>4}  {folder}")
    print(f"\nDone{'  (dry-run — no files changed)' if args.dry_run else ''}.")


if __name__ == '__main__':
    main()
