const { Op } = require('sequelize');
const { returnValue, applyPagination } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { BusSessions, BusSessionIncharge, BusSessionPassengers } = require('../model/busSessions');
const Users = require('../../base/user/model/user');
const Student = require('../../student/model/student');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const { Staff } = require('../../staff/model/staff');
const { Bus } = require('../model/bus');
const UserRoles = require('../../base/user/model/userRole');
const Role = require('../../base/user/model/role');

const router = require('express').Router();

router.post('/bus-session', async (req, res) => {
    try {
        /* 
            {
                bus_session:{
                    bus_id:number;
                    name:string;
                    time:Time
                }
            }
        */
        const { bus_session } = req.body;
        const response = await BusSessions.create(bus_session, { returning: true })
        returnValue({ res, response });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put('/bus-session/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { bus_session } = req.body;
        const [_, updated] = await BusSessions.update(bus_session, { where: { id }, returning: true })
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.post('/bus-session/incharge/passenger', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /*
            {
                payload:{
                    incharge_ids:[]; 
                    passenger_ids:[];
                    bus_session_id:number
                }
            }
        */
        const { payload } = req.body;
        await BusSessionIncharge.destroy({
            where: {
                transportBusSessionId: payload?.bus_session_id,
            },
            transaction
        });
        await BusSessionPassengers.destroy({
            where: {
                transportBusSessionId: payload?.bus_session_id,
            },
            transaction
        },)

        let response = {};

        let incharge_ids = payload?.incharge_ids?.map(res => ({ userId: res, transportBusSessionId: payload?.bus_session_id }))
        let incharge = await BusSessionIncharge.bulkCreate(incharge_ids, { transaction, returning: true })
        Object.assign(response, { incharge })

        let passenger_ids = payload?.passenger_ids?.map(res => ({ userId: res, transportBusSessionId: payload?.bus_session_id }))
        let passenger = await BusSessionPassengers.bulkCreate(passenger_ids, { transaction, returning: true })
        Object.assign(response, { passenger })
        await transaction.commit();
        returnValue({ res, response });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/bus-session', async (req, res) => {
    try {
        let create_schedule = req.query['create_schedule'];
        const user_id = req.headers['user_id'];

        let user = await Users.findByPk(user_id, {
            include: [
                {
                    model: UserRoles,
                    as: "user_roles",
                    where: {
                        is_active: true
                    },
                    include: [
                        {
                            model: Role,
                            as: "roles"
                        }
                    ]
                }
            ]
        });
        if (!user?.user_roles?.[0]) returnValue({ res, error: "No active role found", status: 401 });
        let role_level = user?.user_roles?.[0]?.roles?.level_id
        console.log('role_level: ', role_level);

        const count = await BusSessions.count();
        const rows = await BusSessions.findAll({
            ...applyPagination({ req }),
            include: [
                {
                    model: Bus,
                    as: "bus",
                    attributes: ['id', 'name'],
                    required: true,
                    ...(create_schedule && role_level !== 'college') && {
                        include: [
                            {
                                model: BusSessions,
                                as: "sessions",
                                required: true,
                                attributes: [],
                                include: [
                                    {
                                        model: Users,
                                        as: "incharges",
                                        attributes: [],
                                        where: {
                                            id: user_id
                                        }
                                    }
                                ]
                            }

                        ]
                    }
                }
            ]

        });

        returnValue({ res, response: { count, rows } });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/bus-session/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await BusSessions.findByPk(id, {
            include: [
                {
                    model: Users,
                    as: "incharges"
                },
                {
                    model: Users,
                    as: "passengers"
                },
            ]
        })
        returnValue({ res, response })
    } catch (error) {

    }
})

router.delete('/bus-session/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number)
        const response = await BusSessions.destroy({
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

router.get('/passengers/incharge-support-data', async (req, res) => {
    try {
        const response = await Users.findAll({
            include: [
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
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
        });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

module.exports = router