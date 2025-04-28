const { Sequelize, Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const { Programme } = require('../../admission/model/programme');
const Users = require('../../base/user/model/user');
const Department = require('../../department/model/department');
const { Staff } = require('../../staff/model/staff');
const Student = require('../../student/model/student');
const { FeedbackAnswer, AnswerOptions } = require('../model/answer');
const { FeedbackForm } = require('../model/form');
const { FeedbackQuestions } = require('../model/question');
const { FeedbackQuestionOptions } = require('../model/questionOptions');

const router = require('express').Router();

router.get('/user-feedback', async (req, res) => {
    try {
        const user_id = req.headers['user_id'];

        let user = await Users.findByPk(user_id, {
            include: [
                {
                    model: Student,
                    as: "student",
                    attributes: ['id'],
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['programme_id'],
                            include: [
                                {
                                    model: Programme,
                                    as: "programme",
                                    attributes: ['id', 'department_id']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['department_id']
                },
            ]
        });

        let is_staff = !!user?.staff_id;
        let user_dept_id = is_staff ? user?.staff?.department_id : user?.student?.applicant?.programme?.department_id;

        let forms = await FeedbackForm.findAll({
            include: [
                {
                    model: Department,
                    as: "feedback_form_departments"
                }
            ],
            where: {
                feedback_for: is_staff ? "staff" : "student"
            },
            order: [
                ['createdAt', "DESC"]
            ]
        });

        forms = forms?.filter(form => {
            if (form?.level == 'department') {
                let dept_ids = form?.feedback_form_departments?.map(res => res?.id);
                return dept_ids?.includes(user_dept_id)
            }
            else return form
        })
        returnValue({ res, response: forms });
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.post('/answer-feedback', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { answer } = req.body;

        /*
            data:[
                {
                    question_id:number,
                    text_answer:string,
                    options_ids:number[]
                }
            ],
            form_id:number,

        */

        const user_id = req.headers['user_id'];
        let form = await FeedbackForm.findByPk(answer?.form_id, {
            include: [
                {
                    model: FeedbackQuestions,
                    as: "form_questions"
                }
            ]
        });

        let form_questions_by_id = form?.form_questions?.reduce((acc, cur) => {
            acc[cur?.id] = cur;
            return acc;
        }, {});

        let response = [];

        const createUpdateAnswer = async ({ object, type }) => {
            let options = {
                returning: true,
                transaction
            };
            if (object?.id) options['where'] = { id: object?.id };
            let method = object?.id ? "update" : "create";
            let created_record = await FeedbackAnswer[method](object, options);
            if (['dropdown-multiple', 'dropdown-single'].includes(type)) {
                if (object?.id) await AnswerOptions.destroy({ where: { feedbackAnswerId: object?.id }, transaction })
                let answer_option_payload = object?.options_ids?.map(res => ({ feedbackAnswerId: object?.id ?? created_record?.id, feedbackQuestionOptionId: res }))
                let created_option_answer = await AnswerOptions?.bulkCreate(answer_option_payload, { transaction, returning: true });
                Object.assign(created_record, { option_answer: created_option_answer })
            }
            response.push(created_record)
        }

        for (let cur of answer?.data) {
            let str_ques_id = String(cur?.question_id);
            let question = form_questions_by_id?.[str_ques_id];
            if (question) {
                let obj = {
                    ...cur,
                    feedback_form_id: answer?.form_id,
                    user_id
                };
                if (cur?.id) obj['id'] = cur?.id;
                if (['text', 'text-area'].includes(question?.type)) delete obj['options_ids']
                else delete obj['text_answer'];
                await createUpdateAnswer({ object: obj, type: question?.type })
            }
        };

        await transaction.commit();
        returnValue({ res, response: response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/user-feedback-answer/:form_id', async (req, res) => {
    try {
        const { form_id } = req.params;
        const user_id = req?.query?.user_id ?? req.headers['user_id'];

        let answer = await FeedbackAnswer.findAll({
            where: {
                feedback_form_id: form_id,
                user_id
            },
            include: [
                {
                    model: FeedbackQuestionOptions,
                    as: "options"
                }
            ]
        });

        returnValue({ res, response: answer })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/user-by-feedback/:form_id', async (req, res) => {
    try {
        const { form_id } = req.params;
        let form = await FeedbackForm.findByPk(form_id, {
            include: [
                {
                    model: FeedbackQuestions,
                    as: "form_questions",
                    attributes: ['id']
                }
            ],

        })
        let rows = await Users.findAll({
            include: [
                {
                    model: FeedbackAnswer,
                    as: "feedback_answers",
                    required: true,
                    where: {
                        feedback_form_id: form_id
                    }
                },
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['id', 'name', 'image']
                        }
                    ]
                },
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['id', 'name', 'image']
                }
            ],
            ...applyPagination({ req })
        });

        let count = await Users.count({
            include: [
                {
                    model: FeedbackAnswer,
                    as: "feedback_answers",
                    required: true,
                    where: {
                        feedback_form_id: form_id
                    },
                }
            ],
            distinct: true,  // This ensures the main model is counted distinctly
            col: 'id'  // Specify the main model column to count

        })

        returnValue({ res, response: { rows, form, count } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/question-answer/:form_id/:question_id', async (req, res) => {
    try {
        const { form_id, question_id } = req.params;
        const question = await FeedbackQuestions.findByPk(question_id, {
            include: [
                {
                    model: FeedbackQuestionOptions,
                    as: "question_options"
                }
            ]
        });
        selectionFormat({ data: question, format: [{ key: 'type', enum: "feedback_question_type" }] })
        const answers = await FeedbackAnswer.findAll({
            where: {
                question_id,
                feedback_form_id: form_id
            },
            include: [
                {
                    model: FeedbackQuestionOptions,
                    as: "options"
                },
                {
                    model: Users,
                    as: "user",
                    include: [
                        {
                            model: Student,
                            as: "student",
                            include: [
                                {
                                    model: AdmissionApplicant,
                                    as: "applicant",
                                    attributes: ['id', 'name', 'image']
                                }
                            ]
                        },
                        {
                            model: Staff,
                            as: "staff",
                            attributes: ['id', 'name', 'image']
                        }
                    ]
                }
            ]
        });

        returnValue({ res, response: { question, answers } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/form-answer/:form_id', async (req, res) => {
    try {
        const { form_id } = req.params;
        let answer = await FeedbackAnswer.findAll({
            include: [
                {
                    model: FeedbackQuestions,
                    as: "question",
                    where: {
                        type: {
                            [Op.in]: ['dropdown-multiple', 'dropdown-single']
                        }
                    },
                    attributes: ['id', 'name']
                },
                {
                    model: FeedbackQuestionOptions,
                    as: "options"
                },

            ],
            where: {
                feedback_form_id: form_id
            }
        });

        returnValue({ res, response: answer })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;