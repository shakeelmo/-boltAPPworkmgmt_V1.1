#!/bin/bash

# Direct VPS Deployment Script
# This script will be executed directly on the VPS

echo "🚀 Starting deployment on VPS..."
echo "📦 Deploying: Professional Table Layout with Page Fit & Enhanced Readability"
echo ""

# Navigate to web directory
cd /var/www

# Check if repository exists
if [ -d 'smartuniit-taskflow' ]; then
    echo "📁 Repository exists, pulling latest changes..."
    cd smartuniit-taskflow
    git pull origin main
else
    echo "📁 Cloning repository..."
    git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git smartuniit-taskflow
    cd smartuniit-taskflow
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🔨 Building frontend..."
npm run build

echo "📦 Installing backend dependencies..."
cd server && npm install
cd ..

echo "🔄 Restarting PM2 process..."
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save

echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Your app is available at: http://work.smartuniit.com"
echo "📋 Check status with: pm2 status"
echo ""
echo "🎯 Latest Improvements:"
echo "• Table fits perfectly within A4 page margins"
echo "• Optimized column widths: [18, 85, 25, 32, 30] mm"
echo "• Enhanced text wrapping for descriptions (up to 4 lines)"
echo "• Professional readability with proper spacing"
echo "• No more table overflow issues"
echo "• Fully customizable Terms & Conditions"
echo "• Professional PDF generation with enhanced layout"
