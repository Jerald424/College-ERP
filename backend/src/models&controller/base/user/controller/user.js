const { returnValue, checkValuesAreExist, applyPagination } = require('../../../../functions/handleData');
const User = require('../model/user');
const { isArray, isEmpty } = require('lodash');
const UserRoles = require('../model/userRole');
const sequelize = require('../../../../sequelize');
const Role = require('../model/role');
const { Op } = require('sequelize');
const { enum_values } = require('../../../../utils/enum');
const { Staff } = require('../../../staff/model/staff');
const Student = require('../../../student/model/student');
const { AdmissionApplicant } = require('../../../admission/model/admissionApplicant');

const router = require('express').Router();

router.post('/user', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            role:[
                {role_id:number, is_active:boolean}
            ]
        */
        const { user } = req.body;
        const valuesCheck = checkValuesAreExist({ username: user?.username, password: user?.password });
        if (valuesCheck) return returnValue({ res, error: `${valuesCheck} are required`, status: 400 });
        const response = await User.create({ username: user?.username, password: user?.password, student_id: user?.student_id, staff_id: user?.staff_id }, { returning: true, transaction });
        if (isArray(user?.role)) {
            let isCheck = user?.role?.some(res => !res?.role_id);
            let more_active = user?.role?.filter(res => res?.is_active)?.length > 1;
            if (isCheck) return returnValue({ res, status: 400, error: "role_id is missing" });
            if (more_active) return returnValue({ res, status: 400, error: "Role cannot active more than one at a time." })
            await transaction.commit();
            let user_role_bulk_data = user?.role?.map(res => ({ role_id: res?.role_id, is_active: res?.is_active || false, user_id: response?.id }));
            await UserRoles.bulkCreate(user_role_bulk_data)
        } else await transaction.commit();
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.put('/user/:id', async (req, res) => {
    try {
        /* 
            role:[
                {id:number, is_active:boolean, role_id:number}
            ]
        */
        const { user } = req.body;
        const { id } = req.params;
        let user_response = await User.update({ username: user?.username, password: user?.password, student_id: user?.student_id, staff_id: user?.staff_id }, { where: { id }, individualHooks: true });

        if (isArray(user?.role)) {
            await UserRoles.destroy({ where: { user_id: +id } });
            let isCheck = user?.role?.some(res => !res?.role_id);
            let more_active = user?.role?.filter(res => res?.is_active)?.length > 1;
            if (isCheck) return returnValue({ res, status: 400, error: "role_id is missing" });
            if (more_active) return returnValue({ res, status: 400, error: "Role cannot active more than one at a time." })
            let user_role_bulk_data = user?.role?.map(res => ({ role_id: res?.role_id, is_active: res?.is_active || false, user_id: +id }));
            await UserRoles.bulkCreate(user_role_bulk_data)
        }
        returnValue({ res, response: user_response })
    } catch (error) {
        returnValue({ res, error: error, status: 500 })
    }
})


router.get('/users', async (req, res) => {
    try {
        // current, pageSize
        const response = await User.findAll({
            include: [
                {
                    model: UserRoles,
                    as: "user_roles",
                    include: [
                        {
                            model:
                                Role,
                            as: "roles"
                        }
                    ]
                },
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['id', 'name']
                },
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'roll_no'],
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            ...applyPagination({ req })

        })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await User.findOne({ where: { id }, include: [{ model: UserRoles, as: "user_roles", include: [{ model: Role, as: "roles" }] }] })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/users/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        console.log('ids: ', ids);
        let response = await User.destroy({ where: { id: { [Op.in]: ids } }, cascade: true });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/users-count', async (req, res) => {
    try {
        const response = await User.count();
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/user-support-data', (req, res) => {
    try {
        returnValue({
            res,
            response: {
                level: enum_values?.role_level
            }
        })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;