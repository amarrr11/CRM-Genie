@echo off
echo ========================================
echo    AI-Powered CRM System Startup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found
    echo Please create a .env file with your configuration
    echo See README.md for details
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing server dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install server dependencies
        pause
        exit /b 1
    )
)

REM Install client dependencies if needed
if not exist "client\node_modules" (
    echo 📦 Installing client dependencies...
    cd client
    npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Failed to install client dependencies
        pause
        exit /b 1
    )
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Starting all services...
echo.

REM Start the development server
echo Starting development server (this will start both server and client)...
npm run dev

pause 