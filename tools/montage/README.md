# Joe's 30th Birthday — Montage Builder

A one-shot script that stitches every photo + video in a folder into a polished
montage video, optionally synced to a music track.

## What you'll do
1. Download the Google Drive folder of trip content to your computer
2. Install ffmpeg
3. Run the script — it scans the folder, sorts the files, and renders an mp4

## 1. Install ffmpeg

| OS | Command |
|----|---------|
| macOS | `brew install ffmpeg` |
| Windows | `winget install ffmpeg` (or download from [ffmpeg.org](https://ffmpeg.org/download.html), then run via Git Bash / WSL) |
| Linux | `sudo apt install ffmpeg` |

Verify: `ffmpeg -version`

## 2. Download the Drive folder

In Google Drive: right-click the folder → **Download**. Drive zips it up and
hands you a `.zip`. Unzip somewhere local, e.g. `~/joe30-content/`.

## 3. Run the script

From this repo root:

```bash
# Bare-bones: hard cuts, no music
./tools/montage/build_montage.sh ~/joe30-content

# Add a music track + nicer crossfades
./tools/montage/build_montage.sh ~/joe30-content \
    -m grand-adventure.mp3 \
    -x

# Full custom run
./tools/montage/build_montage.sh ~/joe30-content \
    -o joe30-final.mp4 \
    -m grand-adventure.mp3 \
    -p 2.5 \
    -v 8 \
    -x \
    -s exif
```

## Flags

| Flag | Meaning | Default |
|------|---------|---------|
| `-o FILE` | Output filename | `joe30-montage.mp4` |
| `-m FILE` | Music track to overlay | none (keeps original video audio) |
| `-p SECS` | Seconds per still photo | `3` |
| `-v SECS` | Max seconds per video clip (longer clips get trimmed from the start) | `8` |
| `-x` | Enable crossfade between clips (slower render) | hard cuts |
| `-s MODE` | Sort order: `name` / `mtime` / `exif` | `name` |

### Sort modes
- **`name`** — alphabetical by filename. Fastest. Use this if Drive sensibly names files.
- **`mtime`** — modified-time order. Good when filenames are random IDs.
- **`exif`** — true chronological order from photo/video EXIF metadata. Needs `exiftool` installed (`brew install exiftool`).

## What the script does internally
- Each photo is held for `-p` seconds, scaled to 1080p, padded with black bars to preserve aspect
- Each video is trimmed to max `-v` seconds, scaled to 1080p
- All clips concatenated into a single 1920×1080 / 30fps H.264 mp4
- If `-m` is given: video's own audio is ducked to 20% under the music
- Workdir is cleaned up automatically when done

## Tips
- The first run is the slowest because it transcodes every clip. Subsequent
  re-renders go faster if you cache the workdir (not yet supported — open a PR).
- If a clip is sideways: re-export it from your phone before running. The
  script respects orientation metadata from ffmpeg but not all sources tag it.
- For a multi-act montage (intro → trip → outro), make 3 folders, run the
  script on each, and concatenate the outputs with:
  ```bash
  printf "file 'intro.mp4'\nfile 'trip.mp4'\nfile 'outro.mp4'\n" > parts.txt
  ffmpeg -f concat -safe 0 -i parts.txt -c copy final.mp4
  ```

## Embedding on the trip site
Once the mp4 is rendered, upload it to YouTube (unlisted) or Vimeo and embed
the iframe on `social.html` or a new `montage.html`. Ask Claude to wire up the
page — it knows the site's theme conventions.
