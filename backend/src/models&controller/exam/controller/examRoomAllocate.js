const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { ExamRoomAllocate } = require('../model/examRoomAllocate');
const Student = require('../../student/model/student');
const AcademicYear = require('../../base/model/academicYear/academicYear');
const StudentCampusYear = require('../../student/model/campusYear');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const { ExamTimetable } = require('../model/examTimetable');
const { ExamTime } = require('../model/examTime');
const { Staff } = require('../../staff/model/staff');
const Class = require('../../department/model/class');
const { Course } = require('../../schedule/model/course');

const router = require('express').Router();

router.post('/exam-room-allocate', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {

        /* 
            {
                exam_room_allocate:{
                    exam_timetable_id:number;
                    students:[
                        {
                            row:number;
                            column:number;
                            student_id:number
                        }
                    ]
                }
            }
                 id | row | column | createdAt | updatedAt | exam_timetable_id | student_id
        */

        const { exam_room_allocate } = req.body;
        let payload = exam_room_allocate?.students?.map(res => ({ ...res, exam_timetable_id: exam_room_allocate?.exam_timetable_id }));
        let exam_data = await ExamRoomAllocate.bulkCreate(payload, { returning: true, user_id: req.headers['user_id'], transaction });
        await transaction.commit();
        returnValue({ res, response: exam_data });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/exam-room-allocate/class-students/:class_id', async (req, res) => {
    try {
        const { class_id } = req.params;
        const students = await Student.findAll({
            order: [['roll_no', 'ASC']],
            include: [
                {
                    model: StudentCampusYear,
                    as: 'campus_year',
                    where: {
                        status: 'in_progress',
                        class_id
                    }
                },
                {
                    model: AdmissionApplicant,
                    as: "applicant",
                    attributes: ['id', 'name']
                }
            ]
        });
        returnValue({ res, response: students })
    } catch (error) {
        returnValue({ res, status: 500, error })
    }
});

router.get('/already-room-allocated/:exam_room_id/:date/:exam_time_id', async (req, res) => {
    try {
        /*
             id | row | column | createdAt | updatedAt | exam_timetable_id | student_id 
        */
        const { date, exam_time_id, exam_room_id } = req.params;
        const already_allocated = await ExamRoomAllocate.findAll({
            include: [
                {
                    model: ExamTimetable,
                    as: "exam_timetable",
                    required: true,
                    where: {
                        exam_time_id,
                        exam_room_id,
                        date
                    },

                },
                {
                    model: Student,
                    as: 'student',
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        returnValue({ res, response: already_allocated });
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
})

// ============================================================== 

router.get('/get-exam-timetable/:exam_id/:exam_room_id', async (req, res) => {
    try {
        const { exam_id, exam_room_id } = req.params;
        const exam_timetable = await ExamTimetable.findAll({
            include: [
                {
                    model: ExamTime,
                    as: "exam_time"
                },
                {
                    model: Staff,
                    as: "invigilator",
                    attributes: ['id', 'name']
                },
                {
                    model: Class,
                    as: "class",
                    attributes: ['id', 'name']
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ['id', 'name']
                }
            ],
            where: {
                exam_room_id,
                exam_id
            },
        });
        returnValue({ res, response: exam_timetable })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/get-allocated-room/:exam_timetable_id', async (req, res) => {
    try {
        let { exam_timetable_id } = req.params;
        const allocated = await ExamRoomAllocate.findAll({
            where: {
                exam_timetable_id
            },
            include: [
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });
        returnValue({ res, response: allocated });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})


module.exports = router;