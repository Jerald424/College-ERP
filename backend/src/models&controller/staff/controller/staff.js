const { Op } = require('sequelize');
const { returnValue, checkValuesAreExist, selectionFormat, applyPagination } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { Staff, StaffClass } = require('../model/staff');
const isEmpty = require('lodash/isEmpty');
const Class = require('../../department/model/class');
const Department = require('../../department/model/department');
const { enum_values } = require('../../../utils/enum');
const router = require('express').Router();

router.get('/staff', async (req, res) => {
    try {
        let response = {};
        let where = {};
        if ('is_active' in req.query) where['is_active'] = req.query?.['is_active']
        const staff = await Staff.findAll({
            ...applyPagination({ req }),
            attributes: ['id', 'name', 'code', 'is_active', 'createdAt', 'image'],
            include: [
                {
                    model: Class,
                    as: 'classes'
                },
                {
                    model: Department,
                    as: "department"
                }
            ],
            ...!isEmpty(where) && { where }
        });
        selectionFormat({ data: staff, format: [{ enum: 'gender', key: 'gender' }] })
        response['rows'] = staff;
        response['count'] = await Staff.count();
        returnValue({ res, response });
    } catch (error) {
        returnValue({ error, status: 500, res })
    }
});

router.post('/staff', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /*
            staff:{
                ...rest,
                class_ids:number[],
            }
        */
        const { staff } = req.body;
        let valuesCheck = checkValuesAreExist({ name: staff?.name, code: staff?.code })
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required` })
        let response = {
            classes: []
        }
        let staff_record = await Staff.create(staff, { transaction, returning: true, user_id: req.headers['user_id'] });
        Object.assign(response, staff_record?.dataValues);
        if (!isEmpty(staff?.class_ids)) {
            let cls = staff?.class_ids?.map(res => ({ staffId: staff_record?.id, classId: res }));
            let classes = await StaffClass.bulkCreate(cls, { transaction, user_id: req.headers['user_id'], record_id: staff_record?.id });
            response['classes'] = classes;
        };
        await transaction.commit();
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ error, status: 500, res })
    }
});

router.put('/staff/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { staff } = req.body;
        let response = {
            classes: []
        };

        const [count, staffs_rec] = await Staff.update(staff, { where: { id }, transaction, returning: true, user_id: req.headers['user_id'], individualHooks: true });
        // if (count == 0) return returnValue({ res, error: 'Staff not found', status: 400 });
        Object.assign(response, staffs_rec?.[0]?.dataValues);
        await StaffClass.destroy({ where: { staffId: id }, transaction });

        if (!isEmpty(staff?.class_ids)) {
            let cls = staff?.class_ids?.map(res => ({ staffId: id, classId: res }));
            let classes = await StaffClass.bulkCreate(cls, { transaction, user_id: req.headers['user_id'], record_id: id });
            response['classes'] = classes;
        };
        await transaction.commit();
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/staff/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await Staff.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            },
            user_id: req.headers['user_id']
        });

        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findByPk(id, {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            include: [
                {
                    model: Class,
                    as: 'classes'
                },
                {
                    model: Department,
                    as: "department"
                }
            ]
        });
        selectionFormat({ data: staff, format: [{ enum: 'gender', key: 'gender' }] })
        returnValue({ res, response: staff })
    } catch (error) {

    }
});

router.get('/support-data', async (req, res) => {
    try {
        const response = {};
        response['gender'] = enum_values?.gender;
        response['department'] = await Department.findAll({ attributes: ['id', 'name'] });
        response['class'] = await Class.findAll({ attributes: ['id', 'name', 'acronym'] });
        response['role'] = enum_values?.staff_profile_role

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;