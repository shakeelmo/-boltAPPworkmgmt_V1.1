#!/bin/bash

echo "🚀 Setting up SmartUniit Work Management Platform..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Initialize database
echo "🗄️ Initializing database..."
npm run db:init

# Build frontend
echo "🔨 Building frontend..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the backend server: cd server && npm start"
echo "2. Start the frontend: npm run dev"
echo ""
echo "Default admin credentials:"
echo "Email: admin@smartuniit.com"
echo "Password: admin123"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3001" 