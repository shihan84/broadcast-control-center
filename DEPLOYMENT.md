# 🚀 Deployment Guide

This guide provides comprehensive instructions for deploying the Broadcast Control Center in various environments, from development to production.

## 📋 Deployment Options

### 🖥️ Development Deployment

#### Local Development
```bash
# Clone the repository
git clone https://github.com/shihan84/broadcast-control-center.git
cd broadcast-control-center

# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:generate

# Start development server
npm run dev
```

**Access**: http://localhost:3000

#### Development with Docker
```bash
# Build development image
docker build -f Dockerfile.dev -t broadcast-control-center:dev .

# Run development container
docker run -p 3000:3000 -v $(pwd):/app broadcast-control-center:dev
```

### 🏗️ Production Deployment

#### Standalone Node.js Deployment

##### Prerequisites
- Node.js 18+
- FFmpeg
- SQLite (or other supported database)

##### Installation Steps

1. **Prepare the Server**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2 for process management
npm install -g pm2
```

2. **Deploy the Application**
```bash
# Clone the repository
git clone https://github.com/shihan84/broadcast-control-center.git
cd broadcast-control-center

# Install dependencies
npm install

# Build the application
npm run build

# Set up environment variables
cp .env.example .env
# Edit .env with production values

# Set up database
npm run db:push
npm run db:generate

# Start the application with PM2
pm2 start npm --name "broadcast-control-center" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

3. **Configure Reverse Proxy (Nginx)**
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
        proxy_set_header X-Forwarded-For $proxy_add;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

##### SSL Configuration (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Docker Deployment

##### Dockerfile
```dockerfile
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache \
    ffmpeg \
    dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY .next/standalone ./
COPY .next/static ./.next/static

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

##### docker-compose.yml
```yaml
version: '3.8'

services:
  broadcast-control-center:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/production.db
      - NEXT_PUBLIC_APP_URL=https://your-domain.com
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Redis for caching (if needed)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

##### Deployment Commands
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d --force-recreate
```

### ☁️ Cloud Deployment

#### Vercel Deployment

##### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

##### Deployment Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy to Vercel**
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard:
# - DATABASE_URL
# - NEXT_PUBLIC_APP_URL
# - FFMPEG_PATH
```

3. **vercel.json Configuration**
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXT_PUBLIC_APP_URL": "@next_public_app_url"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database_url"
    }
  }
}
```

#### AWS EC2 Deployment

##### Prerequisites
- AWS account
- EC2 instance (Ubuntu 22.04 recommended)
- Domain name (optional)

##### Deployment Steps

1. **Launch EC2 Instance**
```bash
# Create security group with ports:
# - 22 (SSH)
# - 80 (HTTP)
# - 443 (HTTPS)
# - 3000 (Application)

# Launch instance with:
# - Instance type: t3.medium or larger
# - Storage: 50GB SSD
# - Security group: Custom with above ports
```

2. **Server Setup**
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nodejs npm ffmpeg nginx

# Install PM2
npm install -g pm2

# Clone repository
git clone https://github.com/shihan84/broadcast-control-center.git
cd broadcast-control-center

# Install application dependencies
npm install

# Build application
npm run build

# Set up environment
sudo nano .env
# Add production environment variables

# Set up database
npm run db:push
npm run db:generate

# Start application
pm2 start npm --name "broadcast-control-center" -- start

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

3. **Configure Nginx**
```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/broadcast-control-center
```

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
        proxy_set_header X-Forwarded-For $proxy_add;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/broadcast-control-center /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

4. **Set up SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Google Cloud Platform (GCP) Deployment

##### Prerequisites
- GCP account
- Google Cloud SDK installed

##### Deployment Steps

1. **Create GCP Project**
```bash
# Set project
gcloud config set project your-project-id

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

