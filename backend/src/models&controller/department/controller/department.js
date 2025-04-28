const { Op } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination } = require('../../../functions/handleData');
const Department = require('../model/department');

const router = require('express').Router();

router.post('/department', async (req, res) => {
    try {

        const { department } = req.body;
        let valuesCheck = checkValuesAreExist({ name: department?.name });
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required.` })
        const response = await Department.create(department, { returning: true })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ error, res, status: 500 });
    }
});

router.put('/department/:id', async (req, res) => {
    try {
        const { department } = req.body;
        const { id } = req.params;
        const [count, updated] = await Department.update(department, { where: { id }, returning: true })
        if (count == 0) return returnValue({ res, status: 400, error: "Department not found" });
        returnValue({ res, response: updated?.[0] })

    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.delete('/department/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        console.log('ids: ', ids);
        let response = await Department.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get("/department/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let response = await Department.findOne({
            where: { id }
        });
        returnValue({ res, response: response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/department', async (req, res) => {
    try {
        const response = await Department.findAndCountAll({
            ...applyPagination({ req })
        });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;