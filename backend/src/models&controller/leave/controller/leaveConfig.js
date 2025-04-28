const router = require('express').Router();
const { Op } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { enum_values } = require('../../../utils/enum');
const { StaffLeaveConfig, StaffLeaveConfigApprover, StaffLeaveCredits } = require('../model/staffLeaveConfig');
const { isEmpty } = require('lodash');
const { Staff } = require('../../staff/model/staff');
const Department = require('../../department/model/department');

router.post('/config', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            {
                leave_config:{
                    type:paid|un_paid,
                    name:string,
                    code:string
                    days:number,
                    days_for:year|month,
                    role_ids:number[]
                }   
            }
        */

        let response = {};
        const { leave_config } = req.body;
        const valuesCheck = checkValuesAreExist({ type: leave_config?.type, ame: leave_config?.name, code: leave_config?.code, })
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required` });

        let leave_config_data = await StaffLeaveConfig.create(leave_config, { returning: true, transaction, user_id: req.headers?.['user_id'] });
        Object.assign(response, leave_config_data?.dataValues);

        if (!isEmpty(leave_config?.role_ids)) {
            let config_approver = leave_config?.role_ids?.map(res => ({ leave_config_id: leave_config_data?.id, role: res }));
            let leave_approver = await StaffLeaveConfigApprover.bulkCreate(config_approver, { transaction, });
            response['approvers'] = leave_approver;
        };

        await transaction.commit();
        returnValue({ res, response });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 });
    }
});

router.put('/config/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
       {
           leave_config:{
               type:paid|un_paid,
               name:string,
               code:string
               days:number,
               days_for:year|month,
               role_ids:number[]
           }   
       }
   */
        let response = {};
        const { id } = req.params;
        const { leave_config } = req.body;

        let leave_config_data = await StaffLeaveConfig.update(leave_config, { where: { id }, transaction, returning: true, individualHooks: true, user_id: req.headers?.['user_id'] })
        Object.assign(response, leave_config_data?.[1]?.[0]?.dataValues);
        await StaffLeaveConfigApprover.destroy({ where: { leave_config_id: id } });

        if (!isEmpty(leave_config?.role_ids)) {
            let config_approver = leave_config?.role_ids?.map(res => ({ leave_config_id: id, role: res }));
            let leave_approver = await StaffLeaveConfigApprover.bulkCreate(config_approver, { transaction });
            response['approvers'] = leave_approver;
        };

        await transaction.commit();
        returnValue({ res, response });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/config', async (req, res) => {
    try {
        let staff_id = req.query?.['staff_id'];

        const configs = await StaffLeaveConfig.findAndCountAll({
            ...applyPagination({ req }),
            ...staff_id && {
                include: [
                    {
                        model: Staff,
                        as: "staffs",
                        required: true,
                        where: {
                            id: staff_id
                        },
                        attributes: []
                    }, {
                        model: StaffLeaveConfigApprover,
                        as: "approvers"
                    }
                ]
            }
        });
        selectionFormat({ data: configs?.rows, format: [{ enum: "staff_leave_type", key: "type" }, { enum: 'staff_leave_days_for', key: "days_for" }] })
        returnValue({ res, response: configs });
    } catch (error) {
        returnValue({ res, status: 500, error });
    }
});

router.get('/config/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const config = await StaffLeaveConfig.findByPk(id, {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            include: [
                {
                    model: StaffLeaveConfigApprover,
                    as: "approvers"
                }
            ]
        });

        returnValue({ res, response: config })
    } catch (error) {
        returnValue({ res, status: 500, error });
    }
});

router.get('/support-data', async (req, res) => {
    try {
        let response = {
            'type': enum_values?.staff_leave_type,
            'days_for': enum_values?.staff_leave_days_for,
            'roles': enum_values?.staff_profile_role
        };


        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.delete('/config/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await StaffLeaveConfig.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

//allocate-leave-credits
router.get('/staff-leave-credits/:leave_config_id', async (req, res) => {
    try {
        const { leave_config_id } = req.params;
        let staffs = await Staff.findAll({
            where: { is_active: true },
            attributes: ['id', 'name', 'image'],
            include: [
                {
                    model: StaffLeaveConfig,
                    as: "staff_leave_configs",
                    required: false,
                    where: {
                        id: leave_config_id
                    }
                }, {
                    model: Department,
                    as: 'department'
                }
            ]
        });
        returnValue({ res, response: staffs })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
})

router.post('/allocate-leave-credits/:leave_config_id', async (req, res) => {
    try {
        /*
            {
                allocate_credits:{
                    staff_ids:number[]
                }
            }
        */
        const { leave_config_id } = req.params;
        let { allocate_credits } = req.body;
        let payload = allocate_credits?.staff_ids?.map(res => ({ staffLeaveConfigId: leave_config_id, staffId: res }));
        let credits = await StaffLeaveCredits.bulkCreate(payload);
        returnValue({ res, response: credits, });
    } catch (error) {
        returnValue({ error, status: 500, res })
    }
})

module.exports = router;