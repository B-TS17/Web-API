const { User } = require("../../db");
const bcrypt = require("bcrypt");
const { decode, encode } = require("js-base64");
const ejs = require("ejs");
const path = require("path");
const transporter = require("../../utils/emailTransport");
const {
  appEmail,
  appWebsite,
  appName,
  apiUrl,
  jwtSecret,
} = require("../../config/config");
const { Op, QueryTypes } = require("sequelize");


//get all user
exports.getalluser = async (req, res) => {
  let success = false;
  try {
    let allUser = await User.findAll({ raw: true });
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      data: allUser,
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal Server Error.",
    });
  }
};
//get single user
exports.getsingleuser = async (req, res) => {
  let success = false;
  try {
    const { id } = req.params;
    let user = await User.findOne({
      where: {
        id,
      },
      attributes: { exclude: ["password", "upassword", "forgetPasswordToken"] },
    });
    if (!user) {
      return res.status(404).send({
        status: 404,
        success,
        message: "User not found.",
      });
    }
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server error.",
    });
  }
};
//create user
exports.createuserbyadmin = async (req, res) => {
  let success = false;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(403).send({
      status: 403,
      success,
      message: error?.errors[0]["msg"]
        ? error?.errors[0]["msg"]
        : error?.errors[1]["msg"],
    });
  }

  try {
    const { name, password, email } = req.body;
    console.log(name, password, email);
    let user = await User.findOne({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(400).send({
        status: 400,
        success,
        message: "User with this email already exists.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hash,
      upassword: encode(password),
      emailverify: 0,
    });

    const template = await ejs.renderFile(
      path.join(
        __dirname +
          "../" +
          "../" +
          "../" +
          "public/views/adminemail/user/userbyadmin.ejs"
      ),
      {
        username: user.name,
        email,
        password,
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
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      message: "User Successfully created.",
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error",
    });
  }
};
//verify user
exports.verifyuserByAdmin = async (req, res) => {
  let success = false;
  try {
    const { id } = req.params;
    console.log(id);
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).send({
        status: 404,
        success,
        message: "User not found.",
      });
    }
    user.emailverify = 1;
    await user.save();
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      message: "User Successfully verified.",
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
  }
};
//user update
exports.updateuserbyadmin = async (req, res) => {
  let success = false;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(403).send({
      status: 403,
      success,
      message: error?.errors[1]["msg"]
        ? error?.errors[1]["msg"]
        : error?.errors[0]["msg"],
    });
  }
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).send({
        status: 404,
        success,
        message: "User not found.",
      });
    }
    const { name, email } = req.body;
    user.name = name;
    user.email = email;
    await user.save();
    const template = await ejs.renderFile(
      path.join(
        __dirname +
          "../" +
          "../" +
          "../" +
          "public/views/adminemail/user/userupdatebyadmin.ejs"
      ),
      {
        username: name,
        email,
        appname: appName,
        appweblink: appWebsite,
        logo: `${apiUrl}/images/systemsettingsUploads/emaillogo.png`,
      }
    );
    const mailData = {
      from: `${appName} <${appEmail}>`,
      to: email,
      subject: `${appName} - User Update by Admin`,
      text: "Welcome to CRM.",
      html: template,
    };
    await transporter.sendMail(mailData);
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      message: "User Successfully updated.",
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
  }
};
//delete user
exports.deleteuserbyadmin = async (req, res) => {
  let success = false;
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).send({
        status: 404,
        success,
        message: "User not found.",
      });
    }
    await user.destroy();
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      message: "User Successfully deleted.",
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
  }
}
//user password list 
exports.alluserpasswordlist = async (req, res) => {
  let success = false;
  try {
    const user = await User.findAll({
      attributes: ["id", "name", "email", "upassword"],
      order:[["createdAt", "DESC"]],
      raw: true,
  });
     for (let i = 0; i < user.length; i++) {
      user[i].upassword = decode(user[i].upassword);
    }
     
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      user,
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
  }
}
//change password
exports.changePasswordbyadmin = async (req, res) => {
  let success = false;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(403).send({
      status: 403,
      success,
      message: error?.errors[0]["msg"]
        ? error?.errors[0]["msg"]
        : error?.errors[1]["msg"],
    });
  }

  try {
    const {userId, password} = req.body;
    const user = await User.findOne({where:{id: userId}});
    if(!user){
      return res.status(404).send({
        status: 404,
        success,
        message: "User not found.",
      });
    }
      const salt = bcrypt.genSaltSync(10);
      const securepassword = await bcrypt.hash(password, salt);
      user.password = securepassword;
      user.upassword = encode(password);
      await user.save();
      success = true;
      return res.status(200).send({
        status: 200,
        success,
        message: "Password Successfully changed.",
      });
    }
    
   catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
    
  }
}
//search user
exports.searchuser = async (req,res) => {
   let success = false;
   try {
    const {name ,email} = req.query;
    let user ="";
    if(name){
      user = await User.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`,
          },
        },

      });

    }

    if(email){
      user = await User.findAll({
        where: {
          email: {
            [Op.like]: `%${email}%`,
          },
        },
      })
    }
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      data: user,
    });
    
   } catch (error) {
    
   }
}
//filter
exports.filterUser = async (req,res) =>{
  let success = false;
  try {
    const {emailverify} = req.query;
    let user = "";
    if(emailverify){
      user = await User.findAll({
        where: {
          emailverify: {
            [Op.like]: `%${emailverify}%`,}
        },
      });
    }
    success = true;
    return res.status(200).send({
      status: 200,
      success,
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal server Error.",
    });
    
  }
}