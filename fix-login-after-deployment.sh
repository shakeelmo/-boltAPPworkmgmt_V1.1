#!/bin/bash

# Fix Login Issues After Deployment
# VPS: 109.199.116.107
# Domain: work.smartuniit.com

echo "🔧 Fixing Login Issues After Deployment"
echo "======================================"
echo ""

# Navigate to project directory
cd /var/www/smartuniit-taskflow

echo "📁 Current directory: $(pwd)"
echo ""

# Check if database exists
if [ -f "server/database.sqlite" ]; then
    echo "✅ Database file exists"
else
    echo "❌ Database file not found, creating..."
    touch server/database.sqlite
fi

# Initialize database
echo "🗄️ Initializing database..."
cd server
node initDatabase.js

# Create admin user
echo "👤 Creating admin user..."
node createAdmin.js

# Check if admin user was created successfully
echo "🔍 Checking admin user..."
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], (err, row) => {
    if (err) {
        console.log('❌ Error checking admin user:', err.message);
    } else if (row) {
        console.log('✅ Admin user exists:', row.email);
    } else {
        console.log('❌ Admin user not found');
    }
    db.close();
});
"

cd ..

# Restart the application
echo "🔄 Restarting application..."
pm2 restart ecosystem.config.js

# Show status
echo ""
echo "📱 PM2 Status:"
pm2 status

echo ""
echo "✅ Login fix completed!"
echo "🌐 Try logging in at: http://work.smartuniit.com"
echo "👤 Username: admin@example.com"
echo "🔑 Password: admin123"
echo ""
echo "📋 If still having issues, check the logs:"
echo "pm2 logs smartuniit-taskflow-backend"

