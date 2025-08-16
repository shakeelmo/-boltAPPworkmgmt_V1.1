#!/bin/bash

# Comprehensive Login Issue Diagnosis
# VPS: 109.199.116.107
# Domain: work.smartuniit.com

echo "🔍 Comprehensive Login Issue Diagnosis"
echo "====================================="
echo ""

# Navigate to project directory
cd /var/www/smartuniit-taskflow

echo "📁 Current directory: $(pwd)"
echo ""

# 1. Check if project files exist
echo "1️⃣ Checking project files..."
if [ -d "server" ]; then
    echo "✅ Server directory exists"
else
    echo "❌ Server directory missing"
    exit 1
fi

if [ -d "dist" ]; then
    echo "✅ Dist directory exists"
else
    echo "❌ Dist directory missing - need to build frontend"
fi

# 2. Check database
echo ""
echo "2️⃣ Checking database..."
if [ -f "server/database.sqlite" ]; then
    echo "✅ Database file exists"
    ls -la server/database.sqlite
else
    echo "❌ Database file missing"
fi

# 3. Check if backend is running
echo ""
echo "3️⃣ Checking backend status..."
pm2 status

# 4. Check backend logs
echo ""
echo "4️⃣ Checking backend logs..."
pm2 logs smartuniit-taskflow-backend --lines 20

# 5. Test backend API directly
echo ""
echo "5️⃣ Testing backend API..."
echo "Testing if backend responds on port 3001..."
curl -s http://localhost:3001/api/auth/login || echo "❌ Backend not responding on port 3001"

# 6. Check Nginx status
echo ""
echo "6️⃣ Checking Nginx status..."
systemctl status nginx --no-pager -l

# 7. Check Nginx configuration
echo ""
echo "7️⃣ Checking Nginx configuration..."
nginx -t

# 8. Check if domain resolves
echo ""
echo "8️⃣ Checking domain resolution..."
nslookup work.smartuniit.com

# 9. Test domain access
echo ""
echo "9️⃣ Testing domain access..."
curl -s -I http://work.smartuniit.com || echo "❌ Domain not accessible"

# 10. Check file permissions
echo ""
echo "🔟 Checking file permissions..."
ls -la server/
ls -la dist/

# 11. Try to recreate admin user
echo ""
echo "1️⃣1️⃣ Recreating admin user..."
cd server
node createAdmin.js
cd ..

# 12. Restart everything
echo ""
echo "1️⃣2️⃣ Restarting services..."
pm2 restart ecosystem.config.js
systemctl reload nginx

echo ""
echo "✅ Diagnosis completed!"
echo "📋 Summary of findings above."
echo ""
echo "🌐 Try accessing: http://work.smartuniit.com"
echo "👤 Login: admin@example.com / admin123"
echo ""
echo "📋 If still having issues, check:"
echo "• Backend logs: pm2 logs smartuniit-taskflow-backend"
echo "• Nginx logs: tail -f /var/log/nginx/error.log"
echo "• System logs: journalctl -u nginx"

