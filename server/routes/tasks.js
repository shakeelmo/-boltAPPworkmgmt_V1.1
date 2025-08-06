const express = require('express');
const { run, get, all } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, requirePermission('tasks', 'read'), async (req, res) => {
  try {
    const { search, status, project_id, assigned_to, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (project_id) {
      whereClause += ' AND project_id = ?';
      params.push(project_id);
    }
    
    if (assigned_to) {
      whereClause += ' AND assigned_to = ?';
      params.push(assigned_to);
    }
    
    // Get tasks with pagination
    const tasks = await all(
      `SELECT t.*, u.name as assigned_to_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       ${whereClause} 
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    // Get total count
    const countResult = await get(
      `SELECT COUNT(*) as total FROM tasks t ${whereClause}`,
      params
    );
    
    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', authenticateToken, requirePermission('tasks', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await get(
      `SELECT t.*, u.name as assigned_to_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.id = ?`,
      [id]
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new task
router.post('/', authenticateToken, requirePermission('tasks', 'create'), async (req, res) => {
  try {
    const { title, description, project_id, assigned_to, due_date, estimated_hours, priority } = req.body;
    
    if (!title || !project_id) {
      return res.status(400).json({ error: 'Title and project are required' });
    }
    
    const taskId = Date.now().toString();
    
    await run(
      `INSERT INTO tasks (id, title, description, project_id, assigned_to, due_date, estimated_hours, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [taskId, title, description, project_id, assigned_to, due_date, estimated_hours, priority]
    );
    
    const newTask = await get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    
    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', authenticateToken, requirePermission('tasks', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, project_id, assigned_to, due_date, estimated_hours, actual_hours, priority, status } = req.body;
    
    // Check if task exists
    const existingTask = await get('SELECT id FROM tasks WHERE id = ?', [id]);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await run(
      `UPDATE tasks 
       SET title = ?, description = ?, project_id = ?, assigned_to = ?, due_date = ?, estimated_hours = ?, actual_hours = ?, priority = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [title, description, project_id, assigned_to, due_date, estimated_hours, actual_hours, priority, status, id]
    );
    
    const updatedTask = await get('SELECT * FROM tasks WHERE id = ?', [id]);
    
    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, requirePermission('tasks', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists
    const existingTask = await get('SELECT id FROM tasks WHERE id = ?', [id]);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await run('DELETE FROM tasks WHERE id = ?', [id]);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 