2. **Create Compute Engine Instance**
```bash
# Create instance template
gcloud compute instances create broadcast-control-center \
    --machine-type=e2-medium \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=50GB \
    --tags=http-server,https-server \
    --metadata=startup-script='#! /bin/bash
        # Install dependencies
        apt update && apt install -y nodejs npm ffmpeg nginx
        npm install -g pm2
        
        # Clone and deploy application
        git clone https://github.com/shihan84/broadcast-control-center.git
        cd broadcast-control-center
        npm install
        npm run build
        
        # Set up environment
        echo "NODE_ENV=production" > .env
        echo "DATABASE_URL=file:/app/data/production.db" >> .env
        echo "NEXT_PUBLIC_APP_URL=https://your-domain.com" >> .env
        
        # Set up database
        npm run db:push
        npm run db:generate
        
        # Start application
        pm2 start npm --name "broadcast-control-center" -- start
        pm2 startup
        pm2 save
        
        # Configure and start nginx
        # ... (nginx configuration similar to AWS section)
    '
```

3. **Configure Firewall Rules**
```bash
# Create firewall rules
gcloud compute firewall-rules create allow-http \
    --allow=tcp:80 \
    --target-tags=http-server

gcloud compute firewall-rules create allow-https \
    --allow=tcp:443 \
    --target-tags=https-server

gcloud compute firewall-rules create allow-app \
    --allow=tcp:3000 \
    --target-tags=http-server
```

#### Azure Deployment

##### Prerequisites
- Azure account
- Azure CLI installed

##### Deployment Steps

1. **Create Resource Group**
```bash
az group create --name broadcast-control-center-rg --location eastus
```

2. **Create Virtual Machine**
```bash
# Create VM
az vm create \
    --resource-group broadcast-control-center-rg \
    --name broadcast-control-center-vm \
    --image Ubuntu2204 \
    --size Standard_B2s \
    --admin-username azureuser \
    --generate-ssh-keys

# Open ports
az vm open-port \
    --resource-group broadcast-control-center-rg \
    --name broadcast-control-center-vm \
    --port 80

az vm open-port \
    --resource-group broadcast-control-center-rg \
    --name broadcast-control-center-vm \
    --port 443

az vm open-port \
    --resource-group broadcast-control-center-rg \
    --name broadcast-control-center-vm \
    --port 3000
```

3. **Deploy Application**
```bash
# Get VM public IP
VM_IP=$(az vm show --resource-group broadcast-control-center-rg --name broadcast-control-center-vm --show-details --query publicIps --output tsv)

# Connect to VM
ssh azureuser@$VM_IP

# Deploy application (same as AWS deployment steps)
```

## 🔧 Configuration Management

### Environment Variables

#### Development (.env.local)
```env
# Database
DATABASE_URL="file:./dev.db"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="Broadcast Control Center"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Streaming
FFMPEG_PATH="/usr/local/bin/ffmpeg"
DEFAULT_STREAM_QUALITY="high"

# Monitoring
METRICS_RETENTION_DAYS=7
HEALTH_CHECK_INTERVAL=30

# Debug
DEBUG="prisma:query,broadcast:*"
```

#### Production (.env.production)
```env
# Database
DATABASE_URL="file:/app/data/production.db"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_NAME="Broadcast Control Center"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Streaming
FFMPEG_PATH="/usr/bin/ffmpeg"
DEFAULT_STREAM_QUALITY="high"

# Monitoring
METRICS_RETENTION_DAYS=90
HEALTH_CHECK_INTERVAL=60

# Security
SECRET_KEY="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"

# Performance
MAX_CONCURRENT_STREAMS=10
STREAM_TIMEOUT=300000
```

### Database Configuration

#### SQLite (Default)
```bash
# Database location
DATABASE_URL="file:./data/broadcast.db"

# For better performance with SQLite
# Add journal mode and synchronous settings
DATABASE_URL="file:./data/broadcast.db?connection_limit=10&socket_timeout=20"
```

#### PostgreSQL (Production Recommended)
```bash
# Install PostgreSQL driver
npm install pg

# Update DATABASE_URL
DATABASE_URL="postgresql://username:password@localhost:5432/broadcast_db"

# Update Prisma schema
# generator client {
#   provider = "prisma-client-js"
# }
# 
# datasource db {
#   provider = "postgresql"
#   url      = env("DATABASE_URL")
# }
```

