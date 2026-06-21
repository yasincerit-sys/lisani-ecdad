@echo off
cd /d "%~dp0"
c:\xampp\php\php.exe artisan migrate --force
c:\xampp\php\php.exe artisan lisani:sync-preset-accounts
pause
