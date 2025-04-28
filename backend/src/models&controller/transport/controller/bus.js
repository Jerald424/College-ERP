const router = require('express').Router();
const { Op } = require('sequelize');
const { returnValue, selectionFormat, applyPagination } = require('../../../functions/handleData');
const { Bus } = require('../model/bus');

router.post('/bus', async (req, res) => {
    try {
        /*
            bus:{
                name:string;
                description:string
            }
        */
        const { bus } = req.body;
        let response = await Bus.create(bus)
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put("/bus/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { bus } = req.body;
        const [_, updated] = await Bus.update(bus, { where: { id }, returning: true });
        returnValue({ res, response: updated?.[0] });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/bus/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(', ')?.map(Number);
        let deleted = await Bus.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        returnValue({ res, response: deleted });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get("/bus", async (req, res) => {
    try {
        const response = await Bus.findAndCountAll({
            ...applyPagination({ req })
        })

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/bus/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Bus.findByPk(id)
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;