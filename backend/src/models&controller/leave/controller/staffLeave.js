const router = require('express').Router();
const { Op, ValidationError } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination, selectionFormat } = require('../../../functions/handleData');
const { enum_values } = require('../../../utils/enum');
const { StaffLeave, checkCreditFn } = require('../model/staffLeave');
const { isEmpty } = require('lodash');
const { StaffLeaveConfig } = require('../model/staffLeaveConfig');
const { Staff } = require('../../staff/model/staff');
const { Schedule, ScheduleSubstitutionStaff } = require('../../schedule/model/schedule');
const { TimeTable } = require('../../schedule/model/timetable');
const Hours = require('../../base/model/academicYear/hour');
const { makeDDMMYYYYToYYYYMMDD } = require('../../../functions/handleDate');
const { Course } = require('../../schedule/model/course');
const sequelize = require('../../../sequelize');

router.post('/leave', async (req, res) => {
    try {
        /* 
        {
            leave:{
              id : number
              reason : string
              start_date : date
              end_date : date
              start_session : forenoon | afternoon
              end_session : forenoon | afternoon
              status : draft|applied|approved|rejected
              evidence  : text
              leave_config_id : number
              staff_id: number
              }
        }
        */
        const { leave } = req.body;

        let valuesCheck = checkValuesAreExist({ start_date: leave?.start_date, end_date: leave?.end_date, start_session: leave?.start_session, end_session: leave?.end_session, leave_config_id: leave?.leave_config_id, staff_id: leave?.staff_id })
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required` });
        leave['status'] = 'applied'
        let leave_data = await StaffLeave.create(leave, { returning: true, user_id: req.headers['user_id'] });;
        returnValue({ response: leave_data, res })

    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.put('/leave/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { leave } = req.body;
        leave['id'] = id;
        let leave_data = await StaffLeave.update(leave, { where: { id }, returning: true, individualHooks: true, user_id: req.headers['user_id'] });
        returnValue({ res, response: leave_data?.[1]?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/leave', async (req, res) => {
    try {
        const staff_id = req.query?.['staff_id'];
        const leave_attributes = req?.query?.['leave_attributes']?.split(',');
        const staff_leave_config_attributes = req.query?.['staff_leave_config_attributes']?.split(',');

        let where = {};
        let response = {};

        if (staff_id) where['staff_id'] = staff_id
        const leave = await StaffLeave.findAll({
            ...!isEmpty(where) && { where },
            ...applyPagination({ req }),
            ...!isEmpty(leave_attributes) && { attributes: ['createdAt', ...leave_attributes] },
            include: [
                {
                    model: StaffLeaveConfig,
                    as: "staff_leave_config",
                    attributes: staff_leave_config_attributes
                },
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['id', 'name', 'image']
                }
            ]
        });
        selectionFormat({ data: leave, format: [{ enum: "staff_leave_status", key: "status" }] })
        response['rows'] = leave;
        response['count'] = await StaffLeave.count({
            ...!isEmpty(where) && { where },
        })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/leave/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await StaffLeave.destroy({
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
});

router.get('/leave/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await StaffLeave.findByPk(id, {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            include: [
                {
                    model: StaffLeaveConfig,
                    as: "staff_leave_config",
                },
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['id', 'name', 'image']
                }
            ]
        });

        selectionFormat({ data: leave, format: [{ enum: "staff_leave_status", key: "status" }] })
        returnValue({ res, response: leave })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/leave-apply-support-data', async (req, res) => {
    try {

        const response = {
            sessions: enum_values?.staff_leave_session,
            staff: await Staff.findAll({ where: { is_active: true }, attributes: ['id', 'name'] })
        };

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get("/taken-count/:staff_id/:leave_config_id/:start_date/:end_date/:start_session/:end_session", async (req, res) => {
    try {
        const { leave_config_id, staff_id, start_date, end_date, start_session, end_session } = req.params;
        let id = req.query['leave_id'];
        let leave_taken = await checkCreditFn({
            leave_config_id,
            dataValues: {
                start_date, end_date
            },
            start_session, end_session,
            staff_id,
            id
        })

        let total = leave_taken?.['total'] && Object.values(leave_taken?.['total'])?.reduce((acc, cur) => acc += cur);
        let added = leave_taken?.['additional_days'] && Object.values(leave_taken?.['additional_days'])?.reduce((acc, cur) => acc += cur);

        let response = {
            prev_taken_leave: total - added,
            additional: added
        }
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.get('/scheduled-hours/:staff_id/:start_date/:end_date/:start_session/:end_session', async (req, res) => {
    try {
        const { start_date, end_date, end_session, staff_id, start_session } = req.params;

        let schedules = await Schedule.findAll({
            where: {
                date: {
                    [Op.between]: [start_date, end_date]
                }
            },
            include: [
                {
                    model: TimeTable,
                    as: 'timetable',
                    required: true,
                    include: [
                        {
                            model: Staff,
                            as: "staffs",
                            where: {
                                id: staff_id
                            },
                            attributes: []
                        }, {
                            model: Hours,
                            as: "hour",
                            // order: [['sequence', 'ASC']]
                        },
                        {
                            model: Course,
                            as: 'course'
                        }
                    ]
                }
            ],
            // order: [],
            order: [
                ['date', 'ASC'],
                [
                    { model: TimeTable, }, { model: Hours, as: "hour" }, 'sequence', 'ASC'
                ]
            ],
        });

        if (start_session == 'afternoon') {
            schedules = schedules?.filter(res => {
                let rec_date = makeDDMMYYYYToYYYYMMDD(res?.date);
                if (rec_date == start_date) {
                    if (res?.timetable?.hour?.session == 'afternoon') return res
                    else return false
                }
                return res
            })
        };
        if (end_session == 'forenoon') {
            schedules = schedules?.filter(res => {
                let rec_date = makeDDMMYYYYToYYYYMMDD(res?.date);
                if (rec_date == start_date) {
                    if (res?.timetable?.hour?.session == 'forenoon') return res
                    else return false
                }
                return res
            })
        }
        selectionFormat({ data: schedules, format: [{ enum: "schedule_status", key: 'status' }] })
        returnValue({ res, response: schedules });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.post('/substitute-staff/:leave_id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /*
            {
                substitute:[
                    {schedule_id:number, staff_id:number}
                ]   
            }
        */
        const { substitute } = req.body;
        const { leave_id } = req.params;

        await ScheduleSubstitutionStaff.destroy({ transaction, where: { leave_id } });
        let payload = substitute?.map(res => {
            let valuesCheck = checkValuesAreExist({ staff_id: res?.staff_id, schedule_id: res?.schedule_id });
            if (valuesCheck) throw new ValidationError(`${valuesCheck} are required`);
            return { scheduleId: res?.schedule_id, staffId: res?.staff_id, leave_id }
        })
        let substitutions = await ScheduleSubstitutionStaff.bulkCreate(payload, { transaction, returning: true });
        await transaction.commit();
        returnValue({ res, response: substitutions });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get("/substitute-staff/:leave_id", async (req, res) => {
    try {
        const { leave_id } = req.params;
        let substitutions = await ScheduleSubstitutionStaff.findAll({
            where: { leave_id }
        })
        returnValue({ res, response: substitutions });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


module.exports = router;