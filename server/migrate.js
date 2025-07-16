const { run, get, all } = require('./db');

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Check if quote_number column exists
    const tableInfo = await all("PRAGMA table_info(quotations)");
    const hasQuoteNumber = tableInfo.some(col => col.name === 'quote_number');
    
    if (!hasQuoteNumber) {
      console.log('Adding quote_number column to quotations table...');
      // Add column without UNIQUE constraint first
      await run('ALTER TABLE quotations ADD COLUMN quote_number TEXT');
      
      // Update existing quotations with quote numbers
      const existingQuotations = await all('SELECT id, created_at FROM quotations ORDER BY created_at');
      if (existingQuotations.length > 0) {
        console.log(`Updating ${existingQuotations.length} existing quotations with quote numbers...`);
        
        const year = new Date().getFullYear();
        let sequence = 1;
        
        for (const quotation of existingQuotations) {
          const quoteNumber = `Q-${year}-${sequence.toString().padStart(4, '0')}`;
          await run('UPDATE quotations SET quote_number = ? WHERE id = ?', [quoteNumber, quotation.id]);
          sequence++;
        }
      }
      
      // Now add UNIQUE constraint
      console.log('Adding UNIQUE constraint to quote_number column...');
      await run('CREATE UNIQUE INDEX idx_quotations_quote_number ON quotations(quote_number)');
    }
    
    // Delivery Notes Table
    await run(`
      CREATE TABLE IF NOT EXISTS delivery_notes (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        invoice_id TEXT,
        delivery_date TEXT NOT NULL,
        recipient_name TEXT,
        signature TEXT, -- base64 or file path
        notes TEXT,
        created_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Delivery Note Items Table
    await run(`
      CREATE TABLE IF NOT EXISTS delivery_note_items (
        id TEXT PRIMARY KEY,
        delivery_note_id TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT,
        remarks TEXT,
        FOREIGN KEY (delivery_note_id) REFERENCES delivery_notes(id)
      )
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate().then(() => {
    console.log('Migration script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = { migrate }; 