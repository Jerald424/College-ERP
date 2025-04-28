const router = require('express').Router();
const department = require('./department');
const cls = require('./class');

router.use('/department', department);
router.use('/programme', cls)

module.exports = router