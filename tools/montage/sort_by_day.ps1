# Joe's 30th — Sort Drive Media by Day (PowerShell version)
#
# Reads creation date from each photo/video and copies/moves into
# Day 1-6 subfolders. No Python required — uses native PowerShell + exiftool.
#
# Run from PowerShell:
#   .\sort_by_day.ps1 -Source "G:\" -DryRun
#   .\sort_by_day.ps1 -Source "G:\" -Move
#
# Or just double-click the companion "Sort Drive by Day.bat" file.

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Source,
    [string]$Dest = "",
    [switch]$Move,
    [switch]$DryRun,
    [switch]$Recursive
)

$ErrorActionPreference = "Stop"

# ---- Trip configuration ----
$tripStart = [datetime]"2026-04-29"
$tripEndExclusive = [datetime]"2026-05-05"
$dayLabels = @{
    1 = "Day 1 - Wed 29 Apr - Travel & Arrival"
    2 = "Day 2 - Thu 30 Apr - Settling In"
    3 = "Day 3 - Fri 01 May - Adventure"
    4 = "Day 4 - Sat 02 May - THE BIG DAY"
    5 = "Day 5 - Sun 03 May - Last Full Day"
    6 = "Day 6 - Mon 04 May - Au Revoir"
}

# ---- Check / install exiftool ----
function Test-Exiftool {
    return [bool](Get-Command exiftool -ErrorAction SilentlyContinue)
}

if (-not (Test-Exiftool)) {
    Write-Host "exiftool not found. Installing via winget..." -ForegroundColor Yellow
    try {
        winget install -e --id OliverBetz.ExifTool --accept-source-agreements --accept-package-agreements
    } catch {
        Write-Host "ERROR: winget install failed." -ForegroundColor Red
        Write-Host "Install exiftool manually from https://exiftool.org and re-run." -ForegroundColor Red
        exit 1
    }
    # Refresh PATH for current session
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not (Test-Exiftool)) {
        Write-Host "ERROR: exiftool still not found after install." -ForegroundColor Red
        Write-Host "Try closing this window and reopening, then re-run." -ForegroundColor Red
        exit 1
    }
}

# ---- Validate source ----
if (-not (Test-Path $Source -PathType Container)) {
    Write-Host "ERROR: source folder not found: $Source" -ForegroundColor Red
    exit 1
}

if (-not $Dest) { $Dest = Join-Path $Source "sorted" }

Write-Host ""
Write-Host "Source:      $Source" -ForegroundColor Cyan
Write-Host "Destination: $Dest" -ForegroundColor Cyan
$modeStr = if ($Move) { "MOVE" } else { "COPY" }
if ($DryRun) { $modeStr += "  (DRY RUN)" }
Write-Host "Mode:        $modeStr" -ForegroundColor Cyan
Write-Host ""

# ---- Read metadata ----
Write-Host "Reading metadata from all files (this can take a minute)..." -ForegroundColor Yellow
$exifArgs = @("-json", "-DateTimeOriginal", "-CreateDate", "-MediaCreateDate", "-FileModifyDate")
$exts = @("jpg","jpeg","png","heic","mp4","mov","m4v","avi","mkv","webp","gif")
foreach ($e in $exts) { $exifArgs += @("-ext", $e) }
if ($Recursive) { $exifArgs += "-r" }
$exifArgs += $Source

$jsonOut = & exiftool @exifArgs 2>&1 | Out-String
if (-not $jsonOut.Trim()) {
    Write-Host "No media files found in $Source" -ForegroundColor Red
    exit 1
}

try {
    $items = $jsonOut | ConvertFrom-Json
} catch {
    Write-Host "ERROR: could not parse exiftool output." -ForegroundColor Red
    Write-Host $jsonOut
    exit 1
}

if ($items.Count -eq 0) {
    Write-Host "No media files found." -ForegroundColor Red
    exit 1
}
Write-Host ("Found {0} media files.`n" -f $items.Count) -ForegroundColor Green

# ---- Process each file ----
$stats = @{}
$i = 0
foreach ($item in $items) {
    $i++
    $srcPath = $item.SourceFile

    # Skip files already inside the destination (re-runs)
    if ($srcPath.StartsWith($Dest, [System.StringComparison]::OrdinalIgnoreCase)) { continue }

    # Parse date — try each candidate field
    $dt = $null
    foreach ($key in @("DateTimeOriginal","CreateDate","MediaCreateDate","FileModifyDate")) {
        $val = $item.$key
        if (-not $val) { continue }
        # Strip timezone suffix
        $val = ($val -replace "([+-]\d{2}:\d{2}|Z).*$","").Trim()
        if ($val.Length -lt 19) { continue }
        try {
            $dt = [datetime]::ParseExact($val.Substring(0,19), "yyyy:MM:dd HH:mm:ss", $null)
            break
        } catch { continue }
    }

    # Categorize
    if ($null -eq $dt) {
        $folder = "00 - Undated"; $prefix = "X"
    } elseif ($dt.Date -lt $tripStart) {
        $folder = "00 - Pre-trip"; $prefix = "PRE"
    } elseif ($dt.Date -ge $tripEndExclusive) {
        $folder = "07 - Post-trip"; $prefix = "POST"
    } else {
        $dayIdx = ($dt.Date - $tripStart).Days + 1
        $folder = $dayLabels[$dayIdx]; $prefix = "D$dayIdx"
    }

    $ts = if ($dt) { $dt.ToString("HHmmss") } else { "000000" }
    $fileName = Split-Path $srcPath -Leaf
    $newName = "${prefix}_${ts}_${fileName}"
    $targetDir = Join-Path $Dest $folder
    $target = Join-Path $targetDir $newName

    if (-not $stats.ContainsKey($folder)) { $stats[$folder] = 0 }
    $stats[$folder]++

    if ($i -le 20 -or $i % 50 -eq 0) {
        $shortName = if ($fileName.Length -gt 40) { $fileName.Substring(0,40) } else { $fileName }
        $shortNew = if ($newName.Length -gt 50) { $newName.Substring(0,50) } else { $newName }
        Write-Host ("  [{0,4}/{1}]  {2,-40}  ->  {3}/{4}" -f $i, $items.Count, $shortName, $folder, $shortNew)
    }

    if (-not $DryRun) {
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        if (-not (Test-Path -LiteralPath $target)) {
            try {
                if ($Move) {
                    Move-Item -LiteralPath $srcPath -Destination $target
                } else {
                    Copy-Item -LiteralPath $srcPath -Destination $target
                }
            } catch {
                Write-Host ("    skip ({0}): {1}" -f $fileName, $_.Exception.Message) -ForegroundColor DarkYellow
            }
        }
    }
}

# ---- Summary ----
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
foreach ($key in ($stats.Keys | Sort-Object)) {
    Write-Host ("  {0,4}  {1}" -f $stats[$key], $key)
}
Write-Host ""
if ($DryRun) {
    Write-Host "Dry run complete — no files changed." -ForegroundColor Yellow
} else {
    Write-Host ("Done. Files sorted into: {0}" -f $Dest) -ForegroundColor Green
}
Write-Host ""
