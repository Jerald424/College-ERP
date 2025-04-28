const router = require('express').Router();
const bus = require('./bus');
const boardingPlace = require('./boardingPlace');
const busSession = require('./busSession');
const BusSchedules = require('./busSchedules');
const attendance = require('./attendance');
const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');

router.use('/transport', bus);
router.use('/transport', boardingPlace);
router.use('/transport', verifyUserToken, busSession);
router.use('/transport', verifyUserToken, BusSchedules);
router.use('/transport', attendance)


module.exports = router;