const { Op } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination, selectionFormat, sequenceRecord } = require('../../../functions/handleData');
const AcademicYear = require('../model/academicYear/academicYear');
const Term = require('../model/academicYear/term');
const Hours = require('../model/academicYear/hour');
const { enum_values } = require('../../../utils/enum');
const sequelize = require('../../../sequelize');

const router = require('express').Router();

router.post('/academic-year', async (req, res) => {
    try {
        const { academic_year } = req.body;
        let valuesCheck = checkValuesAreExist({ name: academic_year?.name, start_date: academic_year?.start_date, end_date: academic_year?.end_date });
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required.` })
        const response = await AcademicYear.create(academic_year, { returning: true })
        returnValue({ res, response });

    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
})

router.get('/academic-years', async (req, res) => {
    try {
        let response = await AcademicYear.findAndCountAll({
            ...applyPagination({ req })
        });

        returnValue({ res, response: response });
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.put('/academic-year/:id', async (req, res) => {
    try {
        const { academic_year } = req.body;
        const { id } = req.params;
        const [count, updated] = await AcademicYear.update(academic_year, { where: { id }, returning: true, individualHooks: true })
        if (count == 0) return returnValue({ res, status: 400, error: "Academic year not found" });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
})


router.delete('/academic-year/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        console.log('ids: ', ids);
        let response = await AcademicYear.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get("/academic-year/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let response = await AcademicYear.findOne({
            where: { id }
        });

        returnValue({ res, response: response })


    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

//term
router.post('/term', async (req, res) => {
    try {
        const { term } = req.body;
        console.log('term: ', term);
        let valuesCheck = checkValuesAreExist({ name: term?.name, start_date: term?.start_date, end_date: term?.end_date });
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required.` })
        const response = await Term.create(term, { returning: true })
        returnValue({ res, response });

    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
})

router.get('/term', async (req, res) => {
    try {
        const academic_year_id = req.query?.['academic_year_id'];
        let where = {};
        if (academic_year_id) where['academic_year_id'] = academic_year_id;
        let response = await Term.findAndCountAll({
            where,
            ...applyPagination({ req })
        });

        returnValue({ res, response: response });
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.put('/term/:id', async (req, res) => {
    try {
        const { term } = req.body;
        const { id } = req.params;
        const [count, updated] = await Term.update(term, { where: { id }, returning: true, individualHooks: true })
        if (count == 0) return returnValue({ res, status: 400, error: "Term not found" });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
})


router.delete('/term/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        console.log('ids: ', ids);
        let response = await Term.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get("/term/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let response = await Term.findOne({
            where: { id }
        });

        returnValue({ res, response: response })


    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/term-count', async (req, res) => {
    try {
        const academic_year_id = req.query?.['academic_year_id'];
        let where = {};
        if (academic_year_id) where['academic_year_id'] = academic_year_id;
        let count = await Term.count({ where });
        returnValue({ res, response: { count } });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

//hour
router.post('/hour', async (req, res) => {
    try {
        const { hour } = req.body;
        let valuesCheck = checkValuesAreExist({ name: hour?.name, time_from: hour?.time_from, time_to: hour?.time_to });
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required.` })
        const response = await Hours.create(hour, { returning: true })
        returnValue({ res, response });

    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.post('/hour-sequence', async (req, res) => {
    try {
        const { sequence } = req.body;
        await sequenceRecord({ modal: Hours, value: sequence });
        returnValue({ res, response: 'Hour sequence update success' });
    } catch (error) {
        returnValue({ error, res, status: 500 });
    }
})

router.get('/hour', async (req, res) => {
    try {
        const term_id = req.query?.['term_id'];
        let where = {};
        if (term_id) where['term_id'] = term_id;
        let response = await Hours.findAndCountAll({
            where,
            order: ['sequence']
            // ...applyPagination({ req })
        });
        selectionFormat({ data: response?.rows, format: [{ enum: "hour_type", key: "type" }] })
        returnValue({ res, response: response });
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.put('/hour/:id', async (req, res) => {
    try {
        const { hour } = req.body;
        const { id } = req.params;
        const [count, updated] = await Hours.update(hour, { where: { id }, returning: true, individualHooks: true })
        if (count == 0) return returnValue({ res, status: 400, error: "Hour not found" });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
})


router.delete('/hour/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await Hours.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get("/hour/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let response = await Hours.findOne({
            where: { id }
        });

        returnValue({ res, response: response })


    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


router.get('/hour-count', async (req, res) => {
    try {
        const term_id = req.query?.['term_id'];
        let where = {};
        if (term_id) where['term_id'] = term_id;
        let count = await Hours.count({ where });
        returnValue({ res, response: { count } });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/hour-create-support-data', async (req, res) => {
    try {
        const response = {
            hour_type: enum_values?.hour_type,
            session: enum_values?.staff_leave_session
        };

        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;