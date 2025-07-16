# Business Workflow Management App

A comprehensive business workflow management application built with React, Node.js, and SQLite. This application helps businesses manage quotations, proposals, projects, tasks, customers, vendors, and invoices.

## 🚀 Features

### Core Modules
- **Quotations Management** - Create, edit, and export quotations
- **Proposals Management** - Professional proposal creation with PDF export
- **Project Management** - Track projects with progress, assignments, and deadlines
- **Task Management** - Assign tasks, track progress, and manage priorities
- **Customer Management** - Manage customer information with export functionality
- **Vendor Management** - Track vendors and their offerings
- **Invoice Management** - Generate and manage invoices

### Key Features
- **PDF Export** - Professional PDF generation for proposals and quotations
- **Excel Export** - Export customer and vendor data to Excel
- **User Authentication** - Secure login system with role-based access
- **Real-time Updates** - Live data updates across the application
- **Responsive Design** - Works on desktop and mobile devices
- **Database Persistence** - All data is stored in SQLite database

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **PDF Generation** - PDF creation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd boltAPPworkmgmt-main
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Initialize Database
```bash
node scripts/initDb.js
```

### 4. Start the Application

#### Start Backend Server
```bash
cd server
npm start
```
The backend will run on `http://localhost:3001`

#### Start Frontend Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## 🔧 Configuration

### Default Admin User
After running the database initialization script, you can log in with:
- **Email:** admin@smartuniit.com
- **Password:** admin123

### Environment Variables
Create a `.env` file in the root directory if needed:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
```

## 📁 Project Structure

```
boltAPPworkmgmt-main/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript type definitions
├── server/               # Backend source code
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── db.js            # Database configuration
├── scripts/              # Database scripts
├── data/                 # SQLite database files
└── public/              # Static assets
```

## 🚀 Usage

### Accessing the Application
1. Open your browser and navigate to `http://localhost:5173`
2. Log in with the default admin credentials
3. Start managing your business workflows!

### Key Workflows

#### Creating a Quotation
1. Navigate to Quotations
2. Click "Create New Quotation"
3. Fill in customer and product details
4. Save and export as PDF

#### Managing Projects
1. Go to Projects section
2. Create a new project
3. Assign team members
4. Track progress and deadlines

#### Customer Management
1. Add customers with contact information
2. Export customer data to Excel
3. Track customer interactions

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure password handling

## 📊 Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `customers` - Customer information
- `vendors` - Vendor details
- `quotations` - Quotation records
- `proposals` - Proposal data
- `projects` - Project management
- `tasks` - Task tracking
- `invoices` - Invoice records

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Updates and Maintenance

- Regular security updates
- Feature enhancements
- Bug fixes and performance improvements
- Database schema updates as needed

---

**Built with ❤️ for efficient business workflow management**
