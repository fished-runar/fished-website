@echo off
cd /d "%~dp0"
start http://localhost:3031
python -m http.server 3031
