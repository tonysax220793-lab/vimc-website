@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo    DAY WEBSITE VIMC LEN GITHUB + VERCEL
echo ============================================================
echo.

where git >nul 2>nul
if errorlevel 1 ( echo [LOI] Chua cai Git. Tai: https://git-scm.com/download/win & pause & exit /b )
where node >nul 2>nul
if errorlevel 1 ( echo [LOI] Chua cai Node.js. Tai: https://nodejs.org & pause & exit /b )

echo --- Buoc 1/3: Khoi tao Git va commit ---
if not exist ".git" git init
git config user.email >nul 2>nul || git config user.email "you@example.com"
git config user.name  >nul 2>nul || git config user.name  "VIMC"
git add .
git commit -m "VIMC website" 2>nul
git branch -M main
echo.

echo --- Buoc 2/3: Ket noi GitHub ---
echo Hay tao 1 repository RONG tai: https://github.com/new
echo (KHONG tick them README / .gitignore / license)
echo.
set /p REPO="Dan link repo (vd: https://github.com/tenban/vimc-website.git): "
git remote remove origin 2>nul
git remote add origin %REPO%
echo Dang day code len GitHub...
git push -u origin main
if errorlevel 1 ( echo [LOI] Push that bai - kiem tra link repo / dang nhap GitHub roi chay lai. & pause & exit /b )
echo.

echo --- Buoc 3/3: Deploy len Vercel ---
echo (Lan dau se mo trinh duyet de dang nhap Vercel - chon "Other" neu duoc hoi framework)
call npx --yes vercel --prod
echo.

echo ============================================================
echo    HOAN TAT! Link website (Production) hien o ben tren.
echo    Lan sau muon cap nhat: chay lai file nay (hoac chi can
echo    git add/commit/push - Vercel se tu deploy lai).
echo ============================================================
pause
