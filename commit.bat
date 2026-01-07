@echo off

:: Add all changes to git
git add .

:: Commit changes with a message
echo Committing changes...
set /p commit_message="Enter commit message: "
git commit -m "%commit_message%"
sleep 2

:: Push changes to the 'main' branch of the 'cp' remote
git pull hs main

:: Read the current version from package.json
for /f "tokens=2 delims=:, " %%i in ('findstr "version" package.json') do set currentVersion=%%i

:: Remove quotes from the version string
set currentVersion=%currentVersion:"=%

:: Split version into its components
for /f "tokens=1,2,3 delims=." %%a in ("%currentVersion%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
)

:: Increment the patch version
set /a patch+=1

:: Create the new version string
set newVersion=%major%.%minor%.%patch%

:: Update the version in package.json
powershell -Command "(Get-Content package.json) -replace '\"version\": \"%currentVersion%\"', '\"version\": \"%newVersion%\"' | Set-Content package.json"

:: Display the new version
echo New version: %newVersion%

:: Run npm publish using call
call npm run pub

git add .
sleep 1
git commit -m "%commit_message%"
sleep 2

git push hs main


