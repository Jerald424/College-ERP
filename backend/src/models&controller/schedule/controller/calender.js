const { Op, Sequelize } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const Class = require('../../department/model/class');
const { Calender, CalenderClass } = require('../model/calender');
const { isEmpty } = require('lodash');

const router = require('express').Router();

router.post('/calender-create', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            calender:{
                class_ids:number[],
                event_name:string,
                is_holiday:boolean,
                date:string | dates:string[];
            }
        */

        const { calender } = req.body;
        let response = {};
        if (calender?.date) {
            let calender_record = await Calender.create(calender, { returning: true, transaction, user_id: req['headers']?.user_id });
            if (!isEmpty(calender?.class_ids)) {
                let cls = await CalenderClass.bulkCreate(calender?.class_ids?.map(res => ({ calenderId: calender_record?.id, classId: res })), { transaction });
                response['classes'] = cls;
                Object.assign(response, calender_record?.dataValues);

            }
        }
        else if (calender?.dates) {
            let calender_data = calender?.dates?.map(res => ({ date: res, is_holiday: calender?.is_holiday, event_name: calender?.event_name, title: calender?.title }));
            let calender_records = await Calender.bulkCreate(calender_data, { returning: true, transaction });;
            if (!isEmpty(calender?.class_ids)) {
                let cls_data = calender_records?.reduce((acc, cur) => {
                    calender?.class_ids?.forEach((cls) => {
                        acc.push({ calenderId: cur?.id, classId: cls })
                    })
                    return acc;
                }, []);
                let cls = await CalenderClass.bulkCreate(cls_data, { transaction, returning: true });
                response['classes'] = cls;
            }
            Object.assign(response, calender_records?.dataValues);

        }
        await transaction.commit();
        returnValue({ res, response });
    } catch (error) {
        console.log('error: ', error);
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.put('/calender-edit/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { calender } = req.body;
        const { id } = req.params;
        let response = {
            classes: []
        };
        const [count, calender_record] = await Calender.update(calender, { returning: true, user_id: req['headers']?.user_id, transaction, where: { id } })
        if (count == 0) return returnValue({ res, status: 400, error: "Calender not found" });

        await CalenderClass.destroy({ where: { calenderId: id }, transaction });

        if (!isEmpty(calender?.class_ids)) {
            let cls = await CalenderClass.bulkCreate(calender?.class_ids?.map(res => ({ calenderId: id, classId: res })), { transaction });
            response['classes'] = cls;
        }
        await transaction.commit();
        Object.assign(response, calender_record?.[0]?.dataValues)
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ error, status: 500, res })
    }
});

router.get('/calender/:start_date/:end_date', async (req, res) => {
    try {
        const { end_date, start_date } = req.params;
        let response = {};
        let where = {
            date: {
                [Op.gte]: start_date,
                [Op.lte]: end_date
            }
        };
        let calender = await Calender.findAll({
            where,
            include: [
                {
                    model: Class,
                    as: "classes"
                }
            ],
            ...applyPagination({ req })
        });
        response['rows'] = calender;
        response['count'] = await Calender.count({ where });
        returnValue({ res, response })

    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.delete('/calender/:ids', async (req, res) => {
    try {
        const { ids } = req.params;
        const idsArray = ids?.split(',').map(Number);
        let response = await Calender.destroy({ where: { id: { [Op.in]: idsArray } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/calender/:date', async (req, res) => {
    try {
        const { date } = req.params;
        let response = await Calender.findAll({
            where: {
                date
            },
            include: [
                {
                    model: Class,
                    as: "classes",
                    attributes: ['id', 'name', 'acronym']
                }
            ]
        });

        returnValue({ response, res })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;