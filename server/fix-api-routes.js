const fs = require('fs');
const path = require('path');

// Fix budgets.js
const budgetsPath = path.join(__dirname, 'routes/budgets.js');
let budgetsContent = fs.readFileSync(budgetsPath, 'utf8');

// Remove projects join from budgets queries
budgetsContent = budgetsContent.replace(
  /SELECT b\.\*, p\.title as project_title, u\.name as created_by_name[\s\S]*?LEFT JOIN projects p ON b\.project_id = p\.id[\s\S]*?LEFT JOIN users u ON b\.created_by = u\.id/g,
  'SELECT b.*, u.name as created_by_name \n       FROM budgets b \n       LEFT JOIN users u ON b.created_by = u.id'
);

fs.writeFileSync(budgetsPath, budgetsContent);
console.log('✅ Fixed budgets.js');

// Fix invoices.js
const invoicesPath = path.join(__dirname, 'routes/invoices.js');
let invoicesContent = fs.readFileSync(invoicesPath, 'utf8');

// Remove projects join from invoices queries
invoicesContent = invoicesContent.replace(
  /SELECT i\.\*, c\.name as customer_name, p\.title as project_title, u\.name as created_by_name[\s\S]*?LEFT JOIN projects p ON i\.project_id = p\.id[\s\S]*?LEFT JOIN users u ON i\.created_by = u\.id/g,
  'SELECT i.*, c.name as customer_name, u.name as created_by_name \n       FROM invoices i \n       LEFT JOIN customers c ON i.customer_id = c.id \n       LEFT JOIN users u ON i.created_by = u.id'
);

fs.writeFileSync(invoicesPath, invoicesContent);
console.log('✅ Fixed invoices.js');

// Fix tasks.js
const tasksPath = path.join(__dirname, 'routes/tasks.js');
let tasksContent = fs.readFileSync(tasksPath, 'utf8');

// Remove projects join from tasks queries
tasksContent = tasksContent.replace(
  /SELECT t\.\*, p\.title as project_title, u\.name as assigned_to_name[\s\S]*?LEFT JOIN projects p ON t\.project_id = p\.id[\s\S]*?LEFT JOIN users u ON t\.assigned_to = u\.id/g,
  'SELECT t.*, u.name as assigned_to_name \n       FROM tasks t \n       LEFT JOIN users u ON t.assigned_to = u.id'
);

fs.writeFileSync(tasksPath, tasksContent);
console.log('✅ Fixed tasks.js');

console.log('🎉 All API routes fixed!'); 