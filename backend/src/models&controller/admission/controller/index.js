const router = require('express').Router();
const fields_route = require('./fields')
const login_route = require('./login')
const programmeRoute = require('./programme')
const applicationFee = require('./applicationFee')
const applicants = require('./applicants')
const processFee = require('./processApplicant');
const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');
require('../hooks/auditLog')


router.use('/admission', fields_route);
router.use('/admission', login_route);
router.use('/admission', programmeRoute);
router.use('/admission', applicationFee);
router.use('/admission', applicants);
router.use('/admission', verifyUserToken, processFee);

module.exports = router;