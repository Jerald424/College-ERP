const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../functions/handleData');
const { AdmissionApplicant } = require('../models&controller/admission/model/admissionApplicant');
const AuditLog = require('../models&controller/base/model/auditLog');
const Users = require('../models&controller/base/user/model/user');
const Student = require('../models&controller/student/model/student');

const router = require('express').Router();

router.get('/audit/:table_names/:record_id', async (req, res) => {
    try {
        let { record_id, table_names } = req.params;
        table_names = table_names?.split(',');

        let where = {
            // record_id: +record_id,
            table_name: {
                [Op.in]: table_names
            }
        };
        console.log('#######', !!+record_id)
        if (!!+record_id) where['record_id'] = +record_id;
        const records = await AuditLog.findAll({
            include: [
                {
                    model: AdmissionApplicant,
                    as: "applicant",
                    attributes: ['id', 'name', 'image']
                },
                {
                    model: Users,
                    as: "user",
                    attributes: ['id'],
                    include: [
                        {
                            model: Student,
                            as: "student",
                            required: true
                        }
                    ]
                }
            ],
            where,
            ...applyPagination({ req })
        });

        let count = await AuditLog?.count({ where })
        let response = { rows: records, count };
        selectionFormat({ data: response?.rows, format: [{ enum: "audit_operation", key: "operation" }] });
        returnValue({ res, response });

    } catch (error) {
        console.log('error: ', error);
        returnValue({ res, error, status: 500 });
    }
})

module.exports = router;