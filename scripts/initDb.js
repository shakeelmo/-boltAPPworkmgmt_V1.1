const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
const dbPath = path.join(__dirname, '../data/workflow.db');

// Create database directory if it doesn't exist
const fs = require('fs');
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new sqlite3.Database(dbPath);

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        avatar_url TEXT,
        phone TEXT,
        department TEXT,
        status TEXT DEFAULT 'active',
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Customers table
      db.run(`CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        company TEXT,
        contact_person TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )`);

      // Vendors table
      db.run(`CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        contact_person TEXT,
        offering TEXT,
        website TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )`);

      // Projects table
      db.run(`CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        customer_id TEXT,
        proposal_id TEXT,
        status TEXT DEFAULT 'planning',
        priority TEXT DEFAULT 'medium',
        manager_id TEXT,
        start_date DATETIME,
        end_date DATETIME,
        progress INTEGER DEFAULT 0,
        budget REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (manager_id) REFERENCES users (id)
      )`);

      // Project assignments table
      db.run(`CREATE TABLE IF NOT EXISTS project_assignments (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        user_id TEXT,
        role TEXT DEFAULT 'member',
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Tasks table
      db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        project_id TEXT,
        assigned_to TEXT,
        status TEXT DEFAULT 'todo',
        priority TEXT DEFAULT 'medium',
        due_date DATETIME,
        estimated_hours REAL,
        actual_hours REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (assigned_to) REFERENCES users (id)
      )`);

      // Proposals table
      db.run(`CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        customer_id TEXT,
        vendor_id TEXT,
        status TEXT DEFAULT 'draft',
        value REAL,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (vendor_id) REFERENCES vendors (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )`);

      // Quotations table
      db.run(`CREATE TABLE IF NOT EXISTS quotations (
        id TEXT PRIMARY KEY,
        proposal_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'draft',
        valid_until DATETIME,
        terms TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proposal_id) REFERENCES proposals (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )`);

      // Quotation line items table
      db.run(`CREATE TABLE IF NOT EXISTS quotation_line_items (
        id TEXT PRIMARY KEY,
        quotation_id TEXT,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (quotation_id) REFERENCES quotations (id)
      )`);

      // Invoices table
      db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        project_id TEXT,
        quotation_id TEXT,
        invoice_number TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'draft',
        due_date DATETIME,
        paid_date DATETIME,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (quotation_id) REFERENCES quotations (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )`);

      // Invoice line items table
      db.run(`CREATE TABLE IF NOT EXISTS invoice_line_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices (id)
      )`);

      // Budgets table
      db.run(`CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'draft',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )`);

      // Budget categories table
      db.run(`CREATE TABLE IF NOT EXISTS budget_categories (
        id TEXT PRIMARY KEY,
        budget_id TEXT,
        name TEXT NOT NULL,
        allocated_amount REAL NOT NULL,
        spent_amount REAL DEFAULT 0,
        description TEXT,
        FOREIGN KEY (budget_id) REFERENCES budgets (id)
      )`);

      // Documents table
      db.run(`CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT,
        size INTEGER,
        uploaded_by TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
      )`);

      // Notifications table
      db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read BOOLEAN DEFAULT 0,
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Audit logs table
      db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        resource_id TEXT,
        old_values TEXT,
        new_values TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

// Create default admin user
const createDefaultAdmin = async () => {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('password123', 10);
  const techPassword = await bcrypt.hash('password123', 10);
  const superAdminPassword = await bcrypt.hash('VdiHaiAaj?1', 10);

  return Promise.all([
    new Promise((resolve, reject) => {
      db.run(`INSERT OR IGNORE INTO users (id, email, name, role, password_hash, status) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        ['1', 'admin@smartuniit.com', 'Ahmed Al-Rashid', 'admin', adminPassword, 'active'],
        (err) => err ? reject(err) : resolve()
      );
    }),
    new Promise((resolve, reject) => {
      db.run(`INSERT OR IGNORE INTO users (id, email, name, role, password_hash, status) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        ['2', 'manager@smartuniit.com', 'Fatima Al-Saleh', 'manager', managerPassword, 'active'],
        (err) => err ? reject(err) : resolve()
      );
    }),
    new Promise((resolve, reject) => {
      db.run(`INSERT OR IGNORE INTO users (id, email, name, role, password_hash, status) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        ['3', 'tech@smartuniit.com', 'Mohammed Tech', 'employee', techPassword, 'active'],
        (err) => err ? reject(err) : resolve()
      );
    }),
    new Promise((resolve, reject) => {
      db.run(`INSERT OR IGNORE INTO users (id, email, name, role, password_hash, status) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        ['4', 'shakeel.ali@smartuniit.com', 'Shakeel Ali', 'superadmin', superAdminPassword, 'active'],
        (err) => err ? reject(err) : resolve()
      );
    })
  ]);
};

// Initialize database
const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    await createTables();
    await createDefaultAdmin();
    console.log('Database initialized successfully!');
    console.log('Default admin user: admin@smartuniit.com / admin123');
    db.close();
  } catch (error) {
    console.error('Error initializing database:', error);
    db.close();
    process.exit(1);
  }
};

// Run initialization
initDatabase(); 