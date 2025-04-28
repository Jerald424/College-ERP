const router = require('express').Router();
const { returnValue, selectionFormat, applyPagination } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const Users = require('../../base/user/model/user');
const { Staff } = require('../../staff/model/staff');
const Student = require('../../student/model/student');
const { BusScheduleAttendance } = require('../model/attendance');
const { BusSchedules } = require('../model/busSchedules');
const { BusSessions } = require('../model/busSessions');

router.post("/attendance", async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            {
                attendance:{
                    user:[]{user_id:number, status:<present|absent>};
                    schedule_id:number
                }
            }
        */
        const { attendance } = req.body;
        let schedule_count = await BusSchedules.count({
            where: {
                is_entered: true,
                id: attendance?.schedule_id
            }
        });
        if (!(schedule_count > 0)) await BusSchedules.update({ is_entered: true }, { where: { id: attendance?.schedule_id } });
        let response = [];
        const attendance_payload = [];
        for (let user of attendance?.user) {
            if (user?.id) {
                let attendance = await BusScheduleAttendance.update(user, {
                    where: {
                        id: user?.id
                    },
                    transaction
                })
                response?.push(attendance)
            }
            else attendance_payload?.push(Object.assign(user, { schedule_id: attendance?.schedule_id }))
        }
        const created = await BusScheduleAttendance.bulkCreate(attendance_payload, { returning: true, transaction });
        response?.push(...created)
        await transaction.commit();
        returnValue({ res, response })

    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/attendance-passengers/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        let bus_session = await BusSessions.findByPk(session_id, {
            include: [
                {
                    model: Users,
                    as: "passengers",
                    include: [
                        {
                            model: Student,
                            as: "student",
                            include: [
                                {
                                    model: AdmissionApplicant,
                                    as: 'applicant',
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
        })

        returnValue({ res, response: bus_session?.passengers })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/attendance/:schedule_id', async (req, res) => {
    try {
        const { schedule_id } = req.params;
        const response = await BusScheduleAttendance.findAll({
            where: {
                schedule_id
            }
        });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get("/session-to-bus/:session_id", async (req, res) => {
    try {
        const { session_id } = req.params;
        const session = await BusSessions.findByPk(session_id)
        returnValue({ res, response: { bus_id: session?.bus_id } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;