const router = require('express').Router();
const stateAndDistrict = require('./state&district');
const academicYear = require('./academicYear');
const role = require('../user/controller/role');
const user = require('../user/controller/user');
const login = require('../user/controller/login');
const mailConfig = require('../communication/controller/mailConfig');
const domainUrl = require('../communication/controller/domainUrl');

const { verifyUserToken } = require('../user/middleware/verifyUserToken');

router.use('/base', stateAndDistrict);
router.use('/base', academicYear);
router.use('/base', role);
router.use('/base', user);
router.use('/base', login);
router.use('/base', verifyUserToken, mailConfig);
router.use('/base', verifyUserToken, domainUrl);


module.exports = router;