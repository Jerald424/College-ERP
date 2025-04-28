const router = require('express').Router();
const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const { FeedbackQuestions } = require('../model/question');
const { FeedbackQuestionOptions } = require('../model/questionOptions');


router.post('/question', async (req, res) => {
    try {
        const { question } = req.body;
        let created = await FeedbackQuestions.create(question, { returning: true })
        returnValue({ res, response: created })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put('/question/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { question } = req.body;
        let [_, updated] = await FeedbackQuestions.update(question, { where: { id }, returning: true, individualHooks: true })
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});
router.delete('/question/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await FeedbackQuestions.destroy({
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

router.get('/question', async (req, res) => {
    try {
        const response = await FeedbackQuestions.findAll({
            ...applyPagination({ req })
        });
        let count = await FeedbackQuestions.count();
        selectionFormat({ data: response, format: [{ key: "type", enum: 'feedback_question_type' }] })
        returnValue({ res, response: { rows: response, count } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/question/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await FeedbackQuestions.findByPk(id)
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


//question-options
router.post('/question-options', async (req, res) => {
    try {
        const { options } = req.body;
        let payload = options?.data?.map(res => ({ ...res, question_id: options?.question_id }));
        let response = await FeedbackQuestionOptions.bulkCreate(payload, { returning: true })
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/question-options/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await FeedbackQuestionOptions.destroy({
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

router.get('/question-options/:question_id', async (req, res) => {
    try {
        const { question_id } = req.params;
        const options = await FeedbackQuestionOptions.findAll({
            where: {
                question_id
            }
        });

        returnValue({ res, response: options })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;