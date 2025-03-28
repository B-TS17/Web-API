const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");
const { User } = require("../db/index");

 

const checkUser = async (req, res, next) => {
  let success = false;

  try {
    let token = req.headers.authorization;
   
    if (!token) {
      return res.status(404).send({
        status: 404,
        success,
        message: "Token not found.",
      });
    }

    token = token.split(" ")[1];
    
    if (!token) {
      return res.status(401).send({
        status: 401,
        success,
        message: "Unauthorized Access",
      });
    }

    jwt.verify(token, jwtSecret, async (err, data) => {

      if (err) {
        return res.status(403).send({
          status: 403,
          success,
          message: "Forbidden Access.",
        });
      }

      let user = await User.findOne({
        where: {
          id: data.id,
          email: data.email,
        },
      });

      if (!user) {
        return res.status(403).send({
          status: 403,
          success,
          message: "Forbidden Access.",
        });
      }

      if (user?.login_verified === 0) {
        return res.status(400).send({
          status: 400,
          success,
          message: "Please verify your Email."
        })
      }

      if (user?.status === 2) {
        return res.status(400).send({
          status: 400,
          success,
          message: "User is blocked."
        })
      }

      success = true;
      req.user = data;
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

module.exports = checkUser;
