const chalk = require('chalk');

module.exports = {
  // Alta de usuario -> cyan
  created: (user) =>
    console.log(
      chalk.cyan(
        `[ALTA] Nuevo perito registrado -> id: ${user.id} | username: ${user.username} | role_id: ${user.role_id} | active: ${user.active}`
      )
    ),

  // Baja lógica -> cyan (evento de gestión de personal)
  deleted: (user) =>
    console.log(
      chalk.cyan(`[BAJA] Perito dado de baja (soft delete) -> id: ${user.id} | username: ${user.username}`)
    ),

  // Error de validación -> yellow, con el campo fallido
  validation: (field, message) =>
    console.log(chalk.yellow(`[VALIDACION] Campo fallido: "${field}" -> ${message}`)),

  // Error crítico 500 -> red con stack
  critical: (err) =>
    console.log(chalk.red(`[ERROR 500] ${err.message}\n${err.stack}`)),

  info: (msg) => console.log(chalk.green(msg)),
};
