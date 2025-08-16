#!/bin/bash

# Single Command Deployment
# Run this on your VPS

cd /var/www && if [ -d 'smartuniit-taskflow' ]; then cd smartuniit-taskflow && git pull origin main; else git clone https://github.com/shakeelmo/-boltAPPworkmgmt_V1.1.git smartuniit-taskflow && cd smartuniit-taskflow; fi && npm install && npm run build && cd server && npm install && cd .. && pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js && pm2 save && systemctl reload nginx && echo "✅ Deployment completed! Visit: http://work.smartuniit.com"
