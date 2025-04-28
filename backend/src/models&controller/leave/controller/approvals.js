const { returnValue, applyPagination, applyAcademicYear, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { enum_values } = require('../../../utils/enum');
const Users = require('../../base/user/model/user');
const { Staff } = require('../../staff/model/staff');
const { EncLeaveApproval } = require('../model/encApproval');
const { StaffLeave } = require('../model/staffLeave');
const { StaffLeaveConfig, StaffLeaveConfigApprover } = require('../model/staffLeaveConfig');

const router = require('express').Router();

router.get('/my-approvals', async (req, res) => {
    try {
        const user_id = req.headers?.['user_id'];
        const user = await Users.findByPk(user_id);
        let response = {};
        let staff = await Staff.findByPk(user?.staff_id, {
            attributes: ['id', 'role', 'department_id']
        });


        let include = [
            {
                model: StaffLeaveConfig,
                as: "staff_leave_config",
                required: true,
                attributes: ['id', 'name'],
                include: [
                    {
                        model: StaffLeaveConfigApprover,
                        as: "approvers",
                        required: true,
                        where: {
                            role: staff?.role
                        },
                        attributes: [],
                    }
                ],

            },
            {
                model: Staff,
                as: "staff",
                required: true,
                ...staff?.role !== 'principal' && {
                    where: {
                        department_id: staff?.department_id
                    }
                },
                attributes: ['id', 'name', 'image']
            }

        ];

        let count = await StaffLeave.count({
            include
        })
        let leave = await StaffLeave.findAll({
            include,
            attributes: ['id', 'start_date', 'end_date', 'status', 'createdAt'],
            ...applyPagination({ req })
        })

        selectionFormat({ data: leave, format: [{ enum: "staff_leave_status", key: "status" }] })
        response['count'] = count;
        response['rows'] = leave
        returnValue({ res, response });

    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.get('/email-approval/:status/:enc', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { enc, status } = req.params;
        let encModal = await EncLeaveApproval.findOne({ where: { enc } })
        if (!encModal) return returnValue({ res, error: `Your url is not valid`, status: 400 })
        if (!encModal?.staff_leave_id) return returnValue({ res, error: `Leave not found`, status: 400 })
        let leave = await StaffLeave.findByPk(encModal?.staff_leave_id);
        if (leave?.status !== 'applied') return returnValue({ res, status: 400, error: `Leave is ${leave?.status}` });
        await StaffLeave.update({ status }, { where: { id: encModal?.staff_leave_id }, transaction });
        await encModal.destroy({ transaction });
        await transaction.commit();
        returnValue({ res, response: { message: `Leave is ${status} successfully` } });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;