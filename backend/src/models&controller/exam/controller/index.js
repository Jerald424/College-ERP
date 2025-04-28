const router = require('express').Router();
const examConfig = require('./examConfig');
const exam = require('./exam')
const examRoom = require('./examRoom');
const examTime = require('./examTime');
const examTimetable = require('./examTimetable');
const examRoomAllocate = require('./examRoomAllocate');
const examSchedule = require('./examSchedules');
const studentSchedule = require('./student/schedules');
const examMarkEntry = require("./examMarkEntry");
const examResult = require('./examResult');

const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');

router.use('/exam', verifyUserToken, examConfig);
router.use('/exam', verifyUserToken, exam);
router.use('/exam', verifyUserToken, examRoom);
router.use('/exam', verifyUserToken, examTimetable);
router.use('/exam', verifyUserToken, examTime);
router.use('/exam', verifyUserToken, examRoomAllocate);
router.use('/exam', verifyUserToken, examSchedule);
router.use('/exam', verifyUserToken, studentSchedule);
router.use('/exam', verifyUserToken, examMarkEntry);
router.use('/exam', verifyUserToken, examResult);

module.exports = router;