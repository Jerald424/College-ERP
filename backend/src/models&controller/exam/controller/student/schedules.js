const { Op } = require('sequelize');
const { returnValue, selectionFormat } = require('../../../../functions/handleData');
const Users = require('../../../base/user/model/user');
const { Exam } = require('../../model/exam');
const { ExamRoomAllocate } = require('../../model/examRoomAllocate');
const { ExamTimetable } = require('../../model/examTimetable');
const isEmpty = require('lodash/isEmpty');
const { ExamTimetableStudentAttendance } = require('../../model/studentAttendance');
const { ExamTime } = require('../../model/examTime');
const { ExamRoom } = require('../../model/examRoom');
const { Staff } = require('../../../staff/model/staff');
const { Course } = require('../../../schedule/model/course');
const { ExamMarkEntry } = require('../../model/examMarkEntry');
const { ExamConfig } = require('../../model/examConfig');

const router = require('express').Router();

router.get('/student-schedules', async (req, res) => {
    try {
        const user = await Users.findByPk(req.headers['user_id']);
        if (!user?.student_id) return returnValue({ res, status: 400, error: "No student found" });
        let active_exam = await Exam.findOne(
            {
                where: { is_active: true },
                include: [
                    {
                        model: ExamTimetable,
                        as: "exam_timetable",
                        attributes: ['id']
                    },
                    {
                        model: ExamConfig,
                        as: "exam_config"
                    }
                ]
            })
        if (!active_exam) return returnValue({ res, status: 400, error: "No active exam found" });
        let schedule_ids = active_exam?.exam_timetable?.map(res => res?.id)
        if (isEmpty(schedule_ids)) return returnValue({ res, error: "No schedules found", status: 400 });

        let allocated = await ExamRoomAllocate.findAll({
            where: {
                exam_timetable_id: {
                    [Op.in]: schedule_ids
                },
                student_id: user?.student_id
            },
            include: [
                {
                    model: ExamTimetable,
                    as: "exam_timetable",
                    include: [
                        {
                            model: ExamTimetableStudentAttendance,
                            as: "exam_student_attendance",
                            where: {
                                student_id: user?.student_id
                            },
                            attributes: ['is_present'],
                            required: false
                        },
                        {
                            model: ExamTime,
                            as: "exam_time"
                        },
                        {
                            model: ExamRoom,
                            as: "exam_room"
                        },
                        {
                            model: Staff,
                            as: "invigilator",
                            attributes: ['id', 'name']
                        },
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'name']
                        },
                        {
                            model: ExamMarkEntry,
                            as: "exam_mark",
                            required: false,
                            where: {
                                student_id: user?.student_id
                            }
                        }
                    ]
                }
            ]
        })
        selectionFormat({ data: active_exam, format: [{ enum: "exam_type", key: "type" }] });
        let allocated_result = [];
        for (let all of allocated) {
            let object = all.toJSON();
            Object.assign(object?.exam_timetable, { is_present: object?.exam_timetable?.exam_student_attendance?.[0]?.is_present });
            object['exam_timetable']['exam_mark'] = object.exam_timetable?.exam_mark?.[0]
            delete object?.exam_timetable?.exam_student_attendance
            allocated_result?.push(object)
        };

        returnValue({ res, response: { exam: active_exam, allocated: allocated_result } });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/student-schedule/:id', async (req, res) => {
    try {
        const user = await Users.findByPk(req.headers['user_id']);
        if (!user?.student_id) return returnValue({ res, status: 400, error: "No student found" });
        const { id } = req.params;
        let allocated = await ExamRoomAllocate.findByPk(id, {
            include: [
                {
                    model: ExamTimetable,
                    as: "exam_timetable",
                    include: [
                        {
                            model: ExamTimetableStudentAttendance,
                            as: "exam_student_attendance",
                            where: {
                                student_id: user?.student_id
                            },
                            attributes: ['is_present'],
                            required: false
                        },
                        {
                            model: ExamTime,
                            as: "exam_time"
                        },
                        {
                            model: ExamRoom,
                            as: "exam_room"
                        },
                        {
                            model: Staff,
                            as: "invigilator",
                            attributes: ['id', 'name']
                        },
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'name']
                        },
                        {
                            model: Exam,
                            as: "exam",
                            include: [
                                {
                                    model: ExamConfig,
                                    as: "exam_config"
                                }
                            ]
                        },
                        {
                            model: ExamMarkEntry,
                            as: "exam_mark",
                            required: false,
                            where: {
                                student_id: user?.student_id
                            }
                        }
                    ]
                }
            ]
        });

        allocated = allocated.toJSON();
        Object.assign(allocated?.exam_timetable, { is_present: allocated?.exam_timetable?.exam_student_attendance?.[0]?.is_present })
        delete allocated?.exam_timetable?.exam_student_attendance;
        allocated['exam_timetable']['exam_mark'] = allocated['exam_timetable']['exam_mark']?.[0] || {}
        selectionFormat({ data: allocated?.exam_timetable?.exam, format: [{ enum: "exam_type", key: "type" }] });
        returnValue({ res, response: allocated });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


router.get('/student-schedules/ids', async (req, res) => {
    try {
        const user = await Users.findByPk(req.headers['user_id'], { attributes: ['id', 'student_id'] });
        if (!user?.student_id) return returnValue({ res, status: 400, error: "No student found" });

        let active_exam = await Exam.findOne(
            {
                where: { is_active: true },
                include: [
                    {
                        model: ExamTimetable,
                        as: "exam_timetable",
                        attributes: ['id']
                    }
                ]
            });

        if (!active_exam) return returnValue({ res, status: 400, error: "No active exam found" });
        let schedule_ids = active_exam?.exam_timetable?.map(res => res?.id)
        if (isEmpty(schedule_ids)) return returnValue({ res, error: "No schedules found", status: 400 });

        let allocated = await ExamRoomAllocate.findAll({
            where: {
                exam_timetable_id: {
                    [Op.in]: schedule_ids
                },
                student_id: user?.student_id
            },
            attributes: ['id']
        })
        // let ids = allocated?.map(res => res?.id);
        returnValue({ res, response: allocated });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;