const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../data/workflow.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database for final migration');
  }
});

// Fix database schema with proper UNIQUE constraint handling
const fixDatabaseFinal = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('Starting final database migration...');
      
      // First, let's check if quotation_number column exists
      db.get("PRAGMA table_info(quotations)", (err, rows) => {
        if (err) {
          console.error('Error checking table schema:', err.message);
          reject(err);
          return;
        }
        
        // Get all column info
        db.all("PRAGMA table_info(quotations)", (err, columns) => {
          if (err) {
            console.error('Error getting column info:', err.message);
            reject(err);
            return;
          }
          
          const columnNames = columns.map(col => col.name);
          console.log('Existing columns:', columnNames);
          
          // Add quotation_number column if it doesn't exist
          if (!columnNames.includes('quotation_number')) {
            console.log('Adding quotation_number column...');
            db.run('ALTER TABLE quotations ADD COLUMN quotation_number TEXT', (err) => {
              if (err) {
                console.error('Error adding quotation_number column:', err.message);
              } else {
                console.log('Successfully added quotation_number column');
                
                // Now add UNIQUE constraint by recreating the table
                db.run(`
                  CREATE TABLE quotations_new (
                    id TEXT PRIMARY KEY,
                    quotation_number TEXT UNIQUE,
                    proposal_id TEXT,
                    customer_id TEXT,
                    total_amount REAL NOT NULL,
                    currency TEXT DEFAULT 'SAR',
                    status TEXT DEFAULT 'draft',
                    valid_until DATETIME,
                    terms TEXT,
                    subtotal REAL,
                    discount_type TEXT DEFAULT 'percentage',
                    discount_value REAL DEFAULT 0,
                    discount_amount REAL DEFAULT 0,
                    vat_rate REAL DEFAULT 15,
                    vat_amount REAL DEFAULT 0,
                    created_by TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (proposal_id) REFERENCES proposals (id),
                    FOREIGN KEY (customer_id) REFERENCES customers (id),
                    FOREIGN KEY (created_by) REFERENCES users (id)
                  )
                `, (err) => {
                  if (err) {
                    console.error('Error creating new table:', err.message);
                  } else {
                    console.log('Created new quotations table with proper schema');
                    
                    // Copy data from old table to new table
                    db.run(`
                      INSERT INTO quotations_new 
                      SELECT id, quotation_number, proposal_id, customer_id, total_amount, 
                             currency, status, valid_until, terms, subtotal, discount_type, 
                             discount_value, discount_amount, vat_rate, vat_amount, 
                             created_by, created_at, updated_at
                      FROM quotations
                    `, (err) => {
                      if (err) {
                        console.error('Error copying data:', err.message);
                      } else {
                        console.log('Copied data to new table');
                        
                        // Drop old table and rename new one
                        db.run('DROP TABLE quotations', (err) => {
                          if (err) {
                            console.error('Error dropping old table:', err.message);
                          } else {
                            db.run('ALTER TABLE quotations_new RENAME TO quotations', (err) => {
                              if (err) {
                                console.error('Error renaming table:', err.message);
                              } else {
                                console.log('Successfully recreated quotations table with proper schema');
                                resolve();
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          } else {
            console.log('quotation_number column already exists');
            resolve();
          }
        });
      });
    });
  });
};

// Generate quotation numbers for existing records
const generateQuotationNumbers = () => {
  return new Promise((resolve, reject) => {
    console.log('Generating quotation numbers for existing records...');
    
    db.all('SELECT id FROM quotations WHERE quotation_number IS NULL', (err, rows) => {
      if (err) {
        console.error('Error fetching quotations without numbers:', err.message);
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('No quotations need quotation numbers');
        resolve();
        return;
      }
      
      let updated = 0;
      const total = rows.length;
      
      rows.forEach((row, index) => {
        const year = new Date().getFullYear();
        const quoteNumber = `Q-${year}-${(index + 1).toString().padStart(4, '0')}`;
        
        db.run('UPDATE quotations SET quotation_number = ? WHERE id = ?', 
          [quoteNumber, row.id], (err) => {
            if (err) {
              console.error('Error updating quotation number:', err.message);
            } else {
              console.log(`Updated quotation ${row.id} with number ${quoteNumber}`);
            }
            
            updated++;
            if (updated === total) {
              console.log('All quotation numbers generated');
              resolve();
            }
          });
      });
    });
  });
};

// Run final migration
const runFinalMigration = async () => {
  try {
    await fixDatabaseFinal();
    await generateQuotationNumbers();
    console.log('Final database migration completed successfully!');
    db.close();
  } catch (error) {
    console.error('Error during final migration:', error);
    db.close();
    process.exit(1);
  }
};

// Run migration
runFinalMigration(); 