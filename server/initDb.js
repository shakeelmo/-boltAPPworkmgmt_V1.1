const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'smartuniit_taskflow.db');
console.log('Initializing database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  db.run('PRAGMA foreign_keys = ON');
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);
    // Customers table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);
    // Vendors table
    db.run(`CREATE TABLE IF NOT EXISTS vendors (
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);
    // Quotations table
    db.run(`CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      quote_number TEXT UNIQUE,
      customer_id TEXT,
      total_amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'SAR',
      status TEXT DEFAULT 'draft',
      valid_until TEXT,
      notes TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);
    // Quotation Items table
    db.run(`CREATE TABLE IF NOT EXISTS quotation_items (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id)
    )`);
    // Proposals table
    db.run(`CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      proposal_number TEXT UNIQUE,
      customer_id TEXT,
      total_amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'SAR',
      status TEXT DEFAULT 'draft',
      valid_until TEXT,
      notes TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);
    // Proposal Items table
    db.run(`CREATE TABLE IF NOT EXISTS proposal_items (
      id TEXT PRIMARY KEY,
      proposal_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (proposal_id) REFERENCES proposals(id)
    )`);
    // Projects table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      customer_id TEXT,
      status TEXT DEFAULT 'active',
      start_date TEXT,
      end_date TEXT,
      budget REAL DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);
    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      project_id TEXT,
      assigned_to TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);
    // Invoices table
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      quotation_id TEXT,
      invoice_number TEXT UNIQUE,
      total_amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'SAR',
      due_date TEXT,
      status TEXT DEFAULT 'draft',
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (quotation_id) REFERENCES quotations(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);
    // Invoice Items table
    db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )`);
    // Delivery Notes Table
    db.run(`CREATE TABLE IF NOT EXISTS delivery_notes (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      invoice_id TEXT,
      delivery_date TEXT NOT NULL,
      recipient_name TEXT,
      signature TEXT,
      notes TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);
    // Delivery Note Items Table
    db.run(`CREATE TABLE IF NOT EXISTS delivery_note_items (
      id TEXT PRIMARY KEY,
      delivery_note_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT,
      remarks TEXT,
      FOREIGN KEY (delivery_note_id) REFERENCES delivery_notes(id)
    )`);
    console.log('Database schema created successfully!');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  });
}); 