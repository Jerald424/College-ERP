const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const { ExamTimetable } = require('../model/examTimetable');
const User = require('../../base/user/model/user');
const { Exam } = require('../model/exam');
const { Course } = require('../../schedule/model/course');
const Class = require('../../department/model/class');
const { ExamRoom } = require('../model/examRoom');
const { Staff } = require('../../staff/model/staff');
const { ExamTime } = require('../model/examTime');
const { ExamRoomAllocate } = require('../model/examRoomAllocate');
const Student = require('../../student/model/student');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const isArray = require('lodash/isArray');
const { ExamTimetableStudentAttendance } = require('../model/studentAttendance');
const sequelize = require('../../../sequelize');
const { Op } = require('sequelize');

const router = require('express').Router();

router.get('/schedules', async (req, res) => {
    try {
        let exam_id = req.query?.['exam_id'];
        let where = {};
        let include = [{
            model: Exam,
            as: "exam",
        },
        {
            model: Course,
            as: "course",
            attributes: ['id', 'name'],
        },
        {
            model: Class,
            as: "class",
            attributes: ['id', 'name', 'acronym']
        },
        {
            model: ExamRoom,
            as: 'exam_room',
            attributes: ['id', 'name']
        },
        {
            model: Staff,
            as: "invigilator",
            attributes: ['id', 'name']
        },
        {
            model: ExamTime,
            as: "exam_time",
            attributes: ['id', 'name']
        }
        ];
        if (exam_id) where['exam_id'] = exam_id;
        else {
            let user = await User.findByPk(req.headers['user_id']);
            if (!user?.staff_id) return returnValue({ res, error: "Staff not found", status: 401 });

            include[0]['where'] = {
                is_active: true
            };
            let staff_courses = await Course.findAll({
                include: [
                    {
                        model: Staff,
                        as: "staffs",
                        where: {
                            id: user?.staff_id
                        }
                    }
                ],
                attributes: ['id']
            });
            let course_ids = staff_courses?.map(res => res?.id);
            console.log('course_ids: ', course_ids);
            include[0]['required'] = true;
            where[Op.or] = [
                { '$invigilator.id$': user?.staff_id },
                {
                    '$course.id$':
                    {
                        [Op.in]: course_ids
                    }
                }
            ];
        }

        let schedules = await ExamTimetable.findAll({
            where,
            include,
            ...applyPagination({ req })
        });
        let response = {};
        response['rows'] = schedules;
        response['count'] = await ExamTimetable.count({
            where,
            include
        })
        returnValue({ res, response });
    } catch (error) {
        console.log('error: ', error);
        returnValue({ res, error, status: 500 });
    }
});

router.get("/schedules-count/:exam_id", async (req, res) => {
    try {
        const { exam_id } = req.params;
        const count = await ExamTimetable.count({
            where: {
                exam_id
            }
        });
        returnValue({ res, response: { count } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/schedules/student-list/:exam_timetable_id', async (req, res) => {
    try {
        const { exam_timetable_id } = req.params;
        const response = await Student.findAll({
            include: [
                {
                    model: ExamRoomAllocate,
                    as: "exam_room_allocate",
                    required: true,
                    where: {
                        exam_timetable_id
                    },
                    attributes: []
                },
                {
                    model: AdmissionApplicant,
                    as: "applicant",
                    attributes: ['id', 'name', 'image', 'gender']
                }
            ],
            order: [['roll_no', 'ASC']]
        });
        response?.forEach((_, index) => {
            selectionFormat({ data: response[index]?.applicant, format: [{ enum: "gender", key: "gender" }] })
        })
        returnValue({ res, response })

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.post('/update-attendance/:exam_timetable_id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /*
            {
                attendance:{
                    present:number[];
                    absent:number[];
                }
            }
        */
        const { exam_timetable_id } = req.params;
        const { attendance } = req.body;
        let payload = [];
        let present = attendance?.present?.map(id => ({ is_present: true, student_id: id, exam_timetable_id }));
        let absent = attendance?.absent?.map(id => ({ is_present: false, student_id: id, exam_timetable_id }));
        if (isArray(present)) payload?.push(...present);
        if (isArray(absent)) payload?.push(...absent);
        await ExamTimetable.update({ is_attendance_marked: true }, { where: { id: exam_timetable_id, is_attendance_marked: false }, transaction })
        await ExamTimetableStudentAttendance.destroy({
            where: {
                exam_timetable_id
            }
        });
        let exam_attendance = await ExamTimetableStudentAttendance.bulkCreate(payload, { transaction });
        await transaction.commit();
        returnValue({ res, response: exam_attendance });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, status: 500, error })
    }
});

router.get('/attendance/:exam_timetable_id', async (req, res) => {
    try {
        const { exam_timetable_id } = req.params;
        const response = await ExamTimetableStudentAttendance.findAll({
            where: {
                exam_timetable_id
            }
        });

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

module.exports = router