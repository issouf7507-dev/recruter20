module.exports = {
  apps: [
    {
      name: "recruter-nextjs",
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
      error_file: "/home/issouf/.pm2/logs/recruter-nextjs-error.log",
      out_file: "/home/issouf/.pm2/logs/recruter-nextjs-out.log",
      log_file: "/home/issouf/.pm2/logs/recruter-nextjs-combined.log",
      time: true,
      cwd: "/home/issouf/apps/recruter20",
    },
    {
      name: "recruter-socket",
      script: "dist/server/socket.js",
      // Alternative si compilation échoue: utiliser "node_modules/.bin/tsx server/socket.ts"
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "256M",
      env_file: ".env.production",
      env: {
        NODE_ENV: "production",
        SOCKET_PORT: 3001,
      },
      error_file: "/home/issouf/.pm2/logs/recruter-socket-error.log",
      out_file: "/home/issouf/.pm2/logs/recruter-socket-out.log",
      log_file: "/home/issouf/.pm2/logs/recruter-socket-combined.log",
      time: true,
      cwd: "/home/issouf/apps/recruter20",
    },
  ],
};
