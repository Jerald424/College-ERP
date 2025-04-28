const router = require('express').Router();
const { Op } = require('sequelize');
const { returnValue, selectionFormat, applyPagination, sequenceRecord } = require('../../../functions/handleData');
const { BoardingPoints } = require('../model/boardingPoints');
const { Bus } = require('../model/bus');
const sequelize = require('../../../sequelize');

router.post('/boarding-point', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            boarding_point:{
                points:[
                    {
                        name:number,
                        sequence:number
                    }
                ],
                bus_id:number,
            }
        */

        const { boarding_point } = req.body;
        for (let point of boarding_point?.points) {
            if (point?.id) {
                await BoardingPoints.update(point, {
                    where: { id: point?.id },
                    transaction
                })
            }
            else {
                await BoardingPoints.create(Object.assign(point, { bus_id: boarding_point?.bus_id }), { returning: true, transaction });
            }
        };
        await transaction.commit();
        returnValue({ res, response: "Record created successfully" });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put('/boarding-point/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { boarding_point } = req.body;
        const [_, update] = await BoardingPoints.update(boarding_point, { where: { id }, returning: true })
        returnValue({ res, response: update?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.post('/boarding-point-sequence', async (req, res) => {
    try {
        const { sequence } = req.body;
        await sequenceRecord({ modal: BoardingPoints, value: sequence });
        returnValue({ res, response: "Boarding place updated successfully" })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/boarding-point/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number)
        let response = await BoardingPoints.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/boarding-point/:bus_id', async (req, res) => {
    try {
        const { bus_id } = req.params;
        let rows = await BoardingPoints.findAll({
            where: { bus_id },
            order: [['sequence', 'ASC']]
        });

        returnValue({ res, response: rows });
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.get('/boarding-point/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await BoardingPoints.findByPk(id, {
            include: [
                {
                    model: Bus,
                    as: "bus"
                }
            ]
        })
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

module.exports = router;