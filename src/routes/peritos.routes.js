const router = require('express').Router();
const c = require('../controllers/peritos.controller');

router.post('/', c.create);
router.get('/', c.list);
router.get('/:id', c.getById);
router.delete('/:id', c.remove);

module.exports = router;
