const multer = require("multer");
const path = require("path");
const { User,Kyc} = require("../db/index");
const { Op } = require("sequelize");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,path.resolve(__dirname + "../" + "../" + "public/images/kycUploads"));
    }
    ,
    filename: function (req, file, cb) {
        const uniquename = new Date().getTime() + path.extname(file.originalname);
        cb(null, uniquename);
    }
    });
    
    const upload = multer({
        storage,
        limits: { fieldSize: 1000000 * 10 },
        fileFilter: async (req, file, cb) => {
          let err = {
            message: "",
            name: "",
          };
      
          let kyc = [];
          let user = {};
      
          if (req.user) {
            kyc = await Kyc.findAll({
              where: {
                user_id: req.user.id,
                status: {
                  [Op.or]: [0, 1],
                },
              },
            });
            user = await User.findOne({
              where: {
                kyc_verified: 1,
                id: req.user.id,
              },
            });
          } else {
            kyc = await Kyc.findAll({
              where: {
                user_id: req.body.userId,
                status: {
                  [Op.or]: [0, 1],
                },
              },
            });
            user = await User.findOne({
              where: {
                kyc_verified: 1,
                id: req.body.userId,
              },
            });
          }
      
          if (user) {
            err.name = "";
            err.message = "KYC already Approved.";
            cb(err);
          }
      
          // Check for the KYC
          if (kyc.length === 2) {
            err.name = "";
            err.message = "KYC already exists.";
            cb(err);
          }
      
          if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
          ) {
            cb(null, true);
          } else {
            err.message = "Only .png, .jpg and .jpeg format allowed!";
            err.name = "ExtensionError";
            cb(err);
          }
        },
      }).fields([
        {
          name: "poi",
          maxCount: 1,
        },
        {
          name: "poa",
          maxCount: 1,
        },
      ]);    




      exports.uploadKyc = async (req, res, next) => {
        let success = false;
      
        try {
          upload(req, res, (err) => {
            if (!req.files) {
              return res.status(404).send({
                status: 404,
                success,
                message: "Files not found.",
              });
            }
      
            if (err) {
              return res.status(400).send({
                status: 400,
                success,
                message: err.message,
              });
            }
      
            if (!req.files["poi"] && !req.files["poa"]) {
              return res.status(400).send({
                status: 400,
                success,
                message: "No POI and POA files were given.",
              });
            }
            
            next();
          });
        } catch (err) {
          return res.status(500).send({
            status: 500,
            success,
            message: "Internal Server Error.",
          });
        }
      };
      