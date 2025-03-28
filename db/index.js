const { Sequelize } = require("sequelize");
const {
  dbName,
  dbUsername,
  dbPassword,
  dbHost,
  dialect,
  dbPort,
} = require("./db.config");

const sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("DB Authentication Successful.");
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Admin = require("../models/Admin")(sequelize, Sequelize);
db.User =require("../models/User")(sequelize, Sequelize);
db.Kyc = require("../models/Kyc")(sequelize, Sequelize);


 


module.exports = db;
