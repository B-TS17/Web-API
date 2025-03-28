const { User } = require("../../db");
const bcrypt = require("bcrypt");
const { decode, encode } = require("js-base64");
const ejs = require("ejs");
const path = require("path");
const transporter = require("../../utils/emailTransport");
const { encodeCipher, decodeCipher } = require("../../utils/cryptoCipher");
const {
  appEmail,
  appWebsite,
  appName,
  apiUrl,
  jwtSecret,
} = require("../../config/config");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  let success = false;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(403).send({
      status: 403,
      success,
      message: error?.errors[1]
        ? error?.errors[1]["msg"]
        : error?.errors[0]["msg"],
    });
  }
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(password, salt);
    const upassword = encode(password);

    const user = await User.create({
      name,
      email,
      password: hash,
      upassword,
      emailverify: 0,
       
    });
    let encodedToken = encodeCipher(
      user.name + "-" + user.email + "-" + user.id
    );

    const template = await ejs.renderFile(
      path.join(
        __dirname + "../" + "../" + "../" + "public/views/useremail/emailverify.ejs"
      ),
      {
        verifylink: `${appWebsite}verifyEmail/${encodedToken}`,
        appname: appName,
        appweblink: appWebsite,
        logo: `${apiUrl}/images/systemsettingsUploads/emaillogo.png`,
      }
    );

    const mailData = {
      from: `${appName} <${appEmail}>`,
      to: email,
      subject: `Welcome - Account with ${appName}`,
      text: "Welcome to CRM.",
      html: template,
    };

    // Email Send
    await transporter.sendMail(mailData);

    return res.status(200).send({
      status: 200,
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
exports.verifyuser = async (req, res) => {
  try {
    const { token } = req.params;
    const decodedToken = decodeCipher(token);
    const [name, email, id] = decodedToken.split("-");
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (user.emailverify == 1) {
      return res.status(400).json({ error: "Email already verified" });
    }
    await User.update({ emailverify: 1 }, { where: { id } });
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.loginuser = async (req, res) => {
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
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    
    if (user.emailverify === 0) {
      return res.status(400).send({
        status: 400,
        success,
        message: "Login not verified.",
      });
    }

    if (user.emailverify === 2) {
      return res.status(400).send({
        status: 400,
        success,
        message: "User is blocked.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return red.status(400).send(
        {
          status: 400,
          success,
          message: "Invalid Password",
        }
      )
    }
    let data = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    let token = jwt.sign(data, jwtSecret, { expiresIn: "1h" });
    success = true;
    return res.status(200).send({
      status: 200,
      success ,
      message: "Login success",
      data:{
        token
      }
    }); 
  } catch (error) {
    return res.status(400).send({
      status: 400,
      success: false,
      message: error.message

    })
  }
};
