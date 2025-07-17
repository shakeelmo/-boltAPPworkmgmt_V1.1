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

// Helper function to run queries with promises
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper function to get single row
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to get multiple rows
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

async function initializeDatabase() {
  try {
    // Drop existing tables if they exist
    console.log('Dropping existing tables...');
    await run('DROP TABLE IF EXISTS quotation_line_items');
    await run('DROP TABLE IF EXISTS quotations');
    await run('DROP TABLE IF EXISTS proposal_line_items');
    await run('DROP TABLE IF EXISTS proposals');
    await run('DROP TABLE IF EXISTS tasks');
    await run('DROP TABLE IF EXISTS projects');
    await run('DROP TABLE IF EXISTS customers');
    await run('DROP TABLE IF EXISTS vendors');
    await run('DROP TABLE IF EXISTS users');

    console.log('Creating tables...');

    // Create users table
    await run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create customers table with contact_person column
    await run(`
      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
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

    // Create vendors table
    await run(`
      CREATE TABLE vendors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
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

    // Create projects table
    await run(`
      CREATE TABLE projects (
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

    // Create tasks table
    await run(`
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        project_id TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date DATE,
        assigned_to TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (assigned_to) REFERENCES users (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Create proposals table
    await run(`
      CREATE TABLE proposals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        customer_id TEXT,
        amount REAL,
        currency TEXT DEFAULT 'SAR',
        status TEXT DEFAULT 'draft',
        valid_until DATE,
        terms TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Create proposal_line_items table
    await run(`
      CREATE TABLE proposal_line_items (
        id TEXT PRIMARY KEY,
        proposal_id TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (proposal_id) REFERENCES proposals (id) ON DELETE CASCADE
      )
    `);

    // Create quotations table with unique quote_number
    await run(`
      CREATE TABLE quotations (
        id TEXT PRIMARY KEY,
        quote_number TEXT UNIQUE NOT NULL,
        proposal_id TEXT,
        customer_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'SAR',
        status TEXT DEFAULT 'draft',
        valid_until DATE,
        terms TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proposal_id) REFERENCES proposals (id),
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Create quotation_line_items table
    await run(`
      CREATE TABLE quotation_line_items (
        id TEXT PRIMARY KEY,
        quotation_id TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE
      )
    `);

    // Create invoices table
    await run(`
      CREATE TABLE invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_id TEXT,
        quotation_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'SAR',
        status TEXT DEFAULT 'draft',
        due_date DATE,
        issued_date DATE,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (quotation_id) REFERENCES quotations (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Create budget table
    await run(`
      CREATE TABLE budget (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'SAR',
        category TEXT,
        status TEXT DEFAULT 'active',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // --- SEED SUPERADMIN USERS ---
    const passwordHash = '$2a$10$RaoUaiMZLhEBJTqz9qeyWut/WBiurVcgQB.I7hksQXoYUWEf4BnJG'; // P@ssw0rd123

    await run(
      `INSERT OR IGNORE INTO users (id, name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['1', 'Admin', 'admin@smartuniit.com', passwordHash, 'superadmin', 'active']
    );

    await run(
      `INSERT OR IGNORE INTO users (id, name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['2', 'Shakeel Ali', 'shakeel.ali@smartuniit.com', passwordHash, 'superadmin', 'active']
    );

    // Insert default superadmin user
    console.log('Creating default superadmin user...');
    const superadminId = Date.now().toString();
    await run(
      `INSERT INTO users (id, name, email, password, role, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [superadminId, 'Super Admin', 'admin@smartuniit.com', '$2b$10$rQJ8N5vK8nQJ8N5vK8nQJ8N5vK8nQJ8N5vK8nQJ8N5vK8nQJ8N5vK8nQJ8', 'superadmin', 'active']
    );

    console.log('Database schema created successfully!');
    
    // Set proper permissions on database file
    const dbStats = fs.statSync(dbPath);
    fs.chmodSync(dbPath, 0o666);
    
    console.log('Database connection closed');
    db.close();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    db.close();
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 