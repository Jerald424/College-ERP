const router = require('express').Router();
const admission_route = require('../models&controller/admission/controller')
const base_route = require('../models&controller/base/controller');
const department_route = require('../models&controller/department/controller');
const student = require('../models&controller/student/controller');
const institution = require('../models&controller/institution/controller');
const audit = require('./audit');
const schedule = require('../models&controller/schedule/controller')
const staff = require('../models&controller/staff/controller');
const leave = require('../models&controller/leave/controller');
const exam = require('../models&controller/exam/controller');
const communication = require('../models&controller/communication/controller');
const feedback = require("../models&controller/feedback/controller");
const transport = require("../models&controller/transport/controller")

router.use('/api', admission_route);
router.use('/api', base_route);
router.use('/api', department_route);
router.use('/api', student);
router.use('/api', institution);
router.use('/api', audit);
router.use('/api', schedule);
router.use('/api', staff);
router.use('/api', leave)
router.use('/api', exam);
router.use('/api', communication);
router.use('/api', feedback);
router.use('/api', transport)

module.exports = router;