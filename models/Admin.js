const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Admin = sequelize.define(
    "Admin",
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
    //   admin_type: DataTypes.STRING,
    //   super_admin: DataTypes.INTEGER,
      // upassword: DataTypes.STRING,
    },
    {
      timestamps: true,
    }
  );

  return Admin;
};
