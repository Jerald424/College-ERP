const { ExamResult } = require('../model/examResult');
const router = require('express').Router();
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const { Exam } = require('../model/exam')
const { ExamTimetable } = require('../model/examTimetable')
const { ExamMarkEntry } = require('../model/examMarkEntry');
const { Course } = require('../../schedule/model/course');
const sequelize = require('../../../sequelize');
const Student = require('../../student/model/student');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const User = require('../../base/user/model/user');
const { ExamConfig } = require('../model/examConfig');


router.get('/conducted-exams/:exam_config_id', async (req, res) => {
    try {
        const { exam_config_id } = req.params;
        const exams = await Exam.findAll({
            attributes: ['id', 'name', 'type'],
            where: {
                exam_config_id
            },
            include: [
                {
                    model: ExamTimetable,
                    as: "exam_timetable",
                    include: [
                        {
                            model: ExamMarkEntry,
                            as: "exam_mark",
                            include: [
                                {
                                    model: Student,
                                    as: "student",
                                    attributes: ['id', 'roll_no'],
                                    include: [
                                        {
                                            model: AdmissionApplicant,
                                            as: "applicant",
                                            attributes: ['id', 'name']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: Course,
                            as: "course",
                            attributes: ['id', 'name']
                        }
                    ],
                    attributes: ['id']
                }
            ],
        });
        exams?.forEach((_, index) => {
            selectionFormat({ data: exams?.[index], format: [{ enum: "exam_type", key: "type" }] });
        })
        returnValue({ res, response: exams })

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.post('/update-exam-result', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
         id | internal_mark | external_mark | createdAt | updatedAt | student_id | exam_config_id | course_id
            {
                exam_result:{
                    exam_config_id:number;
                    student:[
                        {
                            student_id:number;
                            course_id:number;
                            internal_mark:number;
                            external_mark:number
                        }
                    ]
                }
            }
        */
        let response = {
            marks: []
        };
        const { exam_result } = req.body;
        for (let student of exam_result?.student) {
            let payload = {
                exam_config_id: exam_result?.exam_config_id,
                ...student
            };
            let [mark, created] = await ExamResult.upsert(payload, {
                conflictFields: ['exam_config_id', 'student_id', 'course_id'],
                returning: true,
                transaction
            });
            let json = mark.toJSON();
            json['created'] = created
            response['marks'].push(json)
        };
        await transaction.commit();
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/exam-result-list/:exam_config_id', async (req, res) => {
    try {
        const { exam_config_id } = req.params;
        let response = {};
        const exam_result = await ExamResult.findAll({
            where: {
                exam_config_id
            },
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: ['id', 'name']
                },
                {
                    model: Student,
                    as: 'student',
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['id', 'name']
                        },
                    ]
                }
            ],
            ...applyPagination({ req })
        });
        response['count'] = await ExamResult.count({
            where: {
                exam_config_id
            }
        });

        response['rows'] = exam_result;
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.get('/exam-result-list-ids/:exam_config_id', async (req, res) => {
    try {
        const { exam_config_id } = req.params;
        let ids = await ExamResult.findAll({
            where: {
                exam_config_id
            },
            attributes: ['id'],
            order: [['createdAt', 'DESC']],

        });
        returnValue({ res, response: ids })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/exam-result/:exam_config_id', async (req, res) => {
    try {
        const { exam_config_id } = req.params;
        const exam_result = await ExamResult.findAll({
            where: {
                exam_config_id
            },

        });
        returnValue({ res, response: exam_result })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.get('/student-result', async (req, res) => {
    try {
        const user_id = req.headers['user_id'];
        let user = await User.findByPk(user_id);
        const active_exam_config = await ExamConfig.findOne({
            where: {
                is_active: true
            },
            include: [
                {
                    model: ExamResult,
                    as: "exam_result",
                    where: {
                        student_id: user?.student_id
                    },
                    required: false,
                    include: [
                        {
                            model: Course,
                            as: "course"
                        }
                    ]
                }
            ]
        });
        if (!active_exam_config) return returnValue({ res, status: 200, error: "No active exam config found" })
        returnValue({ res, response: active_exam_config });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;