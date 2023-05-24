const { Sequelize, DataTypes } = require("sequelize");
const { DB_URI } = require('../config');
const sequelize = new Sequelize(
  DB_URI,
  { dialect: "postgres" }
);

sequelize
  .authenticate()
  .then(() => {
    console.log(`Database connected to discover`);
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = require("./userModel")(sequelize, DataTypes);

module.exports = db;
