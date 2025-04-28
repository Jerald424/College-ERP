const { Op } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination } = require('../../../functions/handleData');
const Class = require('../model/class');
const { enum_values } = require('../../../utils/enum');

const router = require('express').Router();

router.post('/class', async (req, res) => {
    try {
        const { cls } = req.body;
        const valuesCheck = checkValuesAreExist({ name: cls?.name, programme_id: cls?.programme_id });
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required.` })
        const response = await Class.create(cls, { returning: true })
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.put('/class/:id', async (req, res) => {
    try {
        const { cls } = req.body;
        const { id } = req.params;
        const [count, updated] = await Class.update(cls, { where: { id }, returning: true })
        if (count == 0) return returnValue({ res, status: 400, error: "Class not found" });
        returnValue({ res, response: updated?.[0] })

    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.delete('/class/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await Class.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get("/class/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let response = await Class.findOne({
            where: { id }
        });
        returnValue({ res, response: response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/class', async (req, res) => {
    try {
        const programme_id = req.query?.['programme_id']
        let filters = {};
        if (programme_id) filters['programme_id'] = programme_id;
        const response = await Class.findAndCountAll({

            where: {
                ...filters,
            },
            ...applyPagination({ req })
        });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/class-support-data', async (req, res) => {
    try {
        returnValue({
            res, response: {
                year: enum_values?.class_year
            }
        })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;