const router = require("express").Router();
const group = require('./group');
const message = require('./message');
const newChat = require('./newChat');
const user = require('./user');
const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');


router.use('/communication', verifyUserToken, group);
router.use('/communication', verifyUserToken, message);
router.use('/communication', verifyUserToken, newChat);
router.use('/communication', verifyUserToken, user);

module.exports = router;