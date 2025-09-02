# 📺 Broadcast Control Center

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Installation Guide](https://img.shields.io/badge/installation-guide-brightgreen.svg)](INSTALLATION.md)
[![Windows Support](https://img.shields.io/badge/windows-supported-blue.svg)](install-windows.bat)
[![Linux Support](https://img.shields.io/badge/linux-supported-green.svg)](install-ubuntu.sh)

A comprehensive, production-ready live TV streaming control center with SCTE-35 support, designed for professional broadcasters. Built with modern web technologies to provide real-time monitoring, event management, and configuration tools with one-click deployment, complete automation, and enhanced SCTE-35 handling.

## ✨ Key Features

### 🎯 Core Functionality
- **🖥️ Professional Dashboard**: Real-time system overview with channel status, viewer counts, and system metrics
- **📺 Stream Management**: Complete input/output management for HLS/RTMP/SRT streams
- **🎯 SCTE-35 Events**: Advanced ad insertion and program event management with timeline visualization
- **📊 Real-time Monitoring**: Live metrics, health checks, and performance monitoring
- **⚙️ Configuration Management**: Template-based system with FFmpeg command generation
- **🚀 Deployment Automation**: One-click deployment with rollback capabilities
- **🌐 WebSocket Support**: Real-time updates and live data streaming

### 🛠️ Technical Capabilities
- **MPEG-TS Support**: Complete MPEG transport stream configuration with 25+ professional parameters
- **FFmpeg Integration**: Automatic command generation for broadcast operations
- **Database-Driven**: Prisma ORM with SQLite for reliable data persistence
- **API-First Architecture**: RESTful APIs with comprehensive error handling
- **Real-time Updates**: Socket.IO integration for live data synchronization
- **Professional UI**: Modern, responsive interface built with shadcn/ui components

## 🚀 Quick Start

### 📋 Installation Guides

For detailed step-by-step installation instructions, please see:

- **[📖 Installation Guide](INSTALLATION.md)** - Comprehensive installation guide for both Windows and Ubuntu 22.04
- **[🪟 Windows Quick Install](install-windows.bat)** - Automated installation script for Windows
- **[🐧 Ubuntu Quick Install](install-ubuntu.sh)** - Automated installation script for Ubuntu 22.04

### Quick Install (Ubuntu 22.04)
```bash
# Download and run the automated installer
wget https://raw.githubusercontent.com/shihan84/broadcast-control-center/master/install-ubuntu.sh
chmod +x install-ubuntu.sh
./install-ubuntu.sh
```

### Quick Install (Windows)
```cmd
# Download and run the automated installer
# Right-click on install-windows.bat and "Run as administrator"
# Or run from Command Prompt:
install-windows.bat
```

### Manual Installation

#### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

#### Installation Steps

```bash
# Clone the repository
git clone https://github.com/shihan84/broadcast-control-center.git
cd broadcast-control-center

# Install dependencies
npm install

# Install streaming dependencies
npm install scte35 flv.js hls.js

# Set up the database
npm run db:push
npm run db:generate

# Start development server
npm run dev
```

### Access the Application

Open [http://localhost:3000](http://localhost:3000) to access the Broadcast Control Center.

## 📋 System Requirements

### Minimum Requirements
- **CPU**: 2+ cores
- **Memory**: 4GB RAM
- **Storage**: 10GB available space
- **Network**: Stable internet connection for streaming
- **OS**: Linux, macOS, or Windows

### Recommended Requirements
- **CPU**: 4+ cores
- **Memory**: 8GB RAM
- **Storage**: 50GB SSD
- **Network**: 1Gbps+ bandwidth for multiple streams
- **GPU**: Hardware acceleration for transcoding (optional)

## 🏗️ Architecture Overview

```
Broadcast Control Center
├── Frontend (Next.js 15)
│   ├── Dashboard Interface
│   ├── Stream Management
│   ├── SCTE-35 Event Manager
│   ├── Real-time Monitor
│   └── Configuration Manager
├── Backend Services
│   ├── API Layer (RESTful APIs)
│   ├── WebSocket Server (Socket.IO)
│   ├── Database Layer (Prisma + SQLite)
│   └── Business Logic Services
├── External Integration
│   ├── FFmpeg (Stream Processing)
│   ├── SCTE-35 (Ad Insertion)
│   └── Streaming Protocols (HLS/RTMP/SRT)
└── Monitoring & Analytics
    ├── Real-time Metrics
    ├── Health Checks
    └── Performance Analytics
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                     # API endpoints
│   │   ├── channels/            # Channel management
│   │   ├── streams/             # Stream input/output
│   │   ├── scte35/              # SCTE-35 events
│   │   ├── monitoring/          # Metrics and monitoring
│   │   └── users/               # User management
│   ├── page.tsx                # Main dashboard
│   └── layout.tsx              # Root layout
├── components/                   # React components
│   ├── ui/                     # shadcn/ui components
│   ├── broadcast-dashboard.tsx  # Dashboard overview
│   ├── stream-management.tsx    # Stream input/output manager
│   ├── scte35-manager.tsx       # SCTE-35 event manager
│   ├── realtime-monitor.tsx     # Real-time monitoring
│   └── mpegts-configuration.tsx # MPEG-TS configuration
├── lib/                         # Core libraries
│   ├── db.ts                   # Database connection
│   ├── socket.ts               # WebSocket configuration
│   ├── utils.ts                # Utility functions
│   └── services/               # Business logic services
│       ├── streaming-service.ts  # Stream management
│       ├── scte35-service.ts     # SCTE-35 handling
│       ├── configuration-service.ts # Configuration management
│       ├── deployment-service.ts # Deployment automation
│       └── mpegts-config.ts      # MPEG-TS configuration
├── hooks/                       # Custom React hooks
└── prisma/                      # Database schema
```

## 🎯 Core Components

### Dashboard Interface
- **System Overview**: Real-time metrics for channels, viewers, system load
- **Channel Status**: Live status indicators with viewer counts and bitrates
- **Recent Events**: SCTE-35 event timeline with status tracking
- **Quick Actions**: One-click access to key functions

### Stream Management
- **Input Sources**: Manage HLS, RTMP, and SRT input streams
- **Output Destinations**: Configure HLS, DASH, and SRT output streams
- **Connection Control**: Start/stop streams with real-time status updates
- **Stream Validation**: Test connections and validate configurations

### SCTE-35 Event Management
- **Event Scheduling**: Create and manage ad insertion events
- **Timeline View**: Visual timeline for event planning
- **Event Templates**: Pre-configured event types for quick deployment
- **Real-time Execution**: Live event triggering with status tracking

### Real-time Monitoring
- **System Metrics**: CPU, memory, network, and disk I/O monitoring
- **Stream Health**: Bitrate, framerate, dropped frames, and latency tracking
- **Performance Charts**: Historical data visualization
- **Alert System**: Configurable thresholds and notifications

### Configuration Management
- **Stream Templates**: Pre-configured streaming setups
- **MPEG-TS Configuration**: Professional broadcast parameters
- **FFmpeg Integration**: Automatic command generation
- **Import/Export**: Configuration portability

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Application
NEXT_PUBLIC_APP_NAME="Broadcast Control Center"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Streaming (Optional)
FFMPEG_PATH="/usr/local/bin/ffmpeg"
DEFAULT_STREAM_QUALITY="high"

# Monitoring
METRICS_RETENTION_DAYS=30
HEALTH_CHECK_INTERVAL=30
```

### Database Setup

```bash
# Push database schema
npm run db:push

# Generate Prisma client
npm run db:generate

# (Optional) Run migrations
npm run db:migrate
```

### FFmpeg Configuration

Ensure FFmpeg is installed and accessible:

```bash
# Check FFmpeg installation
ffmpeg -version

# If not installed, install based on your OS:
# Ubuntu/Debian:
sudo apt update && sudo apt install ffmpeg

# macOS:
brew install ffmpeg

# Windows:
# Download from https://ffmpeg.org/download.html
```

## 🚀 Deployment Instructions

### Development Deployment

```bash
# Start development server
npm run dev

# Access at http://localhost:3000
```

### Production Deployment

#### Build the Application
```bash
# Build for production
npm run build

# Start production server
npm start
```

#### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY .next/standalone ./
COPY .next/static ./.next/static

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

Build and run:

```bash
# Build Docker image
docker build -t broadcast-control-center .

# Run container
docker run -p 3000:3000 broadcast-control-center
```

#### Docker Compose Deployment

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  broadcast-control-center:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./data/production.db
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - broadcast-control-center
    restart: unless-stopped
```

Deploy with:

```bash
docker-compose up -d
```

#### Cloud Deployment

##### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Configure environment variables in Vercel dashboard
```

##### AWS EC2 Deployment
```bash
# Launch EC2 instance with Ubuntu 22.04
# Install Node.js, FFmpeg, and nginx

# Clone repository
git clone https://github.com/shihan84/broadcast-control-center.git
cd broadcast-control-center

# Install dependencies and build
npm install
npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start npm --name "broadcast-control-center" -- start

# Configure nginx as reverse proxy
```

##### Google Cloud Platform Deployment
```bash
# Create Cloud Run service
gcloud run deploy broadcast-control-center \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Set environment variables
gcloud run services update broadcast-control-center \
  --set-env-vars "NODE_ENV=production,DATABASE_URL=file:./data/production.db"
```

### Environment-Specific Configuration

#### Production Environment Variables
```env
NODE_ENV=production
DATABASE_URL="file:./production.db"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
FFMPEG_PATH="/usr/bin/ffmpeg"
METRICS_RETENTION_DAYS=90
HEALTH_CHECK_INTERVAL=60
```

#### Staging Environment Variables
```env
NODE_ENV=development
DATABASE_URL="file:./staging.db"
NEXT_PUBLIC_APP_URL="https://staging.your-domain.com"
FFMPEG_PATH="/usr/local/bin/ffmpeg"
METRICS_RETENTION_DAYS=7
HEALTH_CHECK_INTERVAL=30
```

### Load Balancing and Scaling

#### Nginx Configuration
```nginx
upstream broadcast_control_center {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://broadcast_control_center;
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

#### PM2 Configuration
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'broadcast-control-center',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'file:./production.db'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### SSL/TLS Configuration

#### Let's Encrypt SSL
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Backup and Recovery

#### Database Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_FILE="production.db"

mkdir -p $BACKUP_DIR
sqlite3 $DB_FILE ".backup $BACKUP_DIR/broadcast_control_center_$DATE.db"
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
EOF

chmod +x backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

#### Configuration Backup
```bash
# Backup configurations
tar -czf configs_backup_$(date +%Y%m%d).tar.gz \
  src/lib/services/ \
  prisma/ \
  .env.local \
  ecosystem.config.js
```

### Monitoring and Logging

#### Application Monitoring
```bash
# Install monitoring tools
npm install @pm2/io

# Monitor with PM2
pm2 monit

# Check logs
pm2 logs broadcast-control-center
```

#### System Monitoring
```bash
# Install monitoring agents
# For Ubuntu/Debian:
sudo apt install htop iotop nethogs

# For CentOS/RHEL:
sudo yum install htop iotop nethogs
```

## 📖 User Manual

### Getting Started

#### 1. Initial Setup
1. **Access the Application**: Open your browser and navigate to the application URL
2. **Create User Account**: The first user will be automatically created as an administrator
3. **Configure System Settings**: Set up default stream configurations and monitoring preferences

#### 2. Dashboard Overview
The main dashboard provides:
- **System Status**: Overall system health and uptime
- **Active Channels**: Currently running broadcast channels
- **Total Viewers**: Combined viewer count across all channels
- **System Load**: Real-time CPU, memory, and network usage
- **Recent Events**: Latest SCTE-35 events and system activities

### Managing Channels

#### Creating a Channel
1. Navigate to the **Dashboard**
2. Click **"Add Channel"** or use the channel management interface
3. Fill in channel details:
   - **Channel Name**: Display name for the channel
   - **Description**: Optional description
   - **Thumbnail**: Optional channel thumbnail image
4. Click **"Create Channel"** to save

#### Channel Status Management
- **Offline**: Channel is not active
- **Starting**: Channel is initializing
- **Online**: Channel is active and streaming
- **Stopping**: Channel is shutting down
- **Error**: Channel has encountered an issue

### Stream Management

#### Adding Input Sources
1. Go to the **"Streams"** tab
2. Select **"Input Sources"**
3. Click **"Add Stream"**
4. Configure input parameters:
   - **Stream Name**: Descriptive name for the input
   - **Stream Type**: HLS, RTMP, or SRT
   - **Stream URL**: Source URL for the input stream
   - **Configuration**: Advanced settings (buffer size, latency, etc.)
5. Click **"Create Stream"** to add the input

#### Managing Input Streams
- **Connect**: Start the input stream connection
- **Disconnect**: Stop the input stream
- **Settings**: Configure advanced parameters
- **Delete**: Remove the input stream

#### Adding Output Destinations
1. Go to the **"Streams"** tab
2. Select **"Output Destinations"**
3. Click **"Add Stream"**
4. Configure output parameters:
   - **Stream Name**: Descriptive name for the output
   - **Stream Type**: HLS, DASH, or SRT
   - **Stream URL**: Destination URL for the output
   - **Configuration**: Output settings (bitrate, resolution, codec, etc.)
5. Click **"Create Stream"** to add the output

#### Managing Output Streams
- **Start**: Begin streaming to the output destination
- **Stop**: Stop streaming to the output
- **Settings**: Configure output parameters
- **Delete**: Remove the output stream

### SCTE-35 Event Management

#### Understanding SCTE-35
SCTE-35 is a standard for triggering ad insertion and program events in broadcast streams. The system supports:
- **Commercial Start/End**: Mark beginning and end of commercial breaks
- **Program Start/End**: Mark program boundaries
- **Break Start/End**: Manage scheduled breaks
- **Provider Ad Start/End**: Handle provider-specific advertisements
- **Custom Events**: Create custom event types

#### Creating SCTE-35 Events
1. Navigate to the **"SCTE-35"** tab
2. Click **"Create Event"**
3. Configure event parameters:
   - **Event ID**: Unique identifier for the event
   - **Event Type**: Select from predefined event types
   - **Channel**: Select the target channel
   - **Start Time**: Schedule the event time
   - **Duration**: Event duration in seconds (if applicable)
   - **Description**: Optional event description
4. Click **"Create Event"** to schedule

#### Managing Events
- **Execute**: Trigger the event immediately
- **Cancel**: Cancel a scheduled event
- **Edit**: Modify event parameters
- **Timeline View**: Visual representation of scheduled events

#### Event Templates
The system includes pre-configured templates:
- **Standard Commercial Break**: 2-minute commercial insertion
- **Program End**: Marks the end of a program
- **Provider Ad**: 60-second provider advertisement
- **Scheduled Break**: 3-minute programming break

### Real-time Monitoring

#### System Monitoring
The monitoring dashboard provides:
- **CPU Usage**: Real-time processor utilization
- **Memory Usage**: Current memory consumption
- **Network I/O**: Network throughput and latency
- **Disk Usage**: Storage utilization and I/O operations

#### Stream Monitoring
For each active stream, monitor:
- **Bitrate**: Current streaming bitrate
- **Framerate**: Video frame rate
- **Resolution**: Video resolution
- **Dropped Frames**: Number of dropped frames
- **Latency**: Stream delay
- **Viewers**: Current viewer count

#### Health Checks
The system performs automatic health checks:
- **Stream Connectivity**: Verify input/output connections
- **Performance Metrics**: Monitor for performance degradation
- **Error Detection**: Identify and alert on errors
- **Resource Usage**: Track system resource utilization

#### Alerts and Notifications
Configure alerts for:
- **High CPU Usage**: Alert when CPU exceeds threshold
- **Memory Pressure**: Warn about high memory usage
- **Stream Errors**: Notify of stream failures
- **Network Issues**: Alert on network problems
- **SCTE-35 Failures**: Notify of event execution issues

### Configuration Management

#### Stream Configuration Templates
The system includes several pre-configured templates:

**Basic HLS Streaming**
- Input: HLS source
- Output: HLS output
- Bitrate: 8 Mbps
- Resolution: 1920x1080
- SCTE-35: Enabled with passthrough

**RTMP to SRT Gateway**
- Input: RTMP source
- Output: SRT destination
- Bitrate: 6 Mbps
- Resolution: 1280x720
- Latency: Optimized for low delay

**Multi-Bitrate HLS**
- Input: HLS source
- Output: Multiple HLS bitrates
- Resolutions: 1080p, 720p, 480p
- Adaptive streaming enabled

#### Creating Custom Configurations
1. Go to the **Configuration** section
2. Select **"Create Configuration"**
3. Choose a base template or start from scratch
4. Configure parameters:
   - **Input Settings**: Source type, URL, buffer settings
   - **Output Settings**: Destination, bitrate, resolution, codec
   - **Transcoding**: Enable/disable transcoding options
   - **SCTE-35**: Configure ad insertion settings
   - **Monitoring**: Set up metrics and alerts
5. Save and apply the configuration

#### FFmpeg Command Generation
The system automatically generates FFmpeg commands based on configurations:
- **Input Parameters**: Source URL and format options
- **Transcoding Options**: Codec, bitrate, resolution settings
- **MPEG-TS Options**: Professional broadcast parameters
- **Output Options**: Destination format and URL
- **SCTE-35 Integration**: Ad insertion signaling

#### Import/Export Configurations
- **Export**: Save configurations as JSON files
- **Import**: Load configurations from files
- **Template Sharing**: Share configurations between environments

### Deployment Automation

#### One-Click Deployment
The deployment automation system provides:
- **Configuration Validation**: Verify settings before deployment
- **Step-by-Step Execution**: Guided deployment process
- **Rollback on Failure**: Automatic recovery if deployment fails
- **Health Verification**: Post-deployment health checks

#### Deployment Templates
- **Quick Deploy**: Basic deployment with minimal configuration
- **Production Deploy**: Full deployment with all safety checks
- **Testing Deploy**: Deployment for testing environments

#### Managing Deployments
1. **Create Deployment**: Choose configuration and deployment template
2. **Configure Options**: Set deployment parameters and options
3. **Execute Deployment**: Start the automated deployment process
4. **Monitor Progress**: Track deployment status and step completion
5. **Handle Failures**: Review logs and perform rollback if needed

### MPEG-TS Configuration

#### Understanding MPEG-TS
MPEG Transport Stream (MPEG-TS) is a standard format for transmission and storage of audio, video, and data. The system provides comprehensive MPEG-TS configuration with 25+ professional parameters.

#### MPEG-TS Parameters
The system supports all major MPEG-TS parameters:
- **mpegts_flags**: Transport stream flags (pat_pmt_at_frames, etc.)
- **mpegts_service_id**: Service identifier for the stream
- **mpegts_pid_video**: Packet ID for video stream
- **mpegts_pid_audio**: Packet ID for audio stream
- **mpegts_pid_scte35**: Packet ID for SCTE-35 data
- **mpegts_pcr_period**: PCR (Program Clock Reference) period
- **mpegts_pat_period**: PAT (Program Association Table) period
- **mpegts_pmt_period**: PMT (Program Map Table) period

#### Professional Presets
The system includes industry-standard presets:

**Standard Broadcast**
- Basic MPEG-TS configuration
- Standard PID assignments
- SCTE-35 support enabled
- Compatible with most broadcast systems

**High Availability**
- Redundant configuration
- Error resilience features
- Backup PIDs and services
- Enhanced error handling

**Cable Headend**
- Cable operator optimized
- Standard cable PIDs
- QAM modulation ready
- Multiple program support

**IPTV**
- IP delivery optimized
- Aligned timestamps
- Low latency configuration
- UDP/RTP compatible

#### Creating MPEG-TS Configurations
1. Navigate to **Configuration** → **MPEG-TS**
2. **Select Preset**: Choose from professional presets
3. **Configure Parameters**: Adjust settings as needed
4. **Generate Command**: Create FFmpeg command automatically
5. **Test Configuration**: Validate settings before deployment

#### FFmpeg Command Generation
The system generates complete FFmpeg commands:
```bash
ffmpeg -i input.mp4 \
  -mpegts_flags pat_pmt_at_frames \
  -mpegts_service_id 1 \
  -mpegts_pid_video 0x100 \
  -mpegts_pid_audio 0x101 \
  -mpegts_pid_scte35 0x1FFF \
  -f mpegts output.ts
```

### Troubleshooting

#### Common Issues

**Stream Connection Problems**
- Verify stream URLs are correct and accessible
- Check network connectivity to source/destination
- Ensure proper port forwarding and firewall settings
- Validate stream format compatibility

**SCTE-35 Event Failures**
- Check event scheduling and timing
- Verify channel is online and streaming
- Ensure SCTE-35 passthrough is enabled
- Review event command syntax

**Performance Issues**
- Monitor system resource usage
- Check network bandwidth and latency
- Verify FFmpeg performance and settings
- Review transcoding configuration

**Database Issues**
- Ensure database file permissions are correct
- Check disk space availability
- Verify database connection settings
- Review database logs for errors

#### Debug Mode
Enable debug logging for troubleshooting:

```bash
# Enable debug logging
DEBUG=broadcast-control-center:* npm run dev

# Check application logs
pm2 logs broadcast-control-center

# Monitor system resources
htop
iotop
nethogs
```

#### Support and Resources
- **Documentation**: Complete user manual and API documentation
- **Community**: GitHub issues and discussions
- **Logs**: Application and system logs for debugging
- **Monitoring**: Built-in monitoring and alerting system

## 🤝 Contributing

We welcome contributions to the Broadcast Control Center project! Please see our contributing guidelines for more information.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use ESLint configuration
- Write clear, documented code
- Include unit tests for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the excellent framework
- **Prisma Team**: For the modern ORM
- **shadcn/ui**: For the beautiful UI components
- **Socket.IO**: For real-time communication
- **FFmpeg**: For powerful media processing

---

For more information, support, or to report issues, please visit our [GitHub repository](https://github.com/shihan84/broadcast-control-center).