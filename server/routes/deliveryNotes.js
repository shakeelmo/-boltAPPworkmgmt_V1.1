const express = require('express');
const { run, get, all } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get all delivery notes
router.get('/', authenticateToken, requirePermission('delivery_notes', 'read'), async (req, res) => {
  try {
    const notes = await all(
      `SELECT dn.*, c.name as customer_name, u.name as created_by_name
       FROM delivery_notes dn
       LEFT JOIN customers c ON dn.customer_id = c.id
       LEFT JOIN users u ON dn.created_by = u.id
       ORDER BY dn.created_at DESC`
    );
    res.json({ deliveryNotes: notes });
  } catch (error) {
    console.error('Get delivery notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single delivery note
router.get('/:id', authenticateToken, requirePermission('delivery_notes', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    const note = await get(
      `SELECT dn.*, c.name as customer_name, u.name as created_by_name
       FROM delivery_notes dn
       LEFT JOIN customers c ON dn.customer_id = c.id
       LEFT JOIN users u ON dn.created_by = u.id
       WHERE dn.id = ?`,
      [id]
    );
    if (!note) return res.status(404).json({ error: 'Delivery note not found' });
    const items = await all('SELECT * FROM delivery_note_items WHERE delivery_note_id = ?', [id]);
    res.json({ deliveryNote: { ...note, items } });
  } catch (error) {
    console.error('Get delivery note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create delivery note
router.post('/', authenticateToken, requirePermission('delivery_notes', 'create'), async (req, res) => {
  try {
    const { customer_id, invoice_id, delivery_date, recipient_name, signature, notes, items } = req.body;
    if (!customer_id || !delivery_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer, delivery date, and at least one item are required' });
    }
    const noteId = Date.now().toString();
    await run(
      `INSERT INTO delivery_notes (id, customer_id, invoice_id, delivery_date, recipient_name, signature, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [noteId, customer_id, invoice_id || null, delivery_date, recipient_name, signature, notes, req.user.id]
    );
    for (const item of items) {
      const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      await run(
        `INSERT INTO delivery_note_items (id, delivery_note_id, description, quantity, unit, remarks) VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, noteId, item.description, item.quantity, item.unit, item.remarks]
      );
    }
    const newNote = await get('SELECT * FROM delivery_notes WHERE id = ?', [noteId]);
    res.status(201).json({ message: 'Delivery note created', deliveryNote: newNote });
  } catch (error) {
    console.error('Create delivery note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update delivery note
router.put('/:id', authenticateToken, requirePermission('delivery_notes', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_date, recipient_name, signature, notes, items } = req.body;
    const existing = await get('SELECT id FROM delivery_notes WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Delivery note not found' });
    await run(
      `UPDATE delivery_notes SET delivery_date = ?, recipient_name = ?, signature = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [delivery_date, recipient_name, signature, notes, id]
    );
    if (items && Array.isArray(items)) {
      await run('DELETE FROM delivery_note_items WHERE delivery_note_id = ?', [id]);
      for (const item of items) {
        const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        await run(
          `INSERT INTO delivery_note_items (id, delivery_note_id, description, quantity, unit, remarks) VALUES (?, ?, ?, ?, ?, ?)`,
          [itemId, id, item.description, item.quantity, item.unit, item.remarks]
        );
      }
    }
    const updatedNote = await get('SELECT * FROM delivery_notes WHERE id = ?', [id]);
    res.json({ message: 'Delivery note updated', deliveryNote: updatedNote });
  } catch (error) {
    console.error('Update delivery note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete delivery note
router.delete('/:id', authenticateToken, requirePermission('delivery_notes', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await get('SELECT id FROM delivery_notes WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Delivery note not found' });
    await run('DELETE FROM delivery_note_items WHERE delivery_note_id = ?', [id]);
    await run('DELETE FROM delivery_notes WHERE id = ?', [id]);
    res.json({ message: 'Delivery note deleted' });
  } catch (error) {
    console.error('Delete delivery note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 