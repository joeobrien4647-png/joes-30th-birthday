#!/usr/bin/env bash
#
# Joe's 30th Birthday — Montage Builder
# ---------------------------------------------------------
# Stitches every photo and video in a folder into a single
# polished montage video, optionally with a music track.
#
# Usage:
#   ./build_montage.sh <media_folder> [-o output.mp4] [-m music.mp3]
#                      [-p PHOTO_SECS] [-v MAX_VIDEO_SECS] [-x]
#                      [-s sort_mode]
#
# Examples:
#   ./build_montage.sh ./drive_download
#   ./build_montage.sh ./drive_download -m grand-adventure.mp3 -x
#   ./build_montage.sh ./drive_download -o joe30.mp4 -p 2.5 -v 8 -m music.mp3
#
# Flags:
#   -o  output file               (default: joe30-montage.mp4)
#   -m  music track to overlay    (default: none — video audio kept)
#   -p  seconds per photo         (default: 3)
#   -v  max seconds per video     (default: 8 — longer clips get trimmed)
#   -x  enable crossfade between clips (slower render, nicer result)
#   -s  sort mode: name | mtime | exif   (default: name)
#
# Requirements:
#   - ffmpeg + ffprobe          (brew install ffmpeg  /  apt install ffmpeg)
#   - exiftool (only if -s exif)
#
# Windows users: run via WSL or Git Bash.
# ---------------------------------------------------------

set -euo pipefail

# ---- defaults ----
OUTPUT="joe30-montage.mp4"
MUSIC=""
PHOTO_DURATION=3
MAX_VIDEO_DURATION=8
CROSSFADE=0
SORT_MODE="name"
WIDTH=1920
HEIGHT=1080
FPS=30

# ---- parse args ----
if [[ $# -lt 1 ]]; then
  sed -n '2,30p' "$0"
  exit 1
fi

MEDIA_DIR="$1"; shift

while getopts "o:m:p:v:s:x" opt; do
  case "$opt" in
    o) OUTPUT="$OPTARG" ;;
    m) MUSIC="$OPTARG" ;;
    p) PHOTO_DURATION="$OPTARG" ;;
    v) MAX_VIDEO_DURATION="$OPTARG" ;;
    s) SORT_MODE="$OPTARG" ;;
    x) CROSSFADE=1 ;;
    *) exit 1 ;;
  esac
done

if [[ ! -d "$MEDIA_DIR" ]]; then
  echo "ERROR: media folder not found: $MEDIA_DIR" >&2
  exit 1
fi

command -v ffmpeg >/dev/null || { echo "ERROR: ffmpeg not installed"; exit 1; }
command -v ffprobe >/dev/null || { echo "ERROR: ffprobe not installed"; exit 1; }

# ---- gather files ----
echo ">> Scanning $MEDIA_DIR..."
case "$SORT_MODE" in
  name)
    mapfile -t FILES < <(find "$MEDIA_DIR" -maxdepth 1 -type f \( \
      -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.heic' \
      -o -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.avi' \
      -o -iname '*.mkv' \
      \) | LC_ALL=C sort)
    ;;
  mtime)
    mapfile -t FILES < <(find "$MEDIA_DIR" -maxdepth 1 -type f \( \
      -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.heic' \
      -o -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.avi' \
      -o -iname '*.mkv' \
      \) -printf '%T@ %p\n' | sort -n | cut -d' ' -f2-)
    ;;
  exif)
    command -v exiftool >/dev/null || { echo "ERROR: exiftool required for -s exif"; exit 1; }
    mapfile -t FILES < <(exiftool -q -r -if '$filename =~ /\.(jpe?g|png|heic|mp4|mov|m4v|avi|mkv)$/i' \
      -d '%Y%m%d%H%M%S' -p '${DateTimeOriginal;}|${FileName}|${Directory}' "$MEDIA_DIR" \
      | sort | awk -F'|' '{print $3"/"$2}')
    ;;
  *) echo "ERROR: unknown sort mode: $SORT_MODE"; exit 1 ;;
esac

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "ERROR: no media files found in $MEDIA_DIR" >&2
  exit 1
fi

echo ">> Found ${#FILES[@]} file(s). Sort mode: $SORT_MODE"

# ---- workdir ----
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

CONCAT_LIST="$WORK/concat.txt"
: > "$CONCAT_LIST"

PHOTO_FILTER="scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=$FPS,format=yuv420p"
VIDEO_FILTER="scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=$FPS,format=yuv420p"

