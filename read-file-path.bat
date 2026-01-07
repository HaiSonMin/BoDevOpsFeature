@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ====================================
echo    FILE SEARCH AND LIST UTILITY
echo ====================================
echo.

set /p folder_path="Enter folder path: "

if not exist "%folder_path%" (
    echo.
    echo [ERROR] Folder does not exist!
    pause
    exit /b
)

echo.
set /p file_pattern="Enter file name pattern (press Enter to list all files): "

if "%file_pattern%"=="" (
    set search_mode=ALL_FILES
    set output_file=all_files_%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.txt
) else (
    set search_mode=PATTERN_SEARCH
    set output_file=search_%file_pattern:_=_%_%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.txt
)

set output_file=%output_file: =0%

echo.
echo Searching files...
if "%search_mode%"=="PATTERN_SEARCH" (
    echo Pattern: *%file_pattern%*
) else (
    echo Listing all files...
)
echo.

echo ============ SEARCH RESULTS ============ > "%output_file%"
echo Folder: %folder_path% >> "%output_file%"
echo Time: %date% %time% >> "%output_file%"
if "%search_mode%"=="PATTERN_SEARCH" (
    echo Search Pattern: *%file_pattern%* >> "%output_file%"
) else (
    echo Search Mode: All Files >> "%output_file%"
)
echo ====================================== >> "%output_file%"
echo. >> "%output_file%"

set count=0

if "%search_mode%"=="ALL_FILES" (
    for /r "%folder_path%" %%f in (*) do (
        echo %%f
        echo %%f >> "%output_file%"
        set /a count+=1
    )
) else (
    for /r "%folder_path%" %%f in (*) do (
        echo %%~nxf | findstr /i "%file_pattern%" >nul
        if !errorlevel! equ 0 (
            echo %%f
            echo %%f >> "%output_file%"
            set /a count+=1
        )
    )
)

echo.
echo ====================================
if "%search_mode%"=="PATTERN_SEARCH" (
    echo Total matching files: %count%
) else (
    echo Total files: %count%
)
echo Result saved to: %output_file%
echo ====================================
echo.

pause
