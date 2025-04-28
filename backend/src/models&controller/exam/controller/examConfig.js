const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const { enum_values } = require('../../../utils/enum');
const { ExamConfig } = require('../model/examConfig');
const Term = require('../../base/model/academicYear/term');

const router = require('express').Router();

router.post('/exam-config', async (req, res) => {
    try {
        const { exam_config } = req.body;
        let response = await ExamConfig.create(exam_config, { returning: true, user_id: req.headers['user_id'] })
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put('/exam-config/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { exam_config } = req.body;
        const [count, updated] = await ExamConfig.update(exam_config, { where: { id }, returning: true, individualHooks: true, user_id: req.headers['user_id'] });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/exam-config', async (req, res) => {
    try {
        const response = await ExamConfig.findAndCountAll({
            ...applyPagination({ req }),
            include: [
                {
                    model: Term,
                    as: "term",
                    attributes: ['id', 'name']
                }
            ]
        })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/exam-config/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await ExamConfig.destroy({
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

router.get('/exam-config/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await ExamConfig.findByPk(id);
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});


module.exports = router;