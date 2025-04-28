const { returnValue, applyPagination, selectionFormat, checkValuesAreExist } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { isEmpty, isArray } = require('lodash');
const { Schedule, ScheduleStudent, ScheduleSubstitutionStaff } = require('../model/schedule');
const { TimeTable } = require('../model/timetable');
const Class = require('../../department/model/class');
const Term = require('../../base/model/academicYear/term');
const { Course } = require('../model/course');
const { Staff } = require('../../staff/model/staff');
const { Op } = require('sequelize');
const Hours = require('../../base/model/academicYear/hour');
const User = require('../../base/user/model/user');
const Student = require('../../student/model/student');
const StudentCampusYear = require('../../student/model/campusYear');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const AcademicYear = require('../../base/model/academicYear/academicYear');
const { Calender } = require('../model/calender');

const router = require('express').Router();

router.post('/schedule', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {

        /* 
            schedules:{
                schedule:[
                    {
                        date:string,
                        timetable_ids:number[]                     
                    }
                ]
            }
        */
        const { schedules } = req.body;
        if (isEmpty(schedules?.schedule)) return returnValue({ res, status: 400, error: "No schedule found." });
        let sch_rec = schedules?.schedule?.reduce((acc, cur) => {
            if (isArray(cur?.timetable_ids)) cur?.timetable_ids?.forEach(tt => {
                acc.push({ date: cur?.date, timetable_id: tt });
            })
            return acc;
        }, []);
        console.log('#############', sch_rec)
        let response = await Schedule.bulkCreate(sch_rec, { transaction, user_id: req?.headers?.['user_id'], returning: true });
        console.log('############### SCHEDULE CREATED SUCCESSFULLY #################')
        await transaction.commit();
        returnValue({ res, response })
    } catch (error) {
        console.log('error: ', error);
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/check-schedule/:class_id/:term_id', async (req, res) => {
    try {
        const { class_id, term_id } = req.params;
        const response = await Schedule.findAll({
            // attributes:['id', 'date', ''],
            include: [
                {
                    model: TimeTable,
                    as: "timetable",
                    where: {
                        term_id
                    },
                    required: true,
                    attributes: [],
                    include: [
                        {
                            model: Class,
                            as: 'classes',
                            where: {
                                id: class_id
                            },
                            required: true,
                            attributes: [],

                        }
                    ]
                }
            ]
        });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/schedules/:term_id', async (req, res) => {
    try {
        const { term_id } = req.params;
        let response = {};
        response['count'] = await Schedule.count({
            include: [
                {
                    model: TimeTable,
                    as: "timetable",
                    required: true,
                    include: [
                        {
                            model: Term,
                            as: "term",
                            attributes: [],
                            where: {
                                id: term_id
                            },
                            required: true
                        },

                    ]
                }
            ],
        })

        const schedules = await Schedule.findAll({
            include: [
                {
                    model: TimeTable,
                    as: "timetable",
                    required: true,
                    include: [
                        {
                            model: Term,
                            as: "term",
                            attributes: [],
                            where: {
                                id: term_id
                            },
                            required: true
                        },
                        {
                            model: Class,
                            as: "classes",
                            required: true,
                        },
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'name', 'code']
                        },
                        {
                            model: Staff,
                            as: "staffs",
                            attributes: ['id', 'name']
                        },
                        {
                            model: Hours,
                            as: "hour",
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            ...applyPagination({ req }),
            order: [['date', 'DESC']]
        });

        schedules?.forEach(sch => {
            selectionFormat({ data: sch, format: [{ enum: "schedule_status", key: "status" }] });
            selectionFormat({ data: sch?.timetable, format: [{ enum: "timetable_day", key: "day" }] });


        });
        response['rows'] = schedules;
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/schedule/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await Schedule.destroy({
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

router.get('/schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const schedules = await Schedule.findByPk(id, {
            include: [
                {
                    model: TimeTable,
                    as: "timetable",
                    include: [
                        {
                            model: Term,
                            as: "term",
                        },
                        {
                            model: Class,
                            as: "classes",
                        },
                        {
                            model: Course,
                            as: 'course',
                        },
                        {
                            model: Staff,
                            as: "staffs",
                        },
                        {
                            model: Hours,
                            as: "hour",
                        }
                    ]
                },
                {
                    model: Staff,
                    as: "substitute_staffs",
                    attributes: ['id', 'name']
                }
            ]
        });
        selectionFormat({ data: schedules?.timetable, format: [{ enum: "timetable_day", key: "day" }] });
        selectionFormat({ data: schedules, format: [{ enum: "schedule_status", key: "status" }] });

        returnValue({ res, response: schedules });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/my-schedules/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const user_id = req.headers['user_id'];
        const user = await User.findByPk(user_id, {
            include: [
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['id'],
                    include: [
                        {
                            model: Class,
                            as: "classes",
                            attributes: ['id'],

                        }
                    ]
                }
            ]
        });

        let schedules = await Schedule.findAll({
            attributes: ['id', 'status',
                [sequelize.literal(`(SELECT count(*) from schedule_student where "scheduleId" = schedule.id AND status = 'absent' )`), 'absent_count'],
                [sequelize.literal(`(SELECT count(*) from schedule_student where "scheduleId" = schedule.id AND status = 'present' )`), 'present_count'],
            ],
            where: {
                date,
                [Op.or]: [
                    { '$timetable.staffs.id$': user?.staff_id },
                    { '$substitute_staffs.id$': user?.staff_id },
                ]
            },
            order: [
                [
                    { model: TimeTable, }, { model: Hours, as: "hour" }, 'sequence', 'ASC'
                ]
            ],
            include: [
                {
                    attributes: ['id', 'day'],
                    model: TimeTable,
                    as: "timetable",
                    required: true,
                    include: [
                        {
                            model: Class,
                            as: "classes",
                            attributes: ['id', 'name', 'acronym']
                        },
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'name', 'code']
                        },
                        {
                            model: Staff,
                            as: "staffs",
                            // // where: {
                            // //     id: user?.staff_id,
                            // // },
                            // required: true,
                            attributes: ['id', 'name', 'code']
                        },
                        {
                            model: Hours,
                            as: "hour",
                            attributes: ['id', 'name', 'time_from', 'time_to', 'sequence', 'type']
                        }
                    ]
                },
                {
                    model: Staff,
                    as: "substitute_staffs",
                    attributes: [
                        'id', 'name'
                    ]
                }
            ],
        });
        if (isEmpty(schedules) && !isEmpty(user?.staff?.classes)) {
            let calender = await Calender.findOne({
                where: {
                    date,
                },
                include: [
                    {
                        model: Class,
                        as: "classes",
                        required: true,
                        where: {
                            id: {
                                [Op.in]: user?.staff?.classes?.map(res => res?.id)
                            }
                        },
                        attributes: []
                    }
                ]
            });
            return returnValue({ res, response: { calender } })
        }
        selectionFormat({ data: schedules, format: [{ enum: 'schedule_status', key: "status" }] })
        returnValue({ res, response: schedules })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/students/:schedule_id', async (req, res) => {
    try {
        const { schedule_id } = req.params;
        const schedule = await Schedule.findByPk(schedule_id, {
            include: [
                {
                    model: TimeTable,
                    as: 'timetable',
                    required: true,
                    include: [
                        {
                            model: Class,
                            as: "classes",
                            required: true
                        }
                    ]
                }
            ]
        });
        let class_ids = schedule?.timetable?.classes?.map(res => res?.id);
        let students = await Student.findAll({
            include: [
                {
                    model: StudentCampusYear,
                    as: "campus_year",
                    required: true,
                    attributes: ['id'],
                    where: {
                        status: 'in_progress',
                        class_id: {
                            [Op.in]: class_ids
                        }
                    },
                    include: [
                        {
                            model: Class,
                            as: "class"
                        }
                    ],
                },
                {
                    model: AdmissionApplicant,
                    as: "applicant",
                    attributes: ['id', 'name', 'image', 'gender']
                }
            ]
        })
        let val = students?.map((student) => {
            let tmp = { ...student?.dataValues };
            tmp['class'] = tmp?.campus_year?.[0]?.class;
            selectionFormat({ data: tmp?.applicant, format: [{ enum: "gender", key: "gender" }] })
            delete tmp?.['campus_year'];
            return tmp
        })
        returnValue({ res, response: val })

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.post('/update-attendance/:schedule_id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { schedule_id } = req.params;
        /*
            {
                students:[
                    {
                        status:enum('present'| 'absent'),
                        student_id:number
                    }
                ]
            }
        */
        const { students } = req.body;
        let payload = students?.map((std) => {
            let valuesCheck = checkValuesAreExist({ student_id: std?.student_id, status: std?.status });
            if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are missing` })
            return {
                status: std?.status,
                studentId: std?.student_id,
                scheduleId: schedule_id
            }
        });
        await Schedule.update({ status: 'marked' }, {
            where: {
                id: schedule_id,
                status: {
                    [Op.eq]: 'not_marked'
                },
            },
            transaction
        })
        await ScheduleStudent.destroy({ where: { scheduleId: schedule_id }, transaction });
        let response = await ScheduleStudent.bulkCreate(payload, { transaction });
        await transaction.commit();
        returnValue({ res, response });

    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/attendance/:schedule_id', async (req, res) => {
    try {
        const { schedule_id } = req.params;
        const students = await ScheduleStudent.findAll({
            where: {
                scheduleId: schedule_id
            }
        });
        selectionFormat({ data: students, format: [{ enum: 'schedule_student_status', key: 'status' }] });
        returnValue({ res, response: students })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/student-my-schedules/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const user = await User.findByPk(req.headers['user_id'], {
            include: [
                {
                    model: Student,
                    as: "student",
                    required: true,
                    include: [
                        {
                            model: StudentCampusYear,
                            as: 'campus_year',
                            required: true,
                            include: [
                                {
                                    model: AcademicYear,
                                    as: "academic_year",
                                    required: true,
                                    where: {
                                        start_date: {
                                            [Op.lte]: date
                                        },
                                        end_date: {
                                            [Op.gte]: date
                                        }
                                    },
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        let class_id = user?.student?.campus_year?.[0]?.class_id
        if (isEmpty(user?.student?.campus_year) || !class_id) return returnValue({ res, status: 400, error: "No active class found" });

        let schedules = await Schedule.findAll({
            attributes: ['id', 'status', 'date',],
            where: {
                date
            },

            order: [
                [
                    { model: TimeTable, }, { model: Hours, as: 'hour' }, 'sequence', 'ASC'
                ]
            ],
            include: [
                {
                    attributes: ['id', 'day'],
                    model: TimeTable,
                    as: "timetable",
                    required: true,
                    include: [
                        {
                            model: Class,
                            as: "classes",
                            required: true,
                            where: {
                                id: class_id
                            }
                        },
                        {
                            model: Course,
                            as: "course"
                        },
                        {
                            model: Hours,
                            as: "hour",

                        },
                        {
                            model: Staff,
                            as: "staffs",
                            attributes: ['id', 'name', 'code']
                        }
                    ]
                },
                {
                    model: Student,
                    as: 'students',
                    attributes: ['id'],
                    required: false,
                    where: {
                        id: user?.student?.id,

                    }
                }
            ]
        });

        if (isEmpty(schedules) && class_id) {
            let calender = await Calender.findOne({
                where: { date },
                include: [
                    {
                        model: Class,
                        as: "classes",
                        attributes: [],
                        where: { id: class_id }
                    }
                ]
            });
            return returnValue({ res, response: { calender } })
        }

        let response = schedules?.map?.(schedule => {
            let obj = { ...schedule?.dataValues };
            selectionFormat({ data: obj?.timetable, format: [{ enum: 'timetable_day', key: 'day' }] });
            obj['timetable']['class'] = obj?.timetable?.classes?.[0];
            obj['attendance_status'] = obj?.['students']?.[0]?.['schedule_student']?.status;
            selectionFormat({
                data: obj, format: [
                    { enum: 'schedule_status', key: 'status' },
                    { enum: 'schedule_student_status', key: 'attendance_status' },
                ]
            });
            delete obj['students'];
            delete obj['timetable']['classes']
            return obj

        })

        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, status: 500, error })
    }
})

module.exports = router;



