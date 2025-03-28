const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const {
  emailHost,
  emailPort,
  emailUsername,
  emailPassword,
} = require("../config/config");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  auth: {
    user: emailUsername,
    pass: emailPassword,
  },
});

module.exports = transporter;
