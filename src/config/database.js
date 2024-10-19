const { Sequelize } = require('sequelize');

// Connect to MySQL database
const sequelize = new Sequelize('bitespeed', 'root', '@deadshot007', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;