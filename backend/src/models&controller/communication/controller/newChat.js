const router = require('express').Router();
const { returnValue, applyPagination } = require('../../../functions/handleData');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const Users = require('../../base/user/model/user');
const { Staff } = require('../../staff/model/staff');
const Student = require('../../student/model/student');

router.get('/new-chat-list', async (req, res) => {
    try {
        let users = await Users.findAll({
            order: [
                [
                    { model: Staff, }, "name", 'ASC'
                ],
                [
                    { model: Student }, "roll_no", "ASC"
                ]
            ],
            include: [
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['id', 'name', 'image']
                        }
                    ]
                },
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['id', 'name', 'image']
                }
            ]
        });
        returnValue({ res, response: users })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;