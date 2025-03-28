const { User, Kyc } = require("../../db");

//All kyc 
exports.getalluserkycbyadmin = async (req, res) => {
    let success=false;
    try {
        const {type} = req.query;
        if (!type) {
            return res.status(200).send({
              status: 400,
              success,
              message: "Please add type in the query.",
            });
          }
          let users = [];
          if(type === "pending"){
           users = await User.findAll({
                where: {
                  kyc_verified: 0,
                },
                attributes:{  exclude: ["password", "upassword", "forgetPasswordToken"],}
              
            })
        }
        else if(type === "verified"){
          users = await User.findAll({
                where: {
                  kyc_verified: 1,
                },
                attributes:{  exclude: ["password", "upassword", "forgetPasswordToken"],}
            })
        }
        else if(type === "rejected"){
            users = await User.findAll({
                where: {
                  kyc_verified: 2,
                },
                attributes:{  exclude: ["password", "upassword", "forgetPasswordToken"],}
            })
        }
        success = true;
        return res.status(200).send({
            status:200,
            success,
            data: users,
        })
        
    } catch (error) {
        return res.statuas(500).send({
            status:500,
            success,
            message:"Internal server error."
        })
    }
}
//get single kyc
exports.getsingleuserkycbyadmin = async (req, res) => {
    let success = false;
    try {
        const { id } = req.params;
       let Kycs = await Kyc.findAll({
         where : {
           user_id : id
         }

           
       })
       if (!Kycs || Kycs.length === 0) {  
        return res.status(404).send({
            status: 404,
            success,
            message: "KYC not found.",
        });
    }
        success = true;
        return res.status(200).send({
            status: 200,
            success,
            data: Kycs,
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            success,
            message: "Internal server error.",
        });
    }
}   
 //add kyc
exports.addkycbyadmin = async (req, res) => {
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

    try {
        const {user_id} = req.body;
        // Check If POI is already Approved or is Pending
        if(req.files["poi"]){
            let poi = req.files["poi"][0];
            let kyc = await Kyc.findOne({
                where: {
                    user_id: user_id,
                    status: {
                        [Op.or]: [0, 1],
                    },
                    docType: "poi",
                },
            })
            if (kyc) {
                fs.unlink(poi.path, (err) => {
                    if (err) {
                      console.log(err);
                    }
                  });
                  return res.status(400).send({
                    status: 400,
                    success,
                    message: "POI Document already uploaded by User.",
                  });
            }
    
        }
        // Check If POA is already Approved or is Pending
        if(req.files["poa"]){
            let poa = req.files["poa"][0];
            let kyc = await Kyc.findOne({
                where: {
                    user_id: user_id,
                    status: {
                        [Op.or]: [0, 1],
                    },
                    docType: "poa",
                },
            })
            if (kyc) {
                fs.unlink(poa.path, (err) => {
                    if (err) {
                      console.log(err);
                    }
                  });
                  return res.status(400).send({
                    status: 400,
                    success,
                    message: "POA Document already uploaded by User.",
                  });
            }
    
        }
        if(req.files["poi"]){
            let poi = req.files["poi"][0];
            // Giving Uniquenames
      const poiUniquename =
      crypto.randomBytes(5).toString("hex") +
      (new Date().getTime() / 1000).toFixed(0).toString() +
      "_" +
      user_id +
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
    await Kyc.create({
        user_id: user_id,
        filename: poiUniquename,
        docType: "poi",
        // expire_date: poiexpiredate,
        status: 1,
        extension: poiCompress.format,
      });

      await AdminActivity.create({
        type: "document_upload_poi",
        ipAddress: req.headers["x-forwarded-for"],
        data: JSON.stringify({
          user_id: user_id,
          // expiry_date: poiexpiredate,
          filename: poiUniquename,
          docType: "poi",
          status: 1,
          extension: poiCompress.format,
        }),
        adminId: req.admin.id,
      });
    }

    // POA
    if (req.files["poa"]) {
      // Storing files in variable
      let poa = req.files["poa"][0];

      // Giving Uniquenames
      const poaUniquename =
        crypto.randomBytes(5).toString("hex") +
        (new Date().getTime() / 1000).toFixed(0).toString() +
        "_" +
        user_id +
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
        user_id: user_id,
        filename: poaUniquename,
        docType: "poa",
        // expiry_date: poaexpiredate,
        status: 1,
        extension: poaCompress.format,
      });
      let allKycApproved = await Kyc.findAll({
        where: {
          status: 1,
          user_id: user_id,
        },
      });
  
      if ((req.files["poi"] && req.files["poa"]) || allKycApproved.length === 2) {
        await User.update(
          {
            kyc_verified: 1,
          },
          {
            where: {
              id: user_id,
            },
          }
        );
      }
  
      let user = await User.findOne({
        where: {
          id: user_id,
        },
      });
      success = true;
      return res.status(200).send({
        status: 200,
        success,
        message: "KYC updated successfully.",
        data: user,
      });   
    }

    } catch (error) {
        return res.status(500).send({
            status: 500,
            success,
            message: "Internal server error.",
        });
    }
}
                 