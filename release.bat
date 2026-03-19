@echo off
setlocal

powershell.exe -ExecutionPolicy Bypass -File "%~dp0release.ps1" %*

endlocal
