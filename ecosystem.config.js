module.exports = {
  apps: [
    {
      name: 'smartuniit-backend',
      script: './server/index.js',
      cwd: '/var/www/-boltAPPworkmgmt_V1.1',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}; 