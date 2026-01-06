module.exports = {
  apps: [
    {
      name: "recruter",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      env_file: ".env.production",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/dev-issouf/.pm2/logs/recruter-error.log",
      out_file: "/home/dev-issouf/.pm2/logs/recruter-out.log",
      log_file: "/home/dev-issouf/.pm2/logs/recruter-combined.log",
      time: true,
      cwd: "/home/dev-issouf/projects/recruteur20",
    },
  ],
};
