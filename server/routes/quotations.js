const express = require('express');
const { run, get, all } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Function to generate quote number
const generateQuoteNumber = async () => {
  try {
    // Get current date components
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Generate a random 4-digit number
    const randomNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    
    // Format: Q-DDMM-XXXX (e.g., Q-1507-1234)
    const quoteNumber = `Q-${day}${month}-${randomNum}`;
    
    // Check if this quote number already exists
    const existingQuote = await get(
      'SELECT id FROM quotations WHERE quote_number = ?',
      [quoteNumber]
    );
    
    // If exists, generate a new one (recursive call with different random number)
    if (existingQuote) {
      return generateQuoteNumber();
    }
    
    return quoteNumber;
  } catch (error) {
    console.error('Error generating quote number:', error);
    // Fallback to timestamp-based number
    return `Q-${Date.now()}`;
  }
};

// Get all quotations
router.get('/', authenticateToken, requirePermission('quotations', 'read'), async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (q.id LIKE ? OR q.quote_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (status) {
      whereClause += ' AND q.status = ?';
      params.push(status);
    }
    
    // Get quotations with pagination - removed proposal references
    const quotations = await all(
      `SELECT q.*, u.name as created_by_name 
       FROM quotations q 
       LEFT JOIN users u ON q.created_by = u.id 
       ${whereClause} 
       ORDER BY q.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    // Get line items for each quotation
    const quotationsWithLineItems = await Promise.all(
      quotations.map(async (quotation) => {
        const lineItems = await all(
          'SELECT * FROM quotation_line_items WHERE quotation_id = ?',
          [quotation.id]
        );
        return { ...quotation, lineItems };
      })
    );
    
    // Get total count
    const countResult = await get(
      `SELECT COUNT(*) as total FROM quotations q ${whereClause}`,
      params
    );
    
    res.json({
      quotations: quotationsWithLineItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single quotation
router.get('/:id', authenticateToken, requirePermission('quotations', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const quotation = await get(
      `SELECT q.*, u.name as created_by_name 
       FROM quotations q 
       LEFT JOIN users u ON q.created_by = u.id 
       WHERE q.id = ?`,
      [id]
    );
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Get line items
    const lineItems = await all(
      'SELECT * FROM quotation_line_items WHERE quotation_id = ?',
      [id]
    );
    
    res.json({ 
      quotation: { ...quotation, lineItems }
    });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new quotation
router.post('/', authenticateToken, requirePermission('quotations', 'create'), async (req, res) => {
  try {
    const { amount, total_amount, currency, valid_until, terms, lineItems, customer_id } = req.body;
    
    // Validate required fields
    const finalAmount = amount || total_amount;
    if (!finalAmount || finalAmount === undefined || finalAmount === null) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    // Ensure amount is a valid number
    const numericAmount = parseFloat(finalAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid positive number' });
    }
    
    const quotationId = Date.now().toString();
    const quoteNumber = await generateQuoteNumber();
    
    // Removed proposal_id from INSERT
    await run(
      `INSERT INTO quotations (id, quote_number, total_amount, currency, valid_until, notes, created_by, customer_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [quotationId, quoteNumber, numericAmount, currency || 'SAR', valid_until, terms, req.user.id, customer_id || null]
    );
    
    // Insert line items if provided
    if (lineItems && lineItems.length > 0) {
      for (const item of lineItems) {
        const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        await run(
          `INSERT INTO quotation_line_items (id, quotation_id, description, quantity, unit_price, total_price) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [itemId, quotationId, item.description, item.quantity, item.unitPrice, item.total]
        );
      }
    }
    
    const newQuotation = await get('SELECT * FROM quotations WHERE id = ?', [quotationId]);
    
    res.status(201).json({
      message: 'Quotation created successfully',
      quotation: newQuotation
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    if (error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update quotation
router.put('/:id', authenticateToken, requirePermission('quotations', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, valid_until, terms, status, customer_id } = req.body;

    // Validate required fields
    if (amount !== undefined && amount !== null) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a valid positive number' });
      }
    }

    // Check if quotation exists
    const existingQuotation = await get('SELECT id FROM quotations WHERE id = ?', [id]);
    if (!existingQuotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const updateData = [];
    const updateFields = [];
    
    if (amount !== undefined) {
      updateFields.push('amount = ?');
      updateData.push(parseFloat(amount));
    }
    if (currency !== undefined) {
      updateFields.push('currency = ?');
      updateData.push(currency);
    }
    if (valid_until !== undefined) {
      updateFields.push('valid_until = ?');
      updateData.push(valid_until);
    }
    if (terms !== undefined) {
      updateFields.push('terms = ?');
      updateData.push(terms);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateData.push(status);
    }
    if (customer_id !== undefined) {
      updateFields.push('customer_id = ?');
      updateData.push(customer_id);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateData.push(id);

    if (updateFields.length > 0) {
      await run(
        `UPDATE quotations SET ${updateFields.join(', ')} WHERE id = ?`,
        updateData
      );
    }

    const updatedQuotation = await get('SELECT * FROM quotations WHERE id = ?', [id]);

    res.json({
      message: 'Quotation updated successfully',
      quotation: updatedQuotation
    });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete quotation
router.delete('/:id', authenticateToken, requirePermission('quotations', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if quotation exists
    const existingQuotation = await get('SELECT id FROM quotations WHERE id = ?', [id]);
    if (!existingQuotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Delete line items first
    await run('DELETE FROM quotation_line_items WHERE quotation_id = ?', [id]);
    
    // Delete quotation
    await run('DELETE FROM quotations WHERE id = ?', [id]);
    
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate PDF for quotation
router.get('/:id/pdf', authenticateToken, requirePermission('quotations', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get quotation with line items
    const quotation = await get('SELECT * FROM quotations WHERE id = ?', [id]);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Get line items
    const lineItems = await all('SELECT * FROM quotation_line_items WHERE quotation_id = ?', [id]);
    
    // Get customer info if available
    let customer = null;
    if (quotation.customer_id) {
      customer = await get('SELECT * FROM customers WHERE id = ?', [quotation.customer_id]);
    }
    
    // Prepare quote data for PDF generation
    const quoteData = {
      id: quotation.id,
      quote_number: quotation.quote_number,
      customer: customer || {
        name: 'Customer Name',
        address: 'Customer Address',
        phone: 'N/A',
        email: 'N/A'
      },
      lineItems: lineItems.map(item => ({
        name: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total_price
      })),
      totalAmount: quotation.total_amount,
      currency: quotation.currency || 'SAR',
      validUntil: quotation.valid_until,
      notes: quotation.notes,
      terms: quotation.terms,
      created_at: quotation.created_at
    };
    
    // For now, return the quote data as JSON
    // The actual PDF generation will be handled by the frontend
    res.json({
      message: 'Quote data for PDF generation',
      quote: quoteData
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 