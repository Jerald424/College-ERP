const { Op } = require('sequelize');
const { returnValue, applyPagination } = require('../../../functions/handleData');
const { REQUIRED_FIELDS_ARE_MISSING } = require('../../../functions/variables');
const router = require('express').Router();
const District = require('../model/district');
const State = require('../model/state');


router.post('/district', async (req, res) => {
    try {
        const { district } = req.body;
        if (!district?.name) return returnValue({ res, error: REQUIRED_FIELDS_ARE_MISSING, status: 400 });
        const response = await District.create(district, { returning: true });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.put('/district/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { district } = req.body;
        const [_, updated] = await District.update(district, { where: { id }, returning: true })
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})



router.get('/district', async (req, res) => {
    try {
        let response = await District.findAndCountAll({
            include: [{ model: State, as: "state" }],
            ...applyPagination({ req })
        });

        returnValue({ res, response: response });
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.delete('/district/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await District.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/district/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await District.findByPk(id)
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

//state
router.post('/state', async (req, res) => {
    try {
        const { state } = req.body;
        if (!state?.name) return returnValue({ res, error: REQUIRED_FIELDS_ARE_MISSING, status: 400 });
        const response = await State.create(state, { returning: true });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.put('/state/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { state } = req.body;
        const [_, updated] = await State.update(state, { where: { id }, returning: true })
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})


router.get('/state', async (req, res) => {
    try {
        let response = await State.findAndCountAll({
            ...applyPagination({ req })
        });

        returnValue({ res, response: response });
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.get("/state/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await State.findByPk(id);
        returnValue({ res, response })
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
})

router.delete('/state/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await State.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})


module.exports = router;