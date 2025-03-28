const { User, Kyc } = require("../../db/index");
const path = require("path");
const crypto = require("crypto");
const ejs = require("ejs");
const sharp = require("sharp");
const fs = require("fs");
const { Op } = require("sequelize");
const transporter = require("../../utils/emailTransport");
const {
  appName,
  appEmail,
  appWebsite,
  apiUrl,
} = require("../../config/config");

exports.addKYC = async (req, res) => {
  let success = false;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    if (req.files["poi"]) {
      fs.unlink(req.files["poi"][0].path, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    if (req.files["poa"]) {
      fs.unlink(req.files["poa"][0].path, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    return res.status(400).send({
      status: 400,
      success,
      message:
        error?.errors.length > 1
          ? error?.errors[1]["msg"]
          : error?.errors[0]["msg"],
    });
  }
  console.log(req.body);
  try {
    // const { poiexpiredate, poaexpiredate } = req.body;
    let userdata = await User.findOne({
      where: {
        id: req.user.id,
      },
      raw: true,
    });
    if (req.files["poi"]) {
      // Storing files in variable
      let poi = req.files["poi"][0];
      // Giving Uniquenames
      const poiUniquename =
        crypto.randomBytes(5).toString("hex") +
        (new Date().getTime() / 1000).toFixed(0).toString() +
        "_" +
        req.user.id +
        path.extname(poi.originalname);
      // Compressing and removing the original File from the directory
      let poiCompress = await sharp(poi.path)
        .jpeg({ progressive: true, force: false, quality: 60 })
        .png({ progressive: true, force: false, quality: 60 })
        .toFile(poi.destination + "/" + poiUniquename);
      fs.unlink(poi.path, (err) => {
        if (err) {
          console.log(err);
        }
      });
      // Creating the KYC in DB
      await Kyc.create({
        user_id: req.user.id,
        filename: poiUniquename,
        docType: "poi",
        // expiry_date: poiexpiredate,
        status: 0,
        extension: poiCompress.format,
      });
    }

    if (req.files["poa"]) {
      // Storing files in variable
      let poa = req.files["poa"][0];

      // Giving Uniquenames
      const poaUniquename =
        crypto.randomBytes(5).toString("hex") +
        (new Date().getTime() / 1000).toFixed(0).toString() +
        "_" +
        req.user.id +
        path.extname(poa.originalname);

      // Compressing and removing the original File from the directory
      let poaCompress = await sharp(poa.path)
        .jpeg({ progressive: true, force: false, quality: 60 })
        .png({ progressive: true, force: false, quality: 60 })
        .toFile(poa.destination + "/" + poaUniquename);
      fs.unlink(poa.path, (err) => {
        if (err) {
          console.log(err);
        }
      });

      // Creating the KYC in DB
      await Kyc.create({
        user_id: req.user.id,
        filename: poaUniquename,
        docType: "poa",
        status: 0,
        // expiry_date: poaexpiredate,
        extension: poaCompress.format,
      });
    }

    await User.update(
      {
        kyc_verified: 0,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    const template = await ejs.renderFile(
      path.join(
         __dirname + "../" + "../" + "../" + "public/views/useremail/Kyc/addkyc.ejs"
      ),
      {
        appname: appName,
        appweblink: appWebsite,
        logo: `${apiUrl}/images/systemsettingsUploads/emaillogo.png`,
      }
    );
     
    const mailData = {
      from: `${appName} <${appEmail}>`,
      to: userdata.email,
      subject: `${appName} - KYC Upload Success`,
      html: template,
    };

    await transporter.sendMail(mailData);

    success = true;
    return res.status(200).send({
      status: 200,
      success,
      message: "KYC Uploaded successfully.",
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal Server Error.",
    });
  }
};
// check kyc 
exports.checkKYC = async (req, res) => {
  let success = false;
  try {
    const kyc = await Kyc.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (kyc) {
      if (kyc.status === 1) {
        success = true;
        return res.status(200).send({
          status: 200,
          success,
          message: "KYC Verified.",
        });
      } else {
        return res.status(200).send({
          status: 200,
          success,
          message: "KYC Pending.",
        });
      }
    } else {
      return res.status(200).send({
        status: 200,
        success,
        message: "KYC Pending.",
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal Server Error.",
    });
  }
};
//get all kyc 
exports.getAllKYC = async (req, res) => {
  let success = false;
  try {
    const kyc = await Kyc.findAll({
      where: {
        user_id: req.user.id,
        status: {
          [Op.or]: [0, 1],
        },
      },
    });

    if (kyc) {
      success = true;
      return res.status(200).send({
        status: 200,
        success,
        kyc,
      });
    } else {
      return res.status(200).send({
        status: 200,
        success,
        message: "KYC Not Found.",
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal Server Error.",
    });
  }
};

