#!/bin/bash

# Broadcast Control Center - Ubuntu 22.04 Quick Install Script
# This script automates the installation process for Ubuntu 22.04

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root. Please run as a regular user."
    exit 1
fi

# Display welcome message
echo "==================================================================="
echo "      Broadcast Control Center - Ubuntu 22.04 Quick Install"
echo "==================================================================="
echo ""

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System packages updated successfully"

# Install Node.js and npm
print_status "Installing Node.js 18.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
print_success "Node.js and npm installed successfully"

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js version: $NODE_VERSION"
print_status "npm version: $NPM_VERSION"

# Install Git
print_status "Installing Git..."
sudo apt install -y git
print_success "Git installed successfully"

# Install build essentials
print_status "Installing build essentials..."
sudo apt install -y build-essential
print_success "Build essentials installed successfully"

# Navigate to home directory
cd ~

# Clone repository if it doesn't exist
if [ ! -d "broadcast-control-center" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/shihan84/broadcast-control-center.git
    print_success "Repository cloned successfully"
else
    print_warning "Repository already exists. Pulling latest changes..."
    cd broadcast-control-center
    git pull origin main
    cd ..
fi

# Change to project directory
cd broadcast-control-center

# Install npm packages
print_status "Installing npm dependencies..."
npm install
print_success "npm dependencies installed successfully"

# Install streaming dependencies
print_status "Installing streaming dependencies..."
npm install scte35 flv.js hls.js
print_success "Streaming dependencies installed successfully"

# Create environment file
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cp .env.example .env
    
    # Update environment file with current user
    sed -i "s|DATABASE_URL=\"file:./dev.db\"|DATABASE_URL=\"file:./dev.db\"|g" .env
    sed -i "s|NODE_ENV=\"development\"|NODE_ENV=\"development\"|g" .env
    sed -i "s|PORT=\"3000\"|PORT=\"3000\"|g" .env
    
    print_success "Environment file created successfully"
else
    print_warning "Environment file already exists"
fi

# Database setup
print_status "Setting up database..."
npm run db:generate
npm run db:push
print_success "Database setup completed successfully"

# Build application
print_status "Building application..."
npm run build
print_success "Application built successfully"

# Create systemd service file for production
print_status "Creating systemd service file..."
cat > broadcast-control-center.service << EOF
[Unit]
Description=Broadcast Control Center
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=file://$(pwd)/prod.db

[Install]
WantedBy=multi-user.target
EOF

print_success "Systemd service file created"

# Create start/stop scripts
print_status "Creating management scripts..."

# Start script
cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Broadcast Control Center..."
npm start
EOF

# Development start script
cat > dev.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Broadcast Control Center in development mode..."
npm run dev
EOF

# Stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "Stopping Broadcast Control Center..."
pkill -f "node.*server.ts"
echo "Broadcast Control Center stopped"
EOF

# Make scripts executable
chmod +x start.sh dev.sh stop.sh
print_success "Management scripts created"

# Display completion message
echo ""
echo "==================================================================="
print_success "Installation completed successfully!"
echo "==================================================================="
echo ""
print_status "Application installed in: $(pwd)"
echo ""
print_status "Management Commands:"
echo "  Development mode:  ./dev.sh"
echo "  Production mode:   ./start.sh"
echo "  Stop application:  ./stop.sh"
echo ""
print_status "Access the application at:"
echo "  http://localhost:3000"
echo ""
print_status "For production deployment:"
echo "  1. Copy the service file: sudo cp broadcast-control-center.service /etc/systemd/system/"
echo "  2. Enable the service: sudo systemctl enable broadcast-control-center"
echo "  3. Start the service: sudo systemctl start broadcast-control-center"
echo ""
print_warning "Remember to:"
echo "  - Configure your .env file for production use"
echo "  - Set up proper firewall rules"
echo "  - Configure SSL/HTTPS for production"
echo "  - Set up database backups"
echo ""
echo "==================================================================="
echo "Thank you for installing Broadcast Control Center!"
echo "==================================================================="