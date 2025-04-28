const { Op } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination } = require('../../../../functions/handleData');
const { enum_values } = require('../../../../utils/enum');
const permissions = require('../../../../utils/permission.json');
const Role = require('../model/role');

const router = require('express').Router();

router.post('/role', async (req, res) => {
    try {
        const { role } = req.body;
        const valuesCheck = checkValuesAreExist({ name: role?.name, level_id: role?.level_id });
        if (valuesCheck) return returnValue({ res, error: `${valuesCheck} are required`, status: 400 })
        const response = await Role.create(role, { returning: true });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put('/role/:id', async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;
        const [affect, updated] = await Role.update(role, { where: { id }, returning: true })
        console.log('affect: ', affect);
        if (affect == 0) return returnValue({ res, status: 400, error: "No role affected" });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/roles', async (req, res) => {
    try {

        const response = await Role.findAll({
            ...applyPagination({ req })
        });
        returnValue({ response, res })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/role/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Role.destroy({ where: { id } })
        returnValue({ res, response: { id, message: 'Role deleted.' } });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/roles-count', async (req, res) => {
    try {
        const response = await Role.count();
        returnValue({ response, res })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/roles/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await Role.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/role/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Role.findOne({ where: { id } })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/roles-support-data', async (req, res) => {
    try {
        returnValue({ res, response: { level: enum_values?.role_level, permissions } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


module.exports = router;