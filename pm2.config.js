module.exports = {
  apps: [
    {
      name: "express-server",
      script: "server.js", // your main server file
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 5000,
      },
    },
  ],
};
