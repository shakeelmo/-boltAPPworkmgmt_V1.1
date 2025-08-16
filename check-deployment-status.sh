#!/bin/bash

# Check Deployment Status Script
echo "🔍 Checking Deployment Status on VPS: 109.199.116.107"
echo "=================================================="
echo ""

# Check if sshpass is available
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass not found. Please install it first:"
    echo "   macOS: brew install sshpass"
    echo "   Linux: sudo apt-get install sshpass"
    exit 1
fi

echo "📡 Connecting to VPS and checking status..."
echo ""

# Check PM2 status
echo "📱 Checking PM2 Status..."
sshpass -p 'X9mK4LpZq7GtV2Fb' ssh -o StrictHostKeyChecking=no root@109.199.116.107 'pm2 status' 2>/dev/null || echo "❌ Could not check PM2 status"

echo ""

# Check if application directory exists
echo "📁 Checking Application Directory..."
sshpass -p 'X9mK4LpZq7GtV2Fb' ssh -o StrictHostKeyChecking=no root@109.199.116.107 'ls -la /var/www/' 2>/dev/null || echo "❌ Could not check directory"

echo ""

# Check if dist folder exists
echo "🔨 Checking Frontend Build..."
sshpass -p 'X9mK4LpZq7GtV2Fb' ssh -o StrictHostKeyChecking=no root@109.199.116.107 'ls -la /var/www/smartuniit-taskflow/dist/' 2>/dev/null || echo "❌ Could not check dist folder"

echo ""

# Check Nginx configuration
echo "🌐 Checking Nginx Configuration..."
sshpass -p 'X9mK4LpZq7GtV2Fb' ssh -o StrictHostKeyChecking=no root@109.199.116.107 'nginx -t' 2>/dev/null || echo "❌ Could not check Nginx config"

echo ""

# Check Nginx status
echo "🌐 Checking Nginx Status..."
sshpass -p 'X9mK4LpZq7GtV2Fb' ssh -o StrictHostKeyChecking=no root@109.199.116.107 'systemctl status nginx --no-pager -l' 2>/dev/null || echo "❌ Could not check Nginx status"

echo ""

# Check if backend is responding
echo "🔍 Testing Backend API..."
sshpass -p 'X9mK4LpZq7GtV2Fb' ssh -o StrictHostKeyChecking=no root@109.199.116.107 'curl -s http://localhost:3001/api/auth/login' 2>/dev/null || echo "❌ Backend not responding"

echo ""
echo "✅ Status check completed!"
echo "🌐 Try accessing: http://work.smartuniit.com"
echo "👤 Login: admin@example.com / admin123"

