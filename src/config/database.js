require('dotenv').config();
const path = require('path');
const { Sequelize } = require('sequelize');

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();

let sequelize;

if (dialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
} else {
  // Sequelize ejecuta PRAGMA foreign_keys = ON en SQLite por defecto,
  // por lo que las Foreign Keys se hacen cumplir.
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(process.env.DB_STORAGE || './forensics.db'),
    logging: false,
  });
}

module.exports = { sequelize, dialect };