#### MySQL
```bash
# Install MySQL driver
npm install mysql2

# Update DATABASE_URL
DATABASE_URL="mysql://username:password@localhost:3306/broadcast_db"
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint
```bash
# Health check
curl http://localhost:3000/api/health

# Detailed health check
curl http://localhost:3000/api/health?detailed=true
```

#### Metrics Collection
```bash
# System metrics
curl http://localhost:3000/api/monitoring?metricType=CPU_USAGE

# Stream metrics
curl http://localhost:3000/api/monitoring?channelId=channel-id&metricType=BITRATE
```

### Log Management

#### Application Logs
```bash
# View application logs
pm2 logs broadcast-control-center

# View logs in real-time
pm2 logs broadcast-control-center --lines 100

# Log rotation
pm2 install pm2-logrotate
```

#### System Logs
```bash
# System logs (Ubuntu/Debian)
journalctl -u nginx -f

# Application logs
tail -f /var/log/broadcast-control-center/app.log

# Error logs
tail -f /var/log/broadcast-control-center/error.log
```

#### Structured Logging
```javascript
// Configure Winston logger (example)
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'broadcast-control-center' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Performance Monitoring

#### PM2 Monitoring
```bash
# Monitor application
pm2 monit

# Check memory usage
pm2 info broadcast-control-center

# Restart on memory leak
pm2 restart broadcast-control-center --update-env
```

#### System Monitoring
```bash
# CPU and memory usage
htop

# Disk usage
df -h

# Network connections
netstat -tuln

# Process monitoring
ps aux | grep node
```

## 🔒 Security Configuration

### Application Security

#### Environment Variables Security
```bash
# Set proper file permissions
chmod 600 .env*

# Use secrets management service
# For production, consider using:
# - AWS Secrets Manager
# - Azure Key Vault
# - Google Secret Manager
# - HashiCorp Vault
```

#### API Security
```javascript
// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Database Security
```sql
-- Database user permissions
CREATE USER broadcast_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE broadcast_db TO broadcast_user;
GRANT USAGE ON SCHEMA public TO broadcast_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO broadcast_user;
```

### Network Security

#### Firewall Configuration
```bash
# Ubuntu UFW
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp

# iptables rules
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

#### SSL/TLS Configuration
```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## 🔄 Backup and Recovery

### Database Backup

#### SQLite Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_FILE="/app/data/production.db"

mkdir -p $BACKUP_DIR

# Create backup
sqlite3 $DB_FILE ".backup $BACKUP_DIR/broadcast_$DATE.db"

# Compress backup
gzip $BACKUP_DIR/broadcast_$DATE.db

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db.gz" -mtime +7 -delete

echo "Backup completed: broadcast_$DATE.db.gz"
```

#### Automated Backup (Cron)
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh

# List crontab jobs
crontab -l
```

### Application Backup

#### Configuration Backup
```bash
# Backup configuration files
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
    .env* \
    prisma/ \
    nginx/sites-available/ \
    systemd/system/
```

#### Full System Backup
```bash
# Complete system backup
rsync -avz --exclude=node_modules --exclude=.next \
    /path/to/broadcast-control-center/ \
    /backup/location/
```

### Recovery Procedures

#### Database Recovery
```bash
# Stop application
pm2 stop broadcast-control-center

# Restore database
sqlite3 /app/data/production.db ".restore /backups/broadcast_20240101_020000.db"

# Start application
pm2 start broadcast-control-center
```

#### Application Recovery
```bash
# Restore from backup
tar -xzf backup_20240101.tar.gz -C /

# Reinstall dependencies
npm install

# Rebuild application
npm run build

