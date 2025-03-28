const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT,
  cryptoSecret: process.env.CRYPTO_SECRET,
    jwtSecret: process.env.JWT_SECRET,

  // Email
  emailHost: process.env.EMAIL_HOST,
  emailUsername: process.env.EMAIL_USERNAME,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailPort: process.env.EMAIL_PORT,

  
  // APP Details
  appName: process.env.APP_NAME,
  appWebsite: process.env.APP_WEBSITE,
  appEmail: process.env.APP_EMAIL,
  frontendUrl: process.env.FRONTEND_URL,


  
};
