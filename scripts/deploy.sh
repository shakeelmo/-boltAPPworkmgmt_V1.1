#!/bin/bash

echo "🚀 Deploying SmartUniit Work Management Platform to VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt install nginx -y
fi

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /var/www/smartuniit
sudo chown $USER:$USER /var/www/smartuniit

# Copy application files
echo "📋 Copying application files..."
cp -r * /var/www/smartuniit/
cd /var/www/smartuniit

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install && cd ..

# Initialize database
echo "🗄️ Initializing database..."
npm run db:init

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
# API Configuration
VITE_API_URL=http://localhost:3001/api

# JWT Secret (change this in production!)
JWT_SECRET=your-secret-key-change-in-production

# Database
DB_PATH=./data/workflow.db

# Server
PORT=3001
NODE_ENV=production
EOF

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'smartuniit-backend',
      cwd: '/var/www/smartuniit/server',
      script: 'index.js',
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

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/smartuniit << EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend
    location / {
        root /var/www/smartuniit/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
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

# Enable site
sudo ln -sf /etc/nginx/sites-available/smartuniit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt (optional)
echo "🔒 Setting up SSL certificate..."
if command -v certbot &> /dev/null; then
    sudo certbot --nginx -d your-domain.com  # Replace with your domain
else
    echo "Certbot not found. Install with: sudo apt install certbot python3-certbot-nginx"
fi

echo "✅ Deployment complete!"
echo ""
echo "Application is now running at:"
echo "- Frontend: http://your-domain.com"
echo "- Backend API: http://localhost:3001"
echo ""
echo "Default admin credentials:"
echo "Email: admin@smartuniit.com"
echo "Password: admin123"
echo ""
echo "PM2 commands:"
echo "- View logs: pm2 logs"
echo "- Restart app: pm2 restart smartuniit-backend"
echo "- Stop app: pm2 stop smartuniit-backend"
echo ""
echo "Remember to:"
echo "1. Replace 'your-domain.com' with your actual domain"
echo "2. Change the JWT_SECRET in .env file"
echo "3. Configure firewall rules"
echo "4. Set up regular database backups" 