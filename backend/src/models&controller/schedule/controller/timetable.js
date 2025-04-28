const router = require('express').Router();
const { Op } = require('sequelize');
const { returnValue, applyPagination, checkValuesAreExist } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const Class = require('../../department/model/class');
const { Staff } = require('../../staff/model/staff');
const { Course } = require('../model/course');
const { TimeTable, TimeTableStaff, TimeTableClass } = require('../model/timetable');
const { isEmpty } = require('lodash');

router.post('/timetable', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /*
            timetable:{
            hours:[
                {
                    id:number;
                    hour_id:number,
                    course_id:number,
                    staff_ids:number[],
                    class_ids:number[],
                    day:string
                }
            ],
            term_id:number
    }
            */
        const { timetable } = req.body;
        let response = [];

        for (let x in timetable?.hours) {
            let tt = timetable?.hours[x];
            let method = tt?.id ? 'update' : 'create';
            let timetable_record = await TimeTable[method]({
                hour_id: tt?.hour_id,
                course_id: tt?.course_id,
                day: tt?.day,
                term_id: timetable?.term_id,
            }, {
                transaction,
                returning: true,
                user_id: req?.['headers']?.user_id,
                ...tt?.id && { where: { id: tt?.id } },
                class_ids: tt?.class_ids,
                individualHooks: true
            });

            if (tt?.id) timetable_record = timetable_record?.[1]?.[0];
            response?.push(Object.assign(timetable_record?.dataValues, { staffs: [], classes: [] }));
            await TimeTableStaff.destroy({ where: { timetableId: timetable_record?.id }, transaction });
            await TimeTableClass.destroy({ where: { timetableId: timetable_record?.id }, transaction });

            if (!isEmpty(tt?.staff_ids)) {
                let staffs = await TimeTableStaff.bulkCreate(tt?.staff_ids?.map(res => ({ staffId: res, timetableId: timetable_record?.id })), { transaction, returning: true });
                Object.assign(response[x], { staffs })
            }
            if (!isEmpty(tt?.class_ids)) {
                let classes = await TimeTableClass.bulkCreate(tt?.class_ids?.map(res => ({ classId: res, timetableId: timetable_record?.id })), { transaction, returning: true });
                Object.assign(response[x], { classes })
            }

        }
        await transaction.commit();
        returnValue({ res, response });
    } catch (error) {
        console.log('error: ', error);
        await transaction.rollback();
        returnValue({ res, error, status: 500 })

    }
});

router.get('/timetable/:class_id/:term_id', async (req, res) => {
    try {
        const { class_id, term_id } = req.params;
        const timetable = await TimeTable.findAll({
            where: {
                term_id
            },
            include: [
                {
                    model: Class,
                    as: "classes",
                    where: {
                        id: class_id
                    },
                    required: true,
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ['id', 'name', 'code']
                },
                // {
                //     model: Hours,
                //     as: 'hour',

                // }
            ]
        })
        returnValue({ res, response: timetable })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/timetable/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const timetable = await TimeTable.findByPk(id, {
            include: [
                {
                    model: Class,
                    as: "classes",
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ['id', 'name', 'code']
                },
                {
                    model: Staff,
                    as: 'staffs',
                    attributes: ['id', 'name']
                }
            ]
        })
        returnValue({ res, response: timetable })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/timetable/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number)
        let response = await TimeTable.destroy({
            where: {
                id: { [Op.in]: ids }
            },
            individualHooks: true,
            user_id: req['headers']?.user_id
        });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;