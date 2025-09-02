# Broadcast Control Center - Installation Guide

This guide provides step-by-step instructions for installing the Broadcast Control Center on Windows and Ubuntu 22.04.

## 📋 System Requirements

### Minimum Requirements
- **CPU**: 4 cores (8 cores recommended)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 20GB free space
- **Network**: Stable internet connection for package downloads

### Software Dependencies
- **Node.js**: v18.x or higher
- **npm**: v8.x or higher
- **Git**: For version control
- **SQLite**: Included with the application

---

## 🪟 Windows Installation

### Step 1: Install Prerequisites

#### 1.1 Install Node.js and npm
1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Select the **LTS version** (Long Term Support)
3. Run the installer with default settings
4. Verify installation:

```cmd
node --version
npm --version
```

#### 1.2 Install Git
1. Download Git from [https://git-scm.com/](https://git-scm.com/)
2. Run the installer with default settings
3. Verify installation:

```cmd
git --version
```

#### 1.3 Install Visual Studio Build Tools (Required for some npm packages)
1. Download from [https://visualstudio.microsoft.com/visual-cpp-build-tools/](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Install "Desktop development with C++" workload
3. This ensures native modules compile correctly

### Step 2: Clone the Repository

1. Open Command Prompt or PowerShell
2. Navigate to your desired installation directory:

```cmd
cd C:\projects
```

3. Clone the repository:

```cmd
git clone https://github.com/shihan84/broadcast-control-center.git
cd broadcast-control-center
```

### Step 3: Install Dependencies

1. Install npm packages:

```cmd
npm install
```

2. Install additional streaming dependencies:

```cmd
npm install scte35 flv.js hls.js
```

### Step 4: Environment Setup

1. Create environment file:

```cmd
copy .env.example .env
```

2. Edit `.env` file with your preferred text editor (Notepad, VS Code, etc.):

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Application Configuration
NODE_ENV="development"
PORT="3000"

# Optional: Add your own configurations
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 5: Database Setup

1. Generate Prisma client:

```cmd
npm run db:generate
```

2. Push database schema:

```cmd
npm run db:push
```

### Step 6: Build the Application

1. Build the Next.js application:

```cmd
npm run build
```

### Step 7: Run the Application

#### Development Mode
```cmd
npm run dev
```

#### Production Mode
```cmd
npm run start
```

### Step 8: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

### Step 9: Windows Firewall Configuration

1. When prompted, allow Node.js through Windows Firewall
2. Or manually configure:
   - Open Windows Defender Firewall
   - Click "Allow an app or feature through Windows Defender Firewall"
   - Add "Node.js" and allow on private networks

---

## 🐧 Ubuntu 22.04 Installation

### Step 1: Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Prerequisites

#### 2.1 Install Node.js and npm
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 2.2 Install Git
```bash
sudo apt install -y git

# Verify installation
git --version
```

#### 2.3 Install Build Essentials
```bash
sudo apt install -y build-essential
```

### Step 3: Clone the Repository

```bash
# Navigate to your desired directory
cd /home/$USER

# Clone the repository
git clone https://github.com/shihan84/broadcast-control-center.git

# Change to project directory
cd broadcast-control-center
```

### Step 4: Install Dependencies

```bash
# Install npm packages
npm install

# Install streaming dependencies
npm install scte35 flv.js hls.js
```

### Step 5: Environment Setup

```bash
# Create environment file
cp .env.example .env

# Edit environment file
nano .env
```

Add the following configuration:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Application Configuration
NODE_ENV="development"
PORT="3000"

# Optional: Add your own configurations
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

Save and exit (Ctrl+X, then Y, then Enter).

### Step 6: Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

### Step 7: Build the Application

```bash
# Build the Next.js application
npm run build
```

### Step 8: Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run start
```

### Step 9: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

### Step 10: Ubuntu Firewall Configuration (Optional)

If you have UFW enabled, allow the application port:

```bash
# Allow port 3000
sudo ufw allow 3000

# Enable firewall (if not already enabled)
sudo ufw enable
```

---

## 🚀 Production Deployment

### Windows Production Setup

#### 1. Install PM2 (Process Manager)
```cmd
npm install -g pm2
```

#### 2. Create PM2 Configuration File
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'broadcast-control-center',
    script: 'server.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'file:./prod.db'
    }
  }]
}
```

#### 3. Start Application with PM2
```cmd
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Ubuntu Production Setup

#### 1. Install PM2
```bash
sudo npm install -g pm2
```

#### 2. Create PM2 Configuration File
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'broadcast-control-center',
    script: 'server.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'file:./prod.db'
    }
  }]
}
```

#### 3. Start Application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Set Up Nginx (Optional, for reverse proxy)
```bash
sudo apt install -y nginx
```

Create Nginx configuration at `/etc/nginx/sites-available/broadcast-control-center`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/broadcast-control-center /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
**Windows:**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Ubuntu:**
```bash
sudo lsof -ti:3000 | xargs kill -9
```

#### 2. Permission Issues
**Ubuntu:**
```bash
sudo chown -R $USER:$USER /home/$USER/broadcast-control-center
chmod -R 755 /home/$USER/broadcast-control-center
```

#### 3. Database Connection Issues
- Ensure SQLite file permissions are correct
- Check DATABASE_URL in .env file
- Delete and recreate database file if corrupted

#### 4. Build Errors
**Windows:**
- Ensure Visual Studio Build Tools are installed
- Run `npm rebuild` if native modules fail

**Ubuntu:**
- Ensure build-essential is installed
- Run `npm rebuild` if native modules fail

#### 5. WebSocket Connection Issues
- Check firewall settings
- Ensure port 3000 is accessible
- Verify Socket.IO configuration

### Log Files

#### Development Logs
```bash
# View real-time logs
npm run dev 2>&1 | tee dev.log
```

#### Production Logs (PM2)
```bash
# View logs
pm2 logs broadcast-control-center

# Monitor logs
pm2 monit
```

---

## 📚 Additional Configuration

### Environment Variables

Create a `.env.local` file for sensitive data:

```env
# Database
DATABASE_URL="file:./prod.db"

# Authentication
NEXTAUTH_SECRET="your-very-secure-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# External Services (Optional)
STREAMING_API_KEY="your-api-key"
MONITORING_WEBHOOK="your-webhook-url"
```

### SSL/HTTPS Setup

For production, set up SSL using Let's Encrypt:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Backup Configuration

Regular database backups:

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /path/to/your/database.db $BACKUP_DIR/database_$DATE.db
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab for automatic backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## 🎯 Verification Steps

After installation, verify the application is working correctly:

1. **Access Dashboard**: Open `http://localhost:3000`
2. **Check Database**: Create a test channel and verify it persists
3. **Test WebSocket**: Real-time updates should work in the monitoring tab
4. **Verify SCTE-35**: Create a test SCTE-35 event
5. **Check Streaming**: Test stream input/output connections

---

## 📞 Support

If you encounter any issues during installation:

1. Check the troubleshooting section above
2. Review log files for error messages
3. Ensure all system requirements are met
4. Verify environment configurations
5. Check network connectivity and firewall settings

For additional support, create an issue on the GitHub repository or consult the project documentation.

---

## 🔄 Updates

To update the application to the latest version:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild database if schema changed
npm run db:push

# Rebuild application
npm run build

# Restart application
pm2 restart broadcast-control-center
```

---

*This installation guide covers both development and production setups for the Broadcast Control Center. Follow the appropriate sections based on your use case and operating system.*