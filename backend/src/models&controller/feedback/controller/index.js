const router = require('express').Router();
const question = require('./questions');
const form = require('./form');
const answer = require('./answer');
const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');


router.use('/feedback', question);
router.use('/feedback', form);
router.use('/feedback', verifyUserToken, answer);

module.exports = router;