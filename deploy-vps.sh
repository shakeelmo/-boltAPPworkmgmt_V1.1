#!/bin/bash

# Complete VPS Deployment Script for BoltAPP Workflow Management
# Run this script on your VPS server

echo "🚀 Starting complete VPS deployment for BoltAPP..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
print_status "Installing Git..."
sudo apt install git -y

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install nginx -y

# Verify installations
print_status "Verifying installations..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Git version: $(git --version)"
echo "PM2 version: $(pm2 --version)"

# Navigate to web directory
print_status "Setting up application directory..."
cd /var/www

# Remove existing directory if it exists
if [ -d "-boltAPPworkmgmt_V1.1" ]; then
    print_warning "Removing existing application directory..."
    sudo rm -rf "-boltAPPworkmgmt_V1.1"
fi

# Clone your repository
print_status "Cloning repository from GitHub..."
git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git
cd "-boltAPPworkmgmt_V1.1"

# Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R $USER:$USER /var/www/-boltAPPworkmgmt_V1.1

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install

# Install backend dependencies
print_status "Installing backend dependencies..."
cd server && npm install && cd ..

# Create ecosystem.config.js for PM2
print_status "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'smartuniit-backend',
      script: './server/index.js',
      cwd: '/var/www/-boltAPPworkmgmt_V1.1',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
EOF

# Initialize database
print_status "Initializing database..."
cd server
node scripts/initDb.js
cd ..

# Build frontend
print_status "Building frontend application..."
npm run build

# Create Nginx configuration
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/work.smartuniit.com > /dev/null <<EOF
server {
    listen 80;
    server_name work.smartuniit.com;

    # Frontend
    location / {
        root /var/www/-boltAPPworkmgmt_V1.1/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/work.smartuniit.com /etc/nginx/sites-enabled/

# Remove default Nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
print_status "Restarting Nginx..."
sudo systemctl restart nginx

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Start application with PM2
print_status "Starting application with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Install Certbot for SSL
print_status "Installing Certbot for SSL..."
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
print_status "Obtaining SSL certificate..."
sudo certbot --nginx -d work.smartuniit.com --non-interactive --agree-tos --email shakeelvcd@gmail.com

# Final status check
print_status "Performing final status checks..."
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l
echo ""
echo "🔒 SSL Certificate Status:"
sudo certbot certificates

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo ""
echo "🌐 Your application is now available at:"
echo "   HTTPS: https://work.smartuniit.com"
echo "   HTTP:  http://work.smartuniit.com"
echo ""
echo "📝 Default login credentials:"
echo "   Email: admin@smartuniit.com"
echo "   Password: admin123"
echo ""
echo "📊 Useful commands:"
echo "   Check PM2 status: pm2 status"
echo "   View logs: pm2 logs"
echo "   Restart app: pm2 restart all"
echo "   Update app: cd /var/www/-boltAPPworkmgmt_V1.1 && ./deploy.sh"
echo "" 