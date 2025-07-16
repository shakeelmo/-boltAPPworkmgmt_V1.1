#!/bin/bash

# Deployment script for BoltAPP Workflow Management
echo "🚀 Starting deployment..."

# Update from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install && cd ..

# Initialize database
echo "🗄️ Initializing database..."
node scripts/initDb.js

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Restart PM2 processes
echo "🔄 Restarting PM2 processes..."
pm2 restart ecosystem.config.js --env production

echo "✅ Deployment completed!"
echo "🌐 Your app should be running on your VPS IP address"
echo "📊 Check PM2 status with: pm2 status"
echo "📋 Check logs with: pm2 logs" 