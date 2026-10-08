module = {
  apps: [
    {
      name: 'astu-ams-api',
      script: 'dist/server.js',
      instances: 'max', // Scale to all available vCPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'astu-ams-worker',
      script: 'dist/server.js',
      instances: 2, // Dedicated background worker instances
      exec_mode: 'fork',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        IS_WORKER_ONLY: 'true',
      },
    },
  ],
};
