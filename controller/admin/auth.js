const { Admin } = require("../../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/config");

exports.adminLogin= async (req,res) =>{
    let success=false;

    let error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(403).send({
        status: 403,
        message: error?.errors[0]["msg"],
      });
    }
  
    try{
        const {email,password}=req.body;
        const admin=await Admin.findOne({where:{email}});
        if(!admin){
            return res.status(400).json({error:"Admin not found"});
        }
       
        let checkPassword = await bcrypt.compare(password, admin.password);
        if (!checkPassword) {
            return res.status(400).send(
                {
                    status: 400,
                    success,
                    message: "Invalid Password.",
                }
            )
        }
        const token = jwt.sign({ id: admin.id, email: admin.email }, jwtSecret);
        success=true;
        return res.status(200).send({
            status: 200,
            success,
            token
        })
    }catch(error){
        return res.status(400).send({
            status: 400,
            success,
            message: error?.errors[0]["msg"],
        });
    }

}

