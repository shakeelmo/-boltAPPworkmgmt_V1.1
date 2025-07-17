#!/bin/bash

# VPS Deployment Script for SmartUniit TaskFlow
# Run this on your VPS after SSH-ing in

echo "=== SmartUniit TaskFlow VPS Deployment ==="

# Stop any running backend
pm2 stop all || true

# Remove old app (use quotes to handle the dash)
rm -rf ~/-boltAPPworkmgmt_V1.1

# Clone the repository
git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git

# Navigate to the directory (use quotes to handle the dash)
cd "-boltAPPworkmgmt_V1.1"

# Install backend dependencies
cd server
npm install

# Go back to project root and create data dir
cd ..
mkdir -p data
chmod 777 data

# Create the missing initDb.js script
mkdir -p server/scripts
cat > server/scripts/initDb.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.join(__dirname, '../../data/smartuniit_taskflow.db');

console.log('Initializing database at:', dbPath);

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Helper function to run SQL
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error running SQL:', err);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('Creating tables...');

    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        company TEXT,
        contact_person TEXT,
        website TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Vendors table
    await run(`
      CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        company TEXT,
        contact_person TEXT,
        website TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Quotations table
    await run(`
      CREATE TABLE IF NOT EXISTS quotations (
        id TEXT PRIMARY KEY,
        quote_number TEXT UNIQUE NOT NULL,
        customer_id TEXT,
        description TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'draft',
        valid_until DATE,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Proposals table
    await run(`
      CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        customer_id TEXT,
        status TEXT DEFAULT 'draft',
        start_date DATE,
        end_date DATE,
        budget REAL,
        priority TEXT DEFAULT 'medium',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Projects table
    await run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        customer_id TEXT,
        status TEXT DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        budget REAL,
        priority TEXT DEFAULT 'medium',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Tasks table
    await run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        project_id TEXT,
        assigned_to TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date DATE,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (assigned_to) REFERENCES users (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Invoices table
    await run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        invoice_number TEXT UNIQUE NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        due_date DATE,
        status TEXT DEFAULT 'pending',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    console.log('Database initialized successfully!');
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();
EOF

# Initialize the database
echo "Initializing database..."
node server/scripts/initDb.js

# Build the frontend
echo "Building frontend..."
npm install
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'smartuniit-backend',
    script: 'server/index.js',
    cwd: '/var/www/-boltAPPworkmgmt_V1.1',
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

# Start the backend with PM2
echo "Starting backend with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

echo "=== Deployment Complete! ==="
echo "Backend is running on port 3001"
echo "Visit your domain to access the application"
echo "PM2 Status: pm2 status"
echo "PM2 Logs: pm2 logs smartuniit-backend" 