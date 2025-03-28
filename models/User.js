const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "User",
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      upassword: DataTypes.STRING,
      emailverify: DataTypes.INTEGER,
      kyc_verified: DataTypes.INTEGER,  
      forgetPasswordToken : DataTypes.STRING,
    },
    {
      timestamps: true,
    }
  );

  return User;
};
