const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { ExamTime } = require('../model/examTime');

const router = require('express').Router();

router.post('/exam-time', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {

        const { exam_time } = req.body;
        let exam_time_data = await ExamTime.create(exam_time, { returning: true, user_id: req.headers['user_id'], transaction });
        await transaction.commit();
        returnValue({ res, response: exam_time_data });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.put('/exam-time/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { exam_time } = req.body;
        const [count, updated] = await ExamTime.update(exam_time, { where: { id }, returning: true, individualHooks: true, user_id: req.headers['user_id'], transaction });
        await transaction.commit();
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/exam-time', async (req, res) => {
    try {

        const exams = await ExamTime.findAndCountAll({
            ...applyPagination({ req }),
        });
        returnValue({ res, response: exams })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/exam-time/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await ExamTime.destroy({
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

router.get('/exam-time/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await ExamTime.findByPk(id);
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});


module.exports = router;