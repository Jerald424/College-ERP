const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const { enum_values } = require('../../../utils/enum');
const Term = require('../../base/model/academicYear/term');
const { Exam } = require('../model/exam');
const sequelize = require('../../../sequelize');
const { isEmpty } = require('lodash');
const Class = require('../../department/model/class');
const { ExamConfig } = require('../model/examConfig');

const router = require('express').Router();

router.post('/exam', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            {
                exam:{
                    name:string;
                    type:string;
                    class_ids:number[];
                    exam_config_id:number
                }
            }
        */

        const { exam } = req.body;
        let response = {};
        let exam_data = await Exam.create(exam, { returning: true, user_id: req.headers['user_id'], transaction })
        Object.assign(response, exam_data?.dataValues)
        // if (!isEmpty(exam?.class_ids)) {
        //     let class_payload = exam?.class_ids?.map(res => ({ examId: exam_data?.id, classId: res }))
        //     let classes = await ExamClass.bulkCreate(class_payload, { transaction, returning: true });
        //     response['classes'] = classes;
        // }
        await transaction.commit();
        returnValue({ res, response });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.put('/exam/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            {
                exam:{
                    name:string;
                    type:string;
                    class_ids:number[]
                }
            }
        */

        const { id } = req.params;
        const { exam } = req.body;
        let response = {}
        const [count, updated] = await Exam.update(exam, { where: { id }, returning: true, individualHooks: true, user_id: req.headers['user_id'], transaction });
        Object.assign(response, updated?.[0]?.dataValues);
        // await ExamClass.destroy({
        //     where: {
        //         examId: id
        //     },
        //     transaction
        // });
        // if (!isEmpty(exam?.class_ids)) {
        //     let class_payload = exam?.class_ids?.map(res => ({ examId: id, classId: res }))
        //     let classes = await ExamClass.bulkCreate(class_payload, { transaction, returning: true });
        //     response['classes'] = classes;
        // };
        await transaction.commit();
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/exam', async (req, res) => {
    try {
        let response = {};
        let include = [
            {
                model: ExamConfig,
                as: "exam_config",
                attributes: ['id', 'name']
            }
        ];
        const exams = await Exam.findAll({
            ...applyPagination({ req }),
            include
        });
        selectionFormat({ data: exams, format: [{ enum: "exam_type", key: "type" }] })
        response['rows'] = exams;
        response['count'] = await Exam.count()
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/exam/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await Exam.destroy({
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

router.get('/exam/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Exam.findByPk(id, {

        });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.get('/exam-create-support-data', async (req, res) => {
    try {
        const response = {
            type: enum_values?.exam_type,
            exam_config: await ExamConfig.findAll({
                attributes: ['id', 'name']
            })
        };

        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});


module.exports = router;