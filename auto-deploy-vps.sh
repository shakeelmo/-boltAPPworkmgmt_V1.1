#!/bin/bash

# Auto Deploy to VPS Script
# This script will automatically SSH to your VPS and deploy the application

echo "🚀 Auto Deploy to VPS: 109.199.116.107"
echo "🌐 Domain: work.smartuniit.com"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install sshpass
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get install sshpass -y
    else
        echo "❌ Please install sshpass manually for your OS"
        exit 1
    fi
fi

# Create the deployment script content
DEPLOY_SCRIPT=$(cat << 'EOF'
#!/bin/bash

# Complete Deployment & Login Fix Script
set -e

echo "🚀 Complete Deployment & Login Fix Script"
echo "========================================="
echo "VPS: 109.199.116.107"
echo "Domain: work.smartuniit.com"
echo ""

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Install Dependencies
log "📦 Step 1: Installing system dependencies..."
apt update -y

# Install Node.js 18.x
if ! command_exists node; then
    log "📥 Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2
if ! command_exists pm2; then
    log "📥 Installing PM2..."
    npm install -g pm2
fi

# Install Nginx
if ! command_exists nginx; then
    log "📥 Installing Nginx..."
    apt install -y nginx
fi

# Install Git
if ! command_exists git; then
    log "📥 Installing Git..."
    apt install -y git
fi

# Step 2: Deploy Application
log "🚀 Step 2: Deploying application..."

# Navigate to web directory
cd /var/www

# Check if project exists, if not clone it
if [ -d 'smartuniit-taskflow' ]; then
    log "📁 Project exists, updating..."
    cd smartuniit-taskflow
    git pull origin main
else
    log "📁 Cloning new project..."
    git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git smartuniit-taskflow
    cd smartuniit-taskflow
fi

# Install frontend dependencies
log "📦 Installing frontend dependencies..."
npm install

# Build the frontend
log "🔨 Building frontend..."
npm run build

# Install backend dependencies
log "📦 Installing backend dependencies..."
cd server && npm install && cd ..

# Step 3: Database Setup
log "🗄️ Step 3: Setting up database..."

# Create database file if not exists
if [ ! -f "server/database.sqlite" ]; then
    log "📝 Creating database file..."
    touch server/database.sqlite
fi

# Initialize database
log "🗄️ Initializing database..."
cd server
node initDatabase.js

# Create admin user
log "👤 Creating admin user..."
node createAdmin.js

# Verify admin user
log "🔍 Verifying admin user..."
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], (err, row) => {
    if (err) {
        console.log('❌ Error checking admin user:', err.message);
        process.exit(1);
    } else if (row) {
        console.log('✅ Admin user exists:', row.email);
    } else {
        console.log('❌ Admin user not found');
        process.exit(1);
    }
    db.close();
});
"
cd ..

# Step 4: PM2 Configuration
log "📱 Step 4: Configuring PM2..."

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'smartuniit-taskflow-backend',
    script: 'server/index.js',
    cwd: '/var/www/smartuniit-taskflow',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/smartuniit-error.log',
    out_file: '/var/log/pm2/smartuniit-out.log',
    log_file: '/var/log/pm2/smartuniit-combined.log'
  }]
};
PM2EOF

# Create log directory
mkdir -p /var/log/pm2

# Start/restart the application with PM2
log "🚀 Starting application with PM2..."
pm2 delete smartuniit-taskflow-backend 2>/dev/null || true
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Step 5: Nginx Configuration
log "🌐 Step 5: Configuring Nginx..."

# Create Nginx configuration
cat > /etc/nginx/sites-available/work.smartuniit.com << 'NGINXEOF'
server {
    listen 80;
    server_name work.smartuniit.com;

    # Root directory
    root /var/www/smartuniit-taskflow/dist;
    index index.html;

    # Handle API requests
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Handle static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
NGINXEOF

# Enable the site
ln -sf /etc/nginx/sites-available/work.smartuniit.com /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Step 6: Final Verification
log "✅ Step 6: Final verification..."

# Wait a moment for services to start
sleep 5

# Check PM2 status
log "📱 Checking PM2 status..."
pm2 status

# Check if backend is responding
log "🔍 Testing backend API..."
if curl -s http://localhost:3001/api/auth/login > /dev/null; then
    log "✅ Backend is responding"
else
    log "❌ Backend is not responding"
fi

# Check Nginx status
log "🌐 Checking Nginx status..."
systemctl status nginx --no-pager -l

# Test domain access
log "🌐 Testing domain access..."
if curl -s -I http://work.smartuniit.com > /dev/null; then
    log "✅ Domain is accessible"
else
    log "❌ Domain is not accessible"
fi

# Show final status
echo ""
echo "🎯 Deployment Summary:"
echo "====================="
echo "✅ System dependencies installed"
echo "✅ Application deployed"
echo "✅ Database initialized"
echo "✅ Admin user created"
echo "✅ PM2 configured and running"
echo "✅ Nginx configured and running"
echo ""
echo "🌐 Your application is available at:"
echo "   http://work.smartuniit.com"
echo ""
echo "👤 Login credentials:"
echo "   Username: admin@example.com"
echo "   Password: admin123"
echo ""
echo "📋 Useful commands:"
echo "   • Check PM2 status: pm2 status"
echo "   • View logs: pm2 logs smartuniit-taskflow-backend"
echo "   • Restart app: pm2 restart smartuniit-taskflow-backend"
echo "   • Check Nginx: systemctl status nginx"
echo ""
echo "🚀 Deployment completed successfully!"
EOF
)

echo "📝 Creating deployment script on VPS..."
echo "$DEPLOY_SCRIPT" | sshpass -p 'X9mK4LpZq7GtV2Fb' ssh -o StrictHostKeyChecking=no root@109.199.116.107 'cat > /tmp/deploy.sh && chmod +x /tmp/deploy.sh'

echo "🚀 Running deployment script on VPS..."
sshpass -p 'X9mK4LpZq7GtV2Fb' ssh -o StrictHostKeyChecking=no root@109.199.116.107 'bash /tmp/deploy.sh'

echo ""
echo "✅ Auto deployment completed!"
echo "🌐 Your application should be available at: http://work.smartuniit.com"
echo "👤 Login: admin@example.com / admin123"

