const router = require('express').Router();
const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { FeedbackForm, FeedbackDepartment, FeedbackFormQuestions } = require('../model/form');
const { FeedbackQuestions } = require('../model/question');
const Department = require('../../department/model/department');
const { FeedbackQuestionOptions } = require('../model/questionOptions');

router.post('/form', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { form } = req.body;
        /*
        name | for |level |start_date|end_date|department_ids|question_ids

        feedbackQuestionId | feedbackFormId
        feedbackFormId | departmentId
        */

        const response = {};
        const created_form = await FeedbackForm.create(form, { transaction, returning: true });
        Object.assign(response, created_form?.dataValues);

        let department_payload = form?.department_ids?.map(res => ({ feedbackFormId: created_form?.id, departmentId: res }))
        let departments = await FeedbackDepartment.bulkCreate(department_payload, { transaction, returning: true });
        Object.assign(response, { departments })

        let question_payload = form?.question_ids?.map(res => ({ feedbackFormId: created_form?.id, feedbackQuestionId: res }));
        const questions = await FeedbackFormQuestions.bulkCreate(question_payload, { transaction, returning: true });
        Object.assign(response, { questions })

        await transaction.commit();
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.put("/form/:id", async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { form } = req.body;
        const { id } = req.params;
        /*
        name | for |level |start_date|end_date|department_ids|question_ids

        feedbackQuestionId | feedbackFormId
        feedbackFormId | departmentId
        */

        const response = {};
        const [_, updated] = await FeedbackForm.update(form, { where: { id }, transaction, returning: true });
        Object.assign(response, updated?.[0]?.dataValues);

        await FeedbackDepartment.destroy({ where: { feedbackFormId: id }, transaction });
        await FeedbackFormQuestions.destroy({ where: { feedbackFormId: id }, transaction });

        let department_payload = form?.department_ids?.map(res => ({ feedbackFormId: id, departmentId: res }))
        let departments = await FeedbackDepartment.bulkCreate(department_payload, { transaction });
        Object.assign(response, { departments })

        let question_payload = form?.question_ids?.map(res => ({ feedbackFormId: id, feedbackQuestionId: res }));
        const questions = await FeedbackFormQuestions.bulkCreate(question_payload, { transaction });
        Object.assign(response, { questions });

        await transaction.commit();
        returnValue({ res, response });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/form', async (req, res) => {
    try {
        let rows = await FeedbackForm.findAll({
            ...applyPagination({ req })
        });
        const count = await FeedbackForm.count();
        selectionFormat({ data: rows, format: [{ key: "feedback_for", enum: "feedback_form_for" }] })
        returnValue({ res, response: { rows, count } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/form/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await FeedbackForm.findByPk(id, {
            include: [
                {
                    model: FeedbackQuestions,
                    as: "form_questions",
                    include: [
                        {
                            model: FeedbackQuestionOptions,
                            as: "question_options"
                        }
                    ]
                },
                {
                    model: Department,
                    as: 'feedback_form_departments'
                }
            ]
        })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/form/:ids', async (req, res) => {
    try {
        let ids = req.params?.ids;
        ids = ids?.split(',')?.map(Number);

        let response = await FeedbackForm.destroy({
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
})

module.exports = router;