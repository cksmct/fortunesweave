@echo off
setlocal
cd /d "%~dp0"
set CODEBUDDY_SAFE_DELETE_ENABLED=0
if exist .next rd /s /q .next
if exist out rd /s /q out
call npm run build
