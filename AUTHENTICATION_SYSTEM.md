# 🔐 Authentication & User Management System

## 📋 **Overview**

The SmartUniit Task Flow application includes a comprehensive authentication and user management system with role-based access control (RBAC). This system provides secure user authentication, user management, and granular permissions for different modules.

## 🏗️ **System Architecture**

### **Backend Components**
- **Authentication Routes** (`server/routes/auth.js`)
- **User Management Routes** (`server/routes/users.js`)
- **Authentication Middleware** (`server/middleware/auth.js`)
- **Database Schema** (SQLite with users table)

### **Frontend Components**
- **Authentication Context** (`src/contexts/AuthContext.tsx`)
- **User Management Page** (`src/pages/Users.tsx`)
- **Permission System** (`src/lib/permissions.ts`)
- **API Service** (`src/lib/api.ts`)

## 👥 **User Roles & Permissions**

### **Role Hierarchy**
1. **Super Admin** - Full system access
2. **Admin** - Administrative access
3. **Manager** - Management access
4. **Staff** - Staff access
5. **Customer** - Customer access
6. **Vendor** - Vendor access

### **Permission Matrix**

| Module | Super Admin | Admin | Manager | Staff | Customer | Vendor |
|--------|-------------|-------|---------|-------|----------|--------|
| **Users** | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Vendors** | ✅ Full | ✅ Full | ✅ Read | ✅ Read | ❌ | ❌ |
| **Customers** | ✅ Full | ✅ Full | ✅ Full | ✅ Read | ❌ | ❌ |
| **Projects** | ✅ Full | ✅ Full | ✅ Full | ✅ Read | ✅ Read | ❌ |
| **Tasks** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ❌ | ❌ |
| **Proposals** | ✅ Full | ✅ Full | ✅ Full | ✅ Read | ✅ Read | ✅ Read |
| **Quotations** | ✅ Full | ✅ Full | ✅ Full | ✅ Read | ✅ Read | ✅ Full |
| **Invoices** | ✅ Full | ✅ Full | ✅ Full | ✅ Read | ✅ Read | ❌ |
| **Budgets** | ✅ Full | ✅ Full | ✅ Read | ✅ Read | ❌ | ❌ |
| **Delivery Notes** | ✅ Full | ✅ Full | ✅ Full | ❌ | ❌ | ❌ |

## 🔧 **API Endpoints**

### **Authentication Endpoints**
```
POST /api/auth/login          - User login
POST /api/auth/register       - User registration
GET  /api/auth/profile        - Get user profile
PUT  /api/auth/profile        - Update user profile
PUT  /api/auth/change-password - Change password
POST /api/auth/logout         - User logout
```

### **User Management Endpoints**
```
GET    /api/users             - Get all users (paginated)
GET    /api/users/:id         - Get user by ID
POST   /api/users             - Create new user
PUT    /api/users/:id         - Update user
DELETE /api/users/:id         - Delete user (soft delete)
POST   /api/users/:id/reset-password - Reset user password
GET    /api/users/stats/overview - Get user statistics
```

## 🛡️ **Security Features**

### **Authentication**
- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Token Expiration** - 7-day token validity
- **Secure Headers** - CORS and security headers

### **Authorization**
- **Role-Based Access Control** - Granular permissions per role
- **Permission Middleware** - Route-level protection
- **Resource Ownership** - Users can only access their own data where applicable

### **Data Protection**
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content Security Policy
- **CSRF Protection** - Token-based CSRF protection

## 📊 **User Management Features**

### **User Creation**
- **Form Validation** - Client and server-side validation
- **Email Notifications** - Welcome emails with credentials
- **Role Assignment** - Flexible role assignment
- **Status Management** - Active/Inactive status

### **User Management**
- **Search & Filter** - Search by name, email, phone
- **Role Filtering** - Filter by user role
- **Status Filtering** - Filter by user status
- **Pagination** - Efficient data loading

### **User Operations**
- **Edit User** - Update user information
- **Delete User** - Soft delete with status change
- **Password Reset** - Admin-initiated password reset
- **Role Management** - Change user roles

## 🎨 **User Interface**

### **User Management Dashboard**
- **Statistics Cards** - User counts and role distribution
- **User Table** - Comprehensive user listing
- **Action Buttons** - Edit, delete, reset password
- **Search & Filters** - Advanced filtering options

### **User Forms**
- **Create User Modal** - Complete user creation form
- **Edit User Modal** - User information editing
- **Validation** - Real-time form validation
- **Responsive Design** - Mobile-friendly interface

## 🔄 **Workflow Examples**

### **Creating a New User**
1. Admin navigates to Users page
2. Clicks "Add User" button
3. Fills out user creation form
4. System validates input data
5. User is created in database
6. Welcome email is sent to user
7. User appears in user list

### **User Authentication**
1. User visits login page
2. Enters email and password
3. System validates credentials
4. JWT token is generated
5. Token is stored in localStorage
6. User is redirected to dashboard
7. Token is used for API requests

### **Permission Check**
1. User attempts to access protected route
2. System checks user role
3. Permission middleware validates access
4. If authorized, access is granted
5. If unauthorized, access is denied
6. User sees appropriate error message

## 🚀 **Getting Started**

### **Default Admin Account**
```
Email: admin@example.com
Password: admin123
Role: admin
```

### **Creating Additional Users**
1. Log in as admin
2. Navigate to Users page
3. Click "Add User"
4. Fill required information
5. Assign appropriate role
6. User receives welcome email

### **Testing Permissions**
1. Create users with different roles
2. Log in as each user
3. Test access to different modules
4. Verify permission restrictions work

## 🔧 **Configuration**

### **Environment Variables**
```env
JWT_SECRET=your-secret-key-change-in-production
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
```

### **Database Schema**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  phone TEXT,
  department TEXT,
  avatar_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ **Customization**

### **Adding New Roles**
1. Update `ROLE_PERMISSIONS` in `permissions.ts`
2. Add role to user creation form
3. Update role colors in UI
4. Test permissions for new role

### **Adding New Permissions**
1. Add permission to `PERMISSIONS` object
2. Assign permission to roles in `ROLE_PERMISSIONS`
3. Update middleware to check new permission
4. Test permission enforcement

### **Customizing User Fields**
1. Update database schema
2. Modify API endpoints
3. Update frontend forms
4. Test data validation

## 🔍 **Troubleshooting**

### **Common Issues**
- **Login Fails** - Check email/password, user status
- **Permission Denied** - Verify user role and permissions
- **Token Expired** - User needs to log in again
- **Email Not Sent** - Check SMTP configuration

### **Debug Commands**
```bash
# Check user in database
sqlite3 data/smartuniit_taskflow.db "SELECT * FROM users WHERE email='user@example.com';"

# Test API endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Check JWT token
echo "your-jwt-token" | base64 -d | jq .
```

## 📈 **Future Enhancements**

### **Planned Features**
- **Two-Factor Authentication** - SMS/Email verification
- **Session Management** - Multiple device sessions
- **Audit Logging** - User action tracking
- **Bulk Operations** - Mass user management
- **Advanced Permissions** - Resource-level permissions
- **SSO Integration** - OAuth/OpenID Connect

### **Security Improvements**
- **Rate Limiting** - API request throttling
- **IP Whitelisting** - Restricted access by IP
- **Password Policies** - Complex password requirements
- **Account Lockout** - Failed login protection

---

**🎉 The authentication system is now fully functional and ready for production use!** 