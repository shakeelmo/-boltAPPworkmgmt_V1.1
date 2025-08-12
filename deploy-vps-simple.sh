#!/bin/bash

# Simple VPS Deployment Script
# VPS Details: 109.199.116.107
# Username: root
# Password: X9mK4LpZq7GtV2Fb

echo "🚀 Starting deployment to VPS: 109.199.116.107"
echo "📦 Deploying: Enhanced table layout with extended description column"
echo ""

# Manual deployment steps
echo "📋 Manual Deployment Steps:"
echo "1. SSH to your VPS: ssh root@109.199.116.107"
echo "2. Enter password: X9mK4LpZq7GtV2Fb"
echo "3. Run these commands:"
echo ""

echo "cd /var/www"
echo "if [ -d 'smartuniit-taskflow' ]; then"
echo "  cd smartuniit-taskflow"
echo "  git pull origin main"
echo "else"
echo "  git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git smartuniit-taskflow"
echo "  cd smartuniit-taskflow"
echo "fi"
echo ""
echo "npm install"
echo "npm run build"
echo "cd server && npm install"
echo "cd .."
echo ""
echo "pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js"
echo "pm2 save"
echo ""
echo "systemctl reload nginx"
echo ""
echo "✅ Deployment completed!"
echo "🌐 Your app will be available at: http://109.199.116.107"
echo "📋 Check status with: pm2 status"
