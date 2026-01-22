module.exports = {
  apps: [
    {
      name: "recruter-test-nextjs",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3004",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      env_file: ".env.production",
      env: {
        NODE_ENV: "production",
        PORT: 3004,
      },
      error_file: "/home/issouf/.pm2/logs/recruter-test-nextjs-error.log",
      out_file: "/home/issouf/.pm2/logs/recruter-test-nextjs-out.log",
      log_file: "/home/issouf/.pm2/logs/recruter-test-nextjs-combined.log",
      time: true,
      cwd: "/home/issouf/apps/recruter20-test",
    },
  ],
};
