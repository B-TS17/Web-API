const { decode, encode } = require("js-base64");
const { Admin } = require("../../db");
const bcrypt = require("bcrypt");
const { name } = require("ejs");
const { validationResult } = require("express-validator");
exports.createAdmin = async (req, res) => {
  let success = false;
  let error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).send({
      status: 400,
      message:
        error?.errors.length > 1
          ? error.errors[1]["msg"]
          : error.errors[0]["msg"],
    });
  }
  try {
    const { name, email, password } = req.body;
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(password, salt);
 

    const admin = await Admin.create({
      name,
      email,
      password: hash,
      // admin_type,
      // super_admin,
     
    });
    return res.status(200).send({
      status: 200,
      success,
      data: admin,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//get admin
exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { id: req.admin.id },
      attributes: { exclude: ["password"] },
    });

    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }

    res.status(200).json({ admin });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
//update admin
exports.updateAdmin = async (req, res) => {
  let success = false;
  let error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).send({
      status: 400,
      message:
        error?.errors.length > 1
          ? error.errors[1]["msg"]
          : error.errors[0]["msg"],
    });
  }
  let admin = Admin.findOne({ where: { id: req.admin.id } });
  if (!admin) {
    return res.status(400).json({ error: "Admin not found" });
  }
  try{
  const { name, email } = req.body;
  console.log(name);
  admin = Admin.update({ name, email }, { where: { id: req.admin.id } });
  success = true;
  if(admin){

      return res.status(200).send({
        status: 200,
        success,
        message: "Admin updated successfully.",
      });
  }
  }catch(err){
    return res.status(400).send({
        status: 400,
        success,
        message: err.message,
    })
  }

};
//change password
exports.changePassword = async (req, res) => {
  let success=false;

  let error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).send({
      status: 400,
      message:
        error?.errors.length > 1
          ? error.errors[1]["msg"]
          : error.errors[0]["msg"],
    });
  }
    try{
        const { oldPassword, newPassword } = req.body;
        const admin = await Admin.findOne({ where: { id: req.admin.id } });
        if (!admin) {
            return res.status(400).send({
                status: 400,
                success,
                message: "Admin not found.",
            })
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
        if (!isPasswordValid) {
            return res.status(400).send({
                status: 400,
                success,
                message: "Invalid old password.",
            })
        }
        if(oldPassword === newPassword){
            return res.status(400).send({
                status: 400,
                success,
                message: "New password cannot be same as old password.",
            })
        }
        const salt = await bcrypt.genSaltSync(10);
        const hash = await bcrypt.hashSync(newPassword, salt);
        await Admin.update({ password: hash }, { where: { id: req.admin.id } });
        success=true;
        return res.status(200).send({
            status: 200,
            success,
            message: "Password changed successfully.",
        });
    }catch(error){
        return res.status(400).send({
            status: 400,
            success,
            message: error.message,
        });
    }
}
 //get all admins
 exports.getalladmins = async (req, res) => {
  let success = false;
    try {
      let allAdmin = await Admin.findAll( {raw:true});
      
   
    success=true;

    return res.status(200).send({
      status:200,
      success,
      data:allAdmin

    })
  }
  catch{
    return res.status(500).send({
      status: 500,
      success,
      message: "Internal Server Error.",
    });
  }
}
//

  





        