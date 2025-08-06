const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        console.error('Query error:', err);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error('Query error:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Query error:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const initDatabase = async () => {
  try {
    console.log('🔧 Initializing Database...');

    // Create users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create customers table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create vendors table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create quotations table with all required columns
    await runQuery(`
      CREATE TABLE IF NOT EXISTS quotations (
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
        subtotal REAL DEFAULT 0,
        discount_type TEXT DEFAULT 'percentage',
        discount_value REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        vat_rate REAL DEFAULT 15,
        vat_amount REAL DEFAULT 0,
        terms TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Create quotation_line_items table with unit fields
    await runQuery(`
      CREATE TABLE IF NOT EXISTS quotation_line_items (
        id TEXT PRIMARY KEY,
        quotation_id TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        unit TEXT DEFAULT 'piece',
        custom_unit TEXT,
        unit_price REAL NOT NULL DEFAULT 0,
        total_price REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE
      )
    `);

    // Create other tables
    await runQuery(`
      CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        customer_id TEXT,
        total_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        customer_id TEXT,
        status TEXT DEFAULT 'active',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        project_id TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT UNIQUE,
        customer_id TEXT,
        total_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS delivery_notes (
        id TEXT PRIMARY KEY,
        note_number TEXT UNIQUE,
        customer_id TEXT,
        status TEXT DEFAULT 'draft',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await runQuery(`
      INSERT OR IGNORE INTO users (id, name, email, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['admin-1', 'Admin User', 'admin@example.com', hashedPassword, 'admin', 'active']);

    // Insert sample customer
    await runQuery(`
      INSERT OR IGNORE INTO customers (id, name, email, phone)
      VALUES (?, ?, ?, ?)
    `, ['customer-123', 'Sample Customer 1', 'customer@example.com', '+966501234567']);

    // Insert sample vendor
    await runQuery(`
      INSERT OR IGNORE INTO vendors (id, name, email, phone)
      VALUES (?, ?, ?, ?)
    `, ['vendor-123', 'Sample Vendor 1', 'vendor@example.com', '+966501234568']);

    console.log('✅ Database initialized successfully!');
    
    // Show table info
    const tables = await allQuery("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Available tables:', tables.map(t => t.name));

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    db.close();
  }
};

initDatabase(); 