#!/usr/bin/expect -f

# Automated VPS Deployment Script
# VPS Details: 109.199.116.107
# Username: root
# Password: X9mK4LpZq7GtV2Fb

set timeout 30
set host "109.199.116.107"
set user "root"
set password "X9mK4LpZq7GtV2Fb"

# Connect to VPS
spawn ssh $user@$host

# Handle SSH connection
expect {
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$password\r"
    }
    "password:" {
        send "$password\r"
    }
}

# Wait for login
expect "#"

# Update system and install dependencies
send "apt update && apt upgrade -y\r"
expect "#"

send "apt install -y nodejs npm git nginx\r"
expect "#"

# Navigate to project directory
send "cd /var/www\r"
expect "#"

# Clone or pull the repository
send "if [ -d 'smartuniit-taskflow' ]; then cd smartuniit-taskflow && git pull origin main; else git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git smartuniit-taskflow && cd smartuniit-taskflow; fi\r"
expect "#"

# Install frontend dependencies and build
send "npm install\r"
expect "#"

send "npm run build\r"
expect "#"

# Install backend dependencies
send "cd server && npm install\r"
expect "#"

# Create PM2 ecosystem file
send "cd .. && cat > ecosystem.config.js << 'EOF'\nmodule.exports = {\n  apps: [{\n    name: 'smartuniit-backend',\n    script: './server/index.js',\n    cwd: '/var/www/smartuniit-taskflow',\n    instances: 1,\n    autorestart: true,\n    watch: false,\n    max_memory_restart: '1G',\n    env: {\n      NODE_ENV: 'production',\n      PORT: 3001\n    }\n  }]\n};\nEOF\r"
expect "#"

# Install PM2 globally
send "npm install -g pm2\r"
expect "#"

# Start the backend with PM2
send "pm2 start ecosystem.config.js\r"
expect "#"

send "pm2 save\r"
expect "#"

send "pm2 startup\r"
expect "#"

# Configure Nginx
send "cat > /etc/nginx/sites-available/smartuniit << 'EOF'\nserver {\n    listen 80;\n    server_name 109.199.116.107;\n    root /var/www/smartuniit-taskflow/dist;\n    index index.html;\n\n    location / {\n        try_files \$uri \$uri/ /index.html;\n    }\n\n    location /api {\n        proxy_pass http://localhost:3001;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade \$http_upgrade;\n        proxy_set_header Connection 'upgrade';\n        proxy_set_header Host \$host;\n        proxy_set_header X-Real-IP \$remote_addr;\n        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto \$scheme;\n        proxy_cache_bypass \$http_upgrade;\n    }\n}\nEOF\r"
expect "#"

# Enable the site
send "ln -sf /etc/nginx/sites-available/smartuniit /etc/nginx/sites-enabled/\r"
expect "#"

send "rm -f /etc/nginx/sites-enabled/default\r"
expect "#"

# Test and reload Nginx
send "nginx -t\r"
expect "#"

send "systemctl reload nginx\r"
expect "#"

# Show status
send "pm2 status\r"
expect "#"

send "systemctl status nginx\r"
expect "#"

send "echo 'Deployment completed successfully!'\r"
expect "#"

send "echo 'Frontend: http://109.199.116.107'\r"
expect "#"

send "echo 'Backend API: http://109.199.116.107/api'\r"
expect "#"

# Exit
send "exit\r"
expect eof
