# VPS Deployment Guide

This guide will help you deploy your BoltAPP Workflow Management application to your VPS server.

## 🚀 Prerequisites

- A VPS server with Ubuntu/Debian
- SSH access to your VPS
- Domain name (optional but recommended)

## 📋 Step-by-Step Deployment

### 1. **Connect to Your VPS**
```bash
ssh root@your-vps-ip
```

### 2. **Install Required Software**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y

# Install PM2 globally
sudo npm install -g pm2

# Verify installations
node --version
npm --version
git --version
pm2 --version
```

### 3. **Clone Your Repository**
```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git
cd -boltAPPworkmgmt_V1.1
```

### 4. **Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 5. **Initialize Database**
```bash
# Initialize the database
node scripts/initDb.js
```

### 6. **Build Frontend**
```bash
# Build the React application
npm run build
```

### 7. **Start with PM2**
```bash
# Start the application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 8. **Configure Nginx (Optional but Recommended)**

Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/boltapp
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend
    location / {
        root /var/www/-boltAPPworkmgmt_V1.1/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/boltapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. **Setup SSL with Let's Encrypt (Optional)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 🔄 **Deployment Updates**

To update your application:

### **Option 1: Manual Update**
```bash
cd /var/www/-boltAPPworkmgmt_V1.1
git pull origin main
npm install
cd server && npm install && cd ..
node scripts/initDb.js
npm run build
pm2 restart all
```

### **Option 2: Using Deployment Script**
```bash
cd /var/www/-boltAPPworkmgmt_V1.1
chmod +x deploy.sh
./deploy.sh
```

## 📊 **Monitoring**

### **Check Application Status**
```bash
pm2 status
pm2 logs
pm2 monit
```

### **Check Nginx Status**
```bash
sudo systemctl status nginx
sudo nginx -t
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Port 3001 already in use:**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

2. **Permission issues:**
   ```bash
   sudo chown -R $USER:$USER /var/www/-boltAPPworkmgmt_V1.1
   ```

3. **Database issues:**
   ```bash
   rm -f data/workflow.db
   node scripts/initDb.js
   ```

4. **PM2 issues:**
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js --env production
   ```

## 🌐 **Access Your Application**

- **Without domain:** `http://your-vps-ip:3001`
- **With domain:** `https://your-domain.com`

## 📝 **Default Login Credentials**

- **Email:** admin@smartuniit.com
- **Password:** admin123

## 🔒 **Security Recommendations**

1. **Change default admin password** after first login
2. **Setup firewall:**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```
3. **Regular updates:**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

## 📞 **Support**

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system logs: `sudo journalctl -u nginx`

---

**Your BoltAPP Workflow Management application is now deployed and ready to use!** 🎉 