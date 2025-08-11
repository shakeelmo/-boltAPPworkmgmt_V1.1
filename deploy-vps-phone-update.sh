#!/usr/bin/expect -f

# VPS Deployment Script for Phone Number Update
# This script will automatically SSH to your VPS and deploy the updated version

set timeout 300
set VPS_IP "109.199.116.107"
set VPS_USER "root"
set VPS_PASSWORD "X9mK4LpZq7GtV2Fb"

puts "🚀 Starting deployment to VPS: $VPS_IP"
puts "👤 User: $VPS_USER"
puts "📞 Updating: Phone number to +966 550188288"
puts "📦 Deploying: Latest version with all improvements"

spawn ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP

expect {
    "password:" {
        send "$VPS_PASSWORD\r"
        puts "🔐 Password sent"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$VPS_PASSWORD\r"
        puts "🔐 Password sent after host verification"
    }
}

expect "#"

puts "📥 Pulling latest changes from GitHub..."
send "cd /var/www/-boltAPPworkmgmt_V1.1\r"
expect "#"

send "git pull origin main\r"
expect "#"

puts "📦 Installing frontend dependencies..."
send "npm install\r"
expect "#"

puts "🔧 Installing backend dependencies..."
send "cd server && npm install\r"
expect "#"

puts "🏠 Returning to project root..."
send "cd ..\r"
expect "#"

puts "🔨 Building frontend..."
send "npm run build\r"
expect "#"

puts "🔄 Restarting PM2 processes..."
send "pm2 restart ecosystem.config.js --env production\r"
expect "#"

puts "📊 Checking PM2 status..."
send "pm2 status\r"
expect "#"

puts "✅ Deployment completed successfully!"
puts "🌐 Your updated app is now running on VPS: $VPS_IP"
puts "📞 New phone number: +966 550188288"
puts "📋 Check logs with: pm2 logs smartuniit-backend"

send "exit\r"
expect eof

puts "🎉 Deployment script completed!"
puts "📱 Phone number updated to: +966 550188288"
