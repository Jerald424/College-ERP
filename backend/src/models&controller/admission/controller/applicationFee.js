const { Op } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination, selectionFormat, applyAcademicYear } = require('../../../functions/handleData');
const ApplicationFee = require('../model/applicationFee');
const router = require('express').Router();


router.post('/application-fee', async (req, res) => {
    try {
        const { application_fee } = req.body;
        const valuesCheck = checkValuesAreExist({ academic_year_id: application_fee?.academic_year_id, name: application_fee?.name, amount: application_fee?.amount, programme_level_id: application_fee?.programme_level_id })
        if (valuesCheck) return returnValue({ res, error: `${valuesCheck} are required`, status: 400 });
        const response = await ApplicationFee.create(application_fee, { returning: true })
        returnValue({ res, response })

    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.put('/application-fee/:id', async (req, res) => {
    try {
        const { application_fee } = req.body;
        const { id } = req.params;
        const [count, updated] = await ApplicationFee.update(application_fee, { where: { id }, returning: true, individualHooks: true })
        if (count == 0) return returnValue({ res, error: "No application fee found", status: 400 });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.get('/application-fees', async (req, res) => {
    try {

        let appFee = await ApplicationFee.findAndCountAll({
            ...applyPagination({ req }),
            where: { ...applyAcademicYear({ req }) }
        });
        selectionFormat({ data: appFee?.rows, format: [{ key: "programme_level_id", enum: "programme_level" }] });
        returnValue({ res, response: appFee })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


router.delete('/application-fee/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await ApplicationFee.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/application-fee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let appFee = await ApplicationFee.findOne({ where: { id } });
        // selectionFormat({ data: appFee, format: [{ key: "programme_level_id", enum: "programme_level" }] });
        returnValue({ res, response: appFee })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;