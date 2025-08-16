#!/bin/bash

# Complete VPS Deployment Script for Smart Universe Task Flow
# VPS: 109.199.116.107
# Domain: work.smartuniit.com
# Username: root
# Password: X9mK4LpZq7GtV2Fb

echo "🚀 Starting Complete Deployment to VPS: 109.199.116.107"
echo "🌐 Domain: work.smartuniit.com"
echo "📦 Deploying: Professional Table Layout with Enhanced Features"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing system dependencies..."
    
    # Update system
    apt update -y
    
    # Install Node.js 18.x if not exists
    if ! command_exists node; then
        echo "📥 Installing Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install PM2 if not exists
    if ! command_exists pm2; then
        echo "📥 Installing PM2..."
        npm install -g pm2
    fi
    
    # Install Nginx if not exists
    if ! command_exists nginx; then
        echo "📥 Installing Nginx..."
        apt install -y nginx
    fi
    
    # Install Git if not exists
    if ! command_exists git; then
        echo "📥 Installing Git..."
        apt install -y git
    fi
}

# Function to deploy application
deploy_application() {
    echo "🚀 Deploying application..."
    
    # Navigate to web directory
    cd /var/www
    
    # Check if project exists, if not clone it
    if [ -d 'smartuniit-taskflow' ]; then
        echo "📁 Project exists, updating..."
        cd smartuniit-taskflow
        git pull origin main
    else
        echo "📁 Cloning new project..."
        git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git smartuniit-taskflow
        cd smartuniit-taskflow
    fi
    
    # Install frontend dependencies
    echo "📦 Installing frontend dependencies..."
    npm install
    
    # Build the frontend
    echo "🔨 Building frontend..."
    npm run build
    
    # Install backend dependencies
    echo "📦 Installing backend dependencies..."
    cd server && npm install && cd ..
    
    # Create PM2 ecosystem file if not exists
    if [ ! -f "ecosystem.config.js" ]; then
        echo "📝 Creating PM2 ecosystem file..."
        cat > ecosystem.config.js << 'EOF'
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
    }
  }]
};
EOF
    fi
    
    # Start/restart the application with PM2
    echo "🚀 Starting application with PM2..."
    pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    echo "✅ Application deployed successfully!"
}

# Function to configure Nginx
configure_nginx() {
    echo "🌐 Configuring Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/work.smartuniit.com << 'EOF'
server {
    listen 80;
    server_name work.smartuniit.com;

    # Redirect HTTP to HTTPS (when SSL is ready)
    # return 301 https://$server_name$request_uri;
    
    # For now, serve HTTP directly
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
EOF

    # Enable the site
    ln -sf /etc/nginx/sites-available/work.smartuniit.com /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    echo "✅ Nginx configured successfully!"
}

# Function to show status
show_status() {
    echo ""
    echo "🎯 Deployment Status:"
    echo "====================="
    
    # Check PM2 status
    echo "📱 PM2 Status:"
    pm2 status
    
    # Check Nginx status
    echo ""
    echo "🌐 Nginx Status:"
    systemctl status nginx --no-pager -l
    
    # Check application files
    echo ""
    echo "📁 Application Files:"
    ls -la /var/www/smartuniit-taskflow/
    
    # Show final URLs
    echo ""
    echo "✅ Deployment completed!"
    echo "🌐 Your app is available at: http://work.smartuniit.com"
    echo "📋 Check PM2 status with: pm2 status"
    echo "📋 Check Nginx status with: systemctl status nginx"
}

# Main deployment process
main() {
    echo "🚀 Starting complete deployment process..."
    
    # Install dependencies
    install_dependencies
    
    # Deploy application
    deploy_application
    
    # Configure Nginx
    configure_nginx
    
    # Show status
    show_status
}

# Run main function
main

