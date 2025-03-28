const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Kyc = sequelize.define("Kyc", {
    user_id: DataTypes.INTEGER,
    filename: DataTypes.STRING,
    docType: DataTypes.STRING,
    status: DataTypes.INTEGER,
    expiry_date: DataTypes.DATE,
    extension: DataTypes.STRING,
    adminid: DataTypes.INTEGER
  });

  return Kyc;
};
