const { User } = require("../../db");
const ejs = require("ejs");
const path = require("path");
const transporter = require("../../utils/emailTransport");
const { encodeCipher, decodeCipher } = require("../../utils/cryptoCipher");


const bcrypt = require("bcrypt");
const { decode, encode } = require("js-base64");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { QueryTypes, Op } = require("sequelize");
const {
    appName,
    frontendUrl,
    appEmail,
    appWebsite,
    mt5Url,
    mt5AuthToken,
    apiUrl,
  } = require("../../config/config");
//get user
exports.getuser = async (req, res) => {
  let success = false;
  try {
    const user = await User.findOne({
      where: { id: req.user.id, email: req.user.email },
      attributes: { exclude: ["password", "upassword", "forgetPasswordToken"] },
    });
    if (!user) {
      return res.status(400).send({
        status: 400,
        success,
        message: "User not found.",
      });
    }
    res.status(200).send({
      status: 200,
      success,
      data: user,
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      success,
      message: "Internal server error.",
    });
  }
};
//update user profile
exports.updateuser = async (req, res) => {
  let success = false;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(403).send({
      status: 403,
      success,
      message: error?.errors[0]["msg"],
    });
  }
  try {
    const user = await User.findOne({
      where: { id: req.user.id, email: req.user.email },
    });
    if (!user) {
      return res.status(404).send({
        status: 404,
        success,
        message: "User not found.",
      });
    }
    const { email, name } = req.body;
    user.name = name;
    user.email = email;
    await User.update(
      { name, email },
      { where: { id: req.user.id, email: req.user.email } }
    );
    const template = await ejs.renderFile(
      path.join(
        __dirname +
          "../" +
          "../" +
          "../" +
          "public/views/useremail/user/updateUser.ejs"
      ),
      {
        appname: appName,
        appweblink: appWebsite,
        logo: `${apiUrl}/images/systemsettingsUploads/emaillogo.png`,
      }
    );

    const mailData = {
      from: `${appName} <${appEmail}>`,
      to: user.email,
      subject: `${appName} - User Updated Success Message`,
      text: ``,
      html: template,
    };

    transporter.sendMail(mailData, (error) => {
      success = true;
      return res.status(200).send({
        status: 200,
        success,
        message: "User Updated Successfully.",
      });
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
  }
};
//change user password
exports.changepassword = async (req, res) => {
  
  let success = false;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(403).send({
      status: 403,
      success,
      message: error?.errors[0]["msg"],
    });
  }
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findOne({
      where: { id: req.user.id, email: req.user.email },
    });
    if (!user) {
      return res.status(404).send({
        status: 404,
        success,
        message: "User not found.",
      });
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({
        status: 400,
        success,
        message: "Invalid old password.",
      });
    }
    if (oldPassword === newPassword) {
      return res.status(400).send({
        status: 400,
        success,
        message: "New password cannot be same as old password.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const securepassword = await bcrypt.hash(newPassword, salt);
    const upassword = encode(newPassword);
    User.update(
      { password: securepassword, upassword },
      { where: { id: req.user.id, email: req.user.email } }
    );
    const template = await ejs.renderFile(
      path.join(
        __dirname +
          "../" +
          "../" +
          "../" +
          "public/views/useremail/user/changepassword.ejs"
      ),
      {
        appname: appName,
        appweblink: appWebsite,
        logo: `${apiUrl}/images/systemsettingsUploads/emaillogo.png`,
      }
    );

    const mailData = {
      from: `${appName} <${appEmail}>`,
      to: user.email,
      subject: `${appName} - User Password Change Success Message`,
      text: ``,
      html: template,
    };

    transporter.sendMail(mailData, (error) => {
      success = true;
      return res.status(200).send({
        status: 200,
        success,
        message: "User Password changed Successfully.",
      });
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
  }
};
// Forget Password Send Email
exports.forgetPassword = async (req, res) => {
  let success = false;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(403).send({
      status: 403,
      success,
      message: error?.errors[0]["msg"],
    });
  }
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({
        status: 404,
        success,
        message: "User not found.",
      });
    }
    const token = crypto.randomBytes(20).toString("hex");
    let checkUserToken = await User.findOne({
      where: {
        forgetPasswordToken: token,
      },
    });

    if (checkUserToken) {
      token = token + crypto.randomBytes(3).toString("hex");
    }
    const template = await ejs.renderFile(
      path.join(
        __dirname +
          "../" +
          "../" +
          "../" +
          "public/views/useremail/user/forgetpassword.ejs"
      ),
      {
        tokenlink: `${frontendUrl}newPassword/${token}`,
        appname: appName,
        appweblink: appWebsite,
        logo: `${apiUrl}/images/systemsettingsUploads/emaillogo.png`,
      }
    );

    const mailData = {
      from: `${appName} <${appEmail}>`,
      to: user.email,
      subject: `${appName} - Forget Password`,
      text: "Enter your New Password.",
      html: template,
    };

    // Emaile Sender
    await transporter.sendMail(mailData);

    success = true;
    await User.update(
      {
        forgetPasswordToken: token,
      },
      {
        where: {
          email,
        },
      }
    );
    return res.status(200).send({
      status: 200,
      success,
      message: "Forget Password Mail successfully sent.",
    });
  } catch (err) {
    return res.status(500).send({
      err : err,
      status: 500,
      success,
      message: "Internal Server Error.",
    });
  }
};
// Forget Password and Set a New Password
exports.newPassword = async (req, res) => {
  let success = false;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(403).send({
      status: 403,
      success,
      message: error?.errors[0]["msg"],
    });
  }
  try {
    const {password } = req.body;
    const {token} = req.params;
    if(!token){
      return res.status(400).send({
        status: 400,
        success,
        message: "forgot password token not found.",
      });
    }
    const user = await User.findOne({
      where: {
        forgetPasswordToken: token,
      },
    });
    if (!user) {
      return res.status(404).send({
        status: 404,
        success,
        message: "Invalid Token for Forget Password.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const securepassword = await bcrypt.hash(password, salt);
    const upassword = encode(password);
    await User.update(
      { password: securepassword, upassword, forgetPasswordToken: null, },
      { where: { id: user.id, email: user.email } }
    );
    const template = await ejs.renderFile(
        path.join(
          __dirname +
            "../" +
            "../" +
            "../" +
            "public/views/useremail/user/forgetpasswordSuccess.ejs"
        ),
        {
          frontUrl: `${frontendUrl}`,
          appname: appName,
          appweblink: appWebsite,
          logo: `${apiUrl}/images/systemsettingsUploads/emaillogo.png`,
        }
      );
  
      const mailData = {
        from: `${appName} <${appEmail}>`,
        to: user.email,
        subject: `${appName} - Reset Password Success Message`,
        text: "",
        html: template,
      };
  
      // Email Sender
      transporter.sendMail(mailData);
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      message: "User Password changed Successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
  }
};