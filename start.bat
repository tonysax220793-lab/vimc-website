@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   VIMC website dang chay
echo   Mo trinh duyet: http://localhost:3001
echo   Dung server: dong cua so nay hoac bam Ctrl+C
echo ============================================
node server.js
pause
