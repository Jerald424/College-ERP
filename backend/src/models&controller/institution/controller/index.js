const router = require('express').Router();
const institutionProfile = require('./institutionProfile');

router.use('/institution', institutionProfile)

module.exports = router;