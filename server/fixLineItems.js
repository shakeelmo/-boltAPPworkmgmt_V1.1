const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
console.log('Fixing quotation_line_items table in database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  db.serialize(() => {
    // Drop and recreate quotation_line_items table with proper structure
    console.log('Fixing quotation_line_items table...');
    
    db.run('DROP TABLE IF EXISTS quotation_line_items', (err) => {
      if (err) {
        console.error('Error dropping table:', err.message);
        return;
      }
      console.log('✅ Dropped existing quotation_line_items table');
      
      // Create new table with proper structure
      const createTableSQL = `
        CREATE TABLE quotation_line_items (
          id TEXT PRIMARY KEY,
          quotation_id TEXT NOT NULL,
          description TEXT NOT NULL,
          quantity REAL NOT NULL DEFAULT 1,
          unit_price REAL NOT NULL DEFAULT 0,
          total_price REAL NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE
        )
      `;
      
      db.run(createTableSQL, (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        } else {
          console.log('✅ Created new quotation_line_items table with proper structure');
        }
        
        // Close database
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
            console.log('\n🎉 quotation_line_items table fixed successfully!');
          }
        });
      });
    });
  });
}); 