module.exports = {
  NODE_ENV: process.env.NODE_ENV,

  isDevelopmentEnv: process.env.NODE_ENV === "development",

  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,

  DB_URI: process.env.DB_URI,

  NODEMAILER: {
    USER: process.env.MAIL_USER,
    PASSWORD: process.env.MAIL_PASSWORD
  },

  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || "test-node-app",
};