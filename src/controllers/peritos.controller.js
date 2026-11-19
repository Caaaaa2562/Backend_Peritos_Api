const createError = require('http-errors');
const { UniqueConstraintError } = require('sequelize');
const { User, Role } = require('../models');
const logger = require('../utils/logger');

// required: false => LEFT JOIN
const roleInclude = { model: Role, as: 'role', attributes: ['id', 'nombre_rol'], required: false };

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError(400, 'El id debe ser un entero positivo', { field: 'id' });
  }
  return id;
}

// POST /api/v1/peritos
exports.create = async (req, res, next) => {
  try {
    const { username, role_id } = req.body || {};

    if (typeof username !== 'string' || username.trim() === '') {
      throw createError(400, 'El username no debe estar vacío', { field: 'username' });
    }
    if (role_id === undefined || role_id === null || !Number.isInteger(Number(role_id))) {
      throw createError(400, 'role_id es obligatorio y debe ser un entero', { field: 'role_id' });
    }

    const role = await Role.findByPk(Number(role_id));
    if (!role) {
      throw createError(400, `El rol con id ${role_id} no existe`, { field: 'role_id' });
    }

    const name = username.trim();
    const exists = await User.findOne({ where: { username: name } });
    if (exists) {
      throw createError(409, `El username "${name}" ya existe`, { field: 'username' });
    }

    let user;
    try {
      user = await User.create({ username: name, role_id: role.id });
    } catch (err) {
      // Respaldo ante condición de carrera sobre el UNIQUE
      if (err instanceof UniqueConstraintError) {
        throw createError(409, `El username "${name}" ya existe`, { field: 'username' });
      }
      throw err;
    }

    logger.created(user);
    const created = await User.findByPk(user.id, { include: roleInclude });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/peritos/:id  (baja lógica)
exports.remove = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const user = await User.findByPk(id);
    if (!user) {
      throw createError(404, `No existe un perito con id ${id}`);
    }

    user.active = false;
    await user.save();

    logger.deleted(user);
    res.json({ message: 'Perito dado de baja correctamente', id: user.id });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/peritos?role=ADMIN
exports.list = async (req, res, next) => {
  try {
    const where = { active: true };
    const { role } = req.query;

    if (role !== undefined) {
      if (typeof role !== 'string' || role.trim() === '') {
        throw createError(400, 'El query param role no puede estar vacío', { field: 'role' });
      }
      where['$role.nombre_rol$'] = role.trim().toUpperCase();
    }

    const users = await User.findAll({
      where,
      include: roleInclude,
      order: [['id', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/peritos/:id
exports.getById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const user = await User.findByPk(id, { include: roleInclude });
    if (!user || !user.active) {
      throw createError(404, `No existe un perito activo con id ${id}`);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};
