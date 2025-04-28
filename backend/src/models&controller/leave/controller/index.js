const router = require('express').Router();
const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');
const leaveConfig = require('./leaveConfig');
const staffLeave = require('./staffLeave');
const leaveApprovals = require('./approvals');
require('../hooks/mail')


router.use('/leave', verifyUserToken, leaveConfig);
router.use('/leave', verifyUserToken, staffLeave);
router.use('/leave', verifyUserToken, leaveApprovals);

module.exports = router;