const jwt = require('jsonwebtoken');
const { get } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar_url,
      phone: user.phone,
      department: user.department,
      status: user.status
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check if user has required permission
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin has all permissions
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }

    // Check specific permissions based on role
    const hasPermission = checkPermission(req.user.role, resource, action);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Simple permission checking function
const checkPermission = (role, resource, action) => {
  const permissions = {
    manager: {
      users: ['read'],
      customers: ['create', 'read', 'update'],
      vendors: ['create', 'read', 'update'],
      projects: ['create', 'read', 'update', 'delete'],
      tasks: ['create', 'read', 'update', 'delete'],
      proposals: ['create', 'read', 'update'],
      quotations: ['create', 'read', 'update'],
      invoices: ['create', 'read', 'update'],
      budgets: ['create', 'read', 'update']
    },
    staff: {
      customers: ['read'],
      vendors: ['read'],
      projects: ['read'],
      tasks: ['create', 'read', 'update'],
      proposals: ['read'],
      quotations: ['read'],
      invoices: ['read'],
      budgets: ['read']
    },
    customer: {
      projects: ['read'],
      tasks: ['read'],
      proposals: ['read'],
      quotations: ['read'],
      invoices: ['read']
    },
    vendor: {
      projects: ['read'],
      tasks: ['read'],
      proposals: ['read'],
      quotations: ['read']
    }
  };

  const rolePermissions = permissions[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  checkPermission
}; 