const router = require('express').Router();
const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const Class = require('../../department/model/class');
const { Course } = require('../../schedule/model/course');
const { Staff } = require('../../staff/model/staff');
const { Exam } = require('../model/exam');
const { ExamRoom } = require('../model/examRoom');
const { ExamTimetable, ExamTimetableClass, ExamTimetableCourse } = require('../model/examTimetable');
const { isEmpty } = require('lodash');
const { ExamTime } = require('../model/examTime');
const { ExamConfig } = require('../model/examConfig');

router.post('/exam-timetable', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {

        /*
            {
                exam_timetable:{
                    date_from:datetime;
                    date_to: datetime;
                    exam_id: number;
                    course_id:number;
                    exam_room_id:number;
                    class_id:number;
                    staff_id:number
                }
            }
        */

        let response = {};
        const { exam_timetable } = req.body;
        const exam_timetable_data = await ExamTimetable.create(exam_timetable, { transaction, user_id: req?.headers['user_id'] });
        Object.assign(response, exam_timetable_data?.dataValues);

        await transaction.commit();
        returnValue({ res, response });

    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.put('/exam-timetable/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /*
              {
                  exam_timetable:{
                      date_from:datetime;
                      date_to: datetime;
                      exam_id: number;
                      course_id:number;
                      exam_room_id:number;
                      class_id:number;
                      staff_id:number
                  }
              }
                */

        let response = {};
        const { id } = req.params;
        const { exam_timetable } = req.body;
        const [count, update] = await ExamTimetable.update(exam_timetable, {
            where: { id },
            transaction,
            user_id: req?.headers['user_id'],
            returning: true
        });
        Object.assign(response, update?.[0]?.dataValues);

        await transaction.commit();
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 });
    }
});

router.get('/exam-timetable', async (req, res) => {
    try {
        let response = {};
        const timetable = await ExamTimetable.findAll({
            ...applyPagination({ req }),
            include: [
                {
                    model: Class,
                    as: "class",
                    attributes: ['id', 'name', 'acronym']
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ['id', 'name']
                },
                {
                    model: Exam,
                    as: 'exam',
                    attributes: ['id', 'name'],

                }, {
                    model: ExamRoom,
                    as: "exam_room",
                    attributes: ['id', 'name']
                }, {
                    model: Staff,
                    as: "invigilator",
                    attributes: ['id', 'name']
                },
                {
                    model: ExamTime,
                    as: "exam_time"
                }
            ]
        });
        response['rows'] = timetable;
        response['count'] = await ExamTimetable.count();
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/exam-timetable/ids', async (req, res) => {
    try {
        let ids = await ExamTimetable.findAll({
            attributes: ['id', "createdAt"],
            order: [['createdAt', 'DESC']],

        })
        returnValue({ res, response: ids })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/exam-timetable/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await ExamTimetable.findByPk(id, {
            include: [
                {
                    model: Class,
                    as: "class",
                    attributes: ['id', 'name']
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Staff,
                            as: "staffs",
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: Exam,
                    as: 'exam',
                    // attributes: ['id', 'name'],
                    include: [
                        {
                            model: ExamConfig,
                            as: "exam_config"
                        }
                    ]
                }, {
                    model: ExamRoom,
                    as: "exam_room",
                    attributes: ['id', 'name']
                }, {
                    model: Staff,
                    as: "invigilator",
                    attributes: ['id', 'name']
                }
            ]
        });
        selectionFormat({ data: response?.exam, format: [{ enum: "exam_type", key: "type" }] })
        returnValue({ res, response });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


router.delete('/exam-timetable/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await ExamTimetable.destroy({
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

router.get('/exam-timetable-support-data', async (req, res) => {
    try {
        const response = {
            exam: await Exam.findAll({
                attributes: ['id', 'name']
            }),
            course: await Course.findAll({
                attributes: ['id', 'name'],
                include: [
                    {
                        model: Class,
                        as: "classes",
                        attributes: ['id', 'name']
                    }
                ]
            }),
            exam_room: await ExamRoom.findAll({
                attributes: ['id', 'name', 'row', 'column']
            }),
            staff: await Staff.findAll({
                attributes: ['id', 'name'],
                where: { is_active: true }
            }),
            class: await Class.findAll({
                attributes: ['id', 'name']
            }),
            exam_time: await ExamTime.findAll()
        };

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;