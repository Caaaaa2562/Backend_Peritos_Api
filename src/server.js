require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const { dialect } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info(`Base de datos conectada (${dialect})`);
    app.listen(PORT, () => logger.info(`Servidor escuchando en http://localhost:${PORT}`));
  } catch (err) {
    logger.critical(err);
    process.exit(1);
  }
})();
