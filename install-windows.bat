@echo off
REM Broadcast Control Center - Windows Quick Install Script
REM This script automates the installation process for Windows

echo ===================================================================
echo       Broadcast Control Center - Windows Quick Install
echo ===================================================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18.x or higher from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

REM Check if Git is installed
echo Checking Git installation...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [SUCCESS] All prerequisites are installed!
echo.

REM Display versions
echo [INFO] Node.js version:
node --version
echo [INFO] npm version:
npm --version
echo [INFO] Git version:
git --version
echo.

REM Navigate to script directory
cd /d "%~dp0"

REM Clone repository if it doesn't exist
if not exist "broadcast-control-center" (
    echo [INFO] Cloning repository...
    git clone https://github.com/shihan84/broadcast-control-center.git
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to clone repository
        pause
        exit /b 1
    )
    echo [SUCCESS] Repository cloned successfully
) else (
    echo [WARNING] Repository already exists. Pulling latest changes...
    cd broadcast-control-center
    git pull origin main
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to pull latest changes, continuing...
    )
    cd ..
)

REM Change to project directory
cd broadcast-control-center

REM Install npm packages
echo [INFO] Installing npm dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install npm dependencies
    pause
    exit /b 1
)
echo [SUCCESS] npm dependencies installed successfully

REM Install streaming dependencies
echo [INFO] Installing streaming dependencies...
npm install scte35 flv.js hls.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install streaming dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Streaming dependencies installed successfully

REM Create environment file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating environment file...
    copy .env.example .env
    echo [SUCCESS] Environment file created successfully
) else (
    echo [WARNING] Environment file already exists
)

REM Database setup
echo [INFO] Setting up database...
npm run db:generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)

npm run db:push
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push database schema
    pause
    exit /b 1
)
echo [SUCCESS] Database setup completed successfully

REM Build application
echo [INFO] Building application...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application
    pause
    exit /b 1
)
echo [SUCCESS] Application built successfully

REM Create batch scripts for management
echo [INFO] Creating management scripts...

REM Start script
echo @echo off > start.bat
echo cd /d "%~dp0" >> start.bat
echo echo Starting Broadcast Control Center... >> start.bat
echo npm start >> start.bat

REM Development start script
echo @echo off > dev.bat
echo cd /d "%~dp0" >> dev.bat
echo echo Starting Broadcast Control Center in development mode... >> dev.bat
echo npm run dev >> dev.bat

REM Stop script
echo @echo off > stop.bat
echo echo Stopping Broadcast Control Center... >> stop.bat
echo taskkill /F /IM node.exe >> stop.bat
echo echo Broadcast Control Center stopped >> stop.bat

echo [SUCCESS] Management scripts created

REM Create Windows service installation script
echo [INFO] Creating Windows service installation script...
echo @echo off > install-service.bat
echo echo Installing Broadcast Control Center as Windows Service... >> install-service.bat
echo npm install -g pm2 >> install-service.bat
echo pm2 start ecosystem.config.js >> install-service.bat
echo pm2 save >> install-service.bat
echo pm2 startup >> install-service.bat
echo echo Windows service installed successfully! >> install-service.bat

REM Display completion message
echo.
echo ===================================================================
echo [SUCCESS] Installation completed successfully!
echo ===================================================================
echo.
echo [INFO] Application installed in: %CD%
echo.
echo [INFO] Management Commands:
echo   Development mode:  dev.bat
echo   Production mode:   start.bat
echo   Stop application:  stop.bat
echo.
echo [INFO] Access the application at:
echo   http://localhost:3000
echo.
echo [INFO] For production deployment:
echo   1. Run: install-service.bat (installs PM2 and sets up Windows service)
echo   2. Configure your .env file for production use
echo   3. Set up Windows Firewall rules
echo   4. Configure SSL/HTTPS for production
echo.
echo [WARNING] Remember to:
echo   - Edit .env file for production settings
echo   - Configure Windows Firewall
echo   - Set up SSL/HTTPS for production
echo   - Configure database backups
echo.
echo ===================================================================
echo Thank you for installing Broadcast Control Center!
echo ===================================================================
echo.
pause