i=0
for FILE in "${FILES[@]}"; do
  i=$((i+1))
  EXT_LOWER=$(echo "${FILE##*.}" | tr '[:upper:]' '[:lower:]')
  CLIP="$WORK/clip_$(printf '%04d' $i).mp4"

  printf "  [%3d/%d] %s\n" "$i" "${#FILES[@]}" "$(basename "$FILE")"

  case "$EXT_LOWER" in
    jpg|jpeg|png|heic)
      ffmpeg -hide_banner -loglevel error -y \
        -loop 1 -t "$PHOTO_DURATION" -i "$FILE" \
        -vf "$PHOTO_FILTER" \
        -c:v libx264 -preset fast -tune stillimage -pix_fmt yuv420p -r "$FPS" \
        -f lavfi -t "$PHOTO_DURATION" -i anullsrc=channel_layout=stereo:sample_rate=44100 \
        -c:a aac -b:a 128k -shortest \
        "$CLIP"
      ;;
    mp4|mov|m4v|avi|mkv)
      DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$FILE" 2>/dev/null || echo 0)
      TRIM=$(awk -v d="$DUR" -v m="$MAX_VIDEO_DURATION" 'BEGIN{print (d<m && d>0)?d:m}')
      ffmpeg -hide_banner -loglevel error -y \
        -i "$FILE" -t "$TRIM" \
        -vf "$VIDEO_FILTER" \
        -c:v libx264 -preset fast -pix_fmt yuv420p -r "$FPS" \
        -c:a aac -b:a 128k -ac 2 -ar 44100 \
        "$CLIP" 2>/dev/null || {
          # Some clips have no audio — re-encode with silent track
          ffmpeg -hide_banner -loglevel error -y \
            -i "$FILE" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
            -t "$TRIM" -vf "$VIDEO_FILTER" \
            -c:v libx264 -preset fast -pix_fmt yuv420p -r "$FPS" \
            -c:a aac -b:a 128k -shortest \
            "$CLIP"
        }
      ;;
    *) continue ;;
  esac

  echo "file '$CLIP'" >> "$CONCAT_LIST"
done

# ---- concat (with or without crossfade) ----
SILENT_OUT="$WORK/montage_raw.mp4"

if [[ $CROSSFADE -eq 1 ]]; then
  echo ">> Stitching ${#FILES[@]} clips with crossfade..."
  # Build a filter_complex graph chaining xfade between every consecutive clip.
  CLIPS=()
  while IFS= read -r line; do
    CLIPS+=("${line#file \'}")
    CLIPS[-1]="${CLIPS[-1]%\'}"
  done < "$CONCAT_LIST"

  XFADE=0.5
  INPUTS=()
  for c in "${CLIPS[@]}"; do INPUTS+=(-i "$c"); done

  N=${#CLIPS[@]}
  FILTER=""
  PREV="0:v"
  PREV_A="0:a"
  OFFSET=0
  for ((k=1; k<N; k++)); do
    PREV_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${CLIPS[$((k-1))]}")
    OFFSET=$(awk -v o="$OFFSET" -v d="$PREV_DUR" -v x="$XFADE" 'BEGIN{print o + d - x}')
    LABEL_V="v$k"
    LABEL_A="a$k"
    FILTER+="[$PREV][$k:v]xfade=transition=fade:duration=$XFADE:offset=$OFFSET[$LABEL_V];"
    FILTER+="[$PREV_A][$k:a]acrossfade=d=$XFADE[$LABEL_A];"
    PREV="$LABEL_V"
    PREV_A="$LABEL_A"
  done

  ffmpeg -hide_banner -loglevel warning -y "${INPUTS[@]}" \
    -filter_complex "$FILTER" \
    -map "[$PREV]" -map "[$PREV_A]" \
    -c:v libx264 -preset medium -pix_fmt yuv420p \
    -c:a aac -b:a 192k \
    "$SILENT_OUT"
else
  echo ">> Stitching ${#FILES[@]} clips (hard cuts)..."
  ffmpeg -hide_banner -loglevel error -y \
    -f concat -safe 0 -i "$CONCAT_LIST" \
    -c copy "$SILENT_OUT"
fi

# ---- music overlay ----
if [[ -n "$MUSIC" ]]; then
  if [[ ! -f "$MUSIC" ]]; then
    echo "WARNING: music file not found: $MUSIC — skipping" >&2
    cp "$SILENT_OUT" "$OUTPUT"
  else
    echo ">> Mixing music: $MUSIC"
    # Duck the video's original audio under the music (-15dB), music at full
    ffmpeg -hide_banner -loglevel error -y \
      -i "$SILENT_OUT" -stream_loop -1 -i "$MUSIC" \
      -filter_complex "[0:a]volume=0.2[va];[1:a]volume=0.9[ma];[va][ma]amix=inputs=2:duration=first:dropout_transition=0[aout]" \
      -map 0:v -map "[aout]" \
      -c:v copy -c:a aac -b:a 192k -shortest \
      "$OUTPUT"
  fi
else
  cp "$SILENT_OUT" "$OUTPUT"
fi

echo ""
echo "Done: $OUTPUT"
ls -lh "$OUTPUT"
