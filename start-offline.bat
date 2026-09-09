@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  start "Snag offline server" /min py -m http.server 8765
) else (
  where python >nul 2>&1
  if %errorlevel%==0 (
    start "Snag offline server" /min python -m http.server 8765
  ) else (
    start "Snag" "%~dp0index.html"
    echo Snag was opened directly from the local files.
    echo For the most reliable multi-page storage, install Python and run this file again.
    timeout /t 3 >nul
    exit /b 0
  )
)
start "Snag" http://localhost:8765/index.html
endlocal