# Restart services
pm2 restart broadcast-control-center
```

## 🚀 Scaling and Performance

### Horizontal Scaling

#### Load Balancer Configuration
```nginx
upstream broadcast_backend {
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://broadcast_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Multi-Instance Deployment
```bash
# Start multiple instances
pm2 start npm --name "broadcast-control-center-1" -- start
pm2 start npm --name "broadcast-control-center-2" -- start
pm2 start npm --name "broadcast-control-center-3" -- start

# Create cluster mode
pm2 start npm --name "broadcast-control-center" --start -i 4
```

### Vertical Scaling

#### Resource Allocation
```bash
# Increase memory allocation
export NODE_OPTIONS="--max-old-space-size=4096"

# Optimize garbage collection
export NODE_OPTIONS="--max-old-space-size=4096 --optimize-for-size --max-semi-space-size=256"
```

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_stream_inputs_channel_id ON stream_inputs(channel_id);
CREATE INDEX idx_stream_outputs_channel_id ON stream_outputs(channel_id);
CREATE INDEX idx_scte35_events_channel_id ON scte35_events(channel_id);
CREATE INDEX idx_monitoring_channel_id ON monitoring_data(channel_id);
CREATE INDEX idx_monitoring_timestamp ON monitoring_data(timestamp);
```

### Caching Strategy

#### Redis Integration
```javascript
// Redis configuration for caching
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Cache middleware
const cache = async (req, res, next) => {
  const key = req.originalUrl;
  
  try {
    const cachedData = await client.get(key);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    next();
  } catch (error) {
    next();
  }
};
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use PM2 to stop
pm2 stop broadcast-control-center
```

#### Database Connection Issues
```bash
# Check database file permissions
ls -la /app/data/

# Check database integrity
sqlite3 /app/data/production.db "PRAGMA integrity_check;"

# Repair database if needed
sqlite3 /app/data/production.db ".recover"
```

#### FFmpeg Not Found
```bash
# Check FFmpeg installation
which ffmpeg
ffmpeg -version

# Install FFmpeg if missing
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Add to PATH in .env
FFMPEG_PATH="/usr/local/bin/ffmpeg"
```

#### Memory Issues
```bash
# Check memory usage
free -h
pm2 info broadcast-control-center

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Restart with new memory limit
pm2 restart broadcast-control-center --update-env
```

### Performance Issues

#### High CPU Usage
```bash
# Check CPU usage
top -p $(pgrep -f "node.*server")

# Identify CPU-intensive processes
ps aux --sort=-%cpu | head -20

# Optimize application code
# - Reduce unnecessary computations
# - Implement caching
# - Optimize database queries
```

#### High Memory Usage
```bash
# Check memory leaks
node --inspect your-app.js

# Monitor memory usage
pm2 monit

# Restart application periodically
pm2 restart broadcast-control-center --cron-restart="0 4 * * *"
```

#### Network Issues
```bash
# Check network connections
netstat -tuln | grep :3000

# Test connectivity
curl -I http://localhost:3000

# Check firewall rules
sudo ufw status
```

### Log Analysis

#### Error Patterns
```bash
# Search for errors in logs
grep -i error /var/log/broadcast-control-center/app.log

# Find specific error patterns
grep -i "connection refused" /var/log/broadcast-control-center/app.log

# Analyze error frequency
grep -c "ERROR" /var/log/broadcast-control-center/app.log
```

#### Performance Analysis
```bash
# Analyze response times
grep "response time" /var/log/broadcast-control-center/access.log | awk '{print $NF}' | sort -n

# Find slow queries
grep "slow query" /var/log/broadcast-control-center/database.log
```

## 📞 Support

### Getting Help

#### Documentation
- **README.md**: Main project documentation
- **USER_MANUAL.md**: Comprehensive user guide
- **API Documentation**: Available at `/api/docs` (when enabled)

#### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Join community discussions
- **Stack Overflow**: Use tag `broadcast-control-center`

#### Professional Support
- **Email Support**: support@broadcast-control-center.com
- **Enterprise Support**: Available for commercial deployments
- **Consulting Services**: Custom development and integration

### Contact Information

- **GitHub**: https://github.com/shihan84/broadcast-control-center
- **Issues**: https://github.com/shihan84/broadcast-control-center/issues
- **Discussions**: https://github.com/shihan84/broadcast-control-center/discussions

---

This deployment guide provides comprehensive instructions for deploying the Broadcast Control Center in various environments. For additional assistance, please refer to the project documentation or contact the support team.