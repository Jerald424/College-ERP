const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { ExamRoom } = require('../model/examRoom');

const router = require('express').Router();

router.post('/exam-room', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {

        const { exam_room } = req.body;
        let exam_data = await ExamRoom.create(exam_room, { returning: true, user_id: req.headers['user_id'], transaction });
        await transaction.commit();
        returnValue({ res, response: exam_data });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.put('/exam-room/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { exam_room } = req.body;
        const [count, updated] = await ExamRoom.update(exam_room, { where: { id }, returning: true, individualHooks: true, user_id: req.headers['user_id'], transaction });
        await transaction.commit();
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/exam-room', async (req, res) => {
    try {

        const exams = await ExamRoom.findAndCountAll({
            ...applyPagination({ req }),
        });
        returnValue({ res, response: exams })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/exam-room/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await ExamRoom.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/exam-room/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await ExamRoom.findByPk(id);
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});


module.exports = router;