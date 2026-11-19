require('dotenv').config();
const { sequelize, Role, User } = require('./models');
const logger = require('./utils/logger');

(async () => {
  try {
    await sequelize.sync();

    for (const nombre_rol of ['ADMIN', 'FORENSIC_INSPECTOR', 'AUDITOR']) {
      await Role.findOrCreate({ where: { nombre_rol } });
    }

    const roles = Object.fromEntries((await Role.findAll()).map((r) => [r.nombre_rol, r.id]));
    const users = [
      { username: 'admin_garcia', role_id: roles.ADMIN },
      { username: 'perito_lopez', role_id: roles.FORENSIC_INSPECTOR },
      { username: 'auditor_perez', role_id: roles.AUDITOR },
      { username: 'perito_diaz', role_id: roles.FORENSIC_INSPECTOR },
    ];
    for (const u of users) await User.findOrCreate({ where: { username: u.username }, defaults: u });

    logger.info('Seed completado: 3 roles y 4 usuarios de prueba.');
    await sequelize.close();
  } catch (err) {
    logger.critical(err);
    process.exit(1);
  }
})();
