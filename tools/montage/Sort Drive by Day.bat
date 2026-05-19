@echo off
title Joe 30th - Sort Drive Media by Day
color 0B

echo.
echo =====================================================
echo   Joe 30th - Sort Drive Media by Day
echo =====================================================
echo.
echo This will sort all photos and videos in G:\ into
echo Day 1-6 folders based on when each file was taken.
echo.
echo If exiftool isn't installed, it'll be installed via
echo winget automatically.
echo.
echo You'll get TWO chances to confirm before any file moves.
echo.
pause
echo.

echo --- STEP 1: DRY RUN (preview only, no changes) ---
echo.
PowerShell -ExecutionPolicy Bypass -File "%~dp0sort_by_day.ps1" -Source "G:\" -DryRun
if errorlevel 1 (
    echo.
    echo Dry-run failed. Fix the error above and try again.
    pause
    exit /b 1
)

echo.
echo =====================================================
echo  Review the Summary above. Does it look right?
echo  (e.g. Day 4 - THE BIG DAY should have the most files)
echo =====================================================
echo.

choice /C YN /M "Proceed with real run (MOVE files into G:\sorted)"
if errorlevel 2 goto :cancel
if errorlevel 1 goto :realrun

:realrun
echo.
echo --- STEP 2: REAL RUN (moving files now) ---
echo.
PowerShell -ExecutionPolicy Bypass -File "%~dp0sort_by_day.ps1" -Source "G:\" -Move
echo.
echo =====================================================
echo  All done! Your sorted folders are in: G:\sorted\
echo  Drive Desktop will sync them up to the cloud.
echo =====================================================
echo.
pause
exit /b 0

:cancel
echo.
echo Cancelled. No files were changed.
echo.
pause
exit /b 0
