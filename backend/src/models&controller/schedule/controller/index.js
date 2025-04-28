const router = require('express').Router();
const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');
const course = require('./course');
const calender = require('./calender');
const timetable = require('./timetable');
const schedule = require('./schedule');
require('../hooks/auditLog')

router.use('/course', verifyUserToken, course);
router.use('/calender', verifyUserToken, calender);
router.use('/timetable', verifyUserToken, timetable);
router.use('/schedule', verifyUserToken, schedule);

module.exports = router;