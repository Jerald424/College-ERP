const router = require('express').Router();
const staff = require('./staff')
const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');
require('../hooks/auditLog')

router.use('/staff', verifyUserToken, staff)

module.exports = router;