const router = require('express').Router();
const { Op } = require('sequelize');
const { returnValue, selectionFormat, applyPagination } = require('../../../functions/handleData');
const { BusSchedules } = require('../model/busSchedules');
const { BusSessions } = require('../model/busSessions');
const { Bus } = require('../model/bus');
const Users = require('../../base/user/model/user');
const Role = require('../../base/user/model/role');
const UserRoles = require('../../base/user/model/userRole');

router.post('/bus-schedule', async (req, res) => {
    try {
        /* 
            {
                bus_schedule:{
                    date:DATEONLY,
                    type:<arrive|depart>,
                    session_id:number                }
            }
        */
        const { bus_schedule } = req.body;
        const response = await BusSchedules.create(bus_schedule, { returning: true });
        returnValue({ res, response });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/bus-schedule/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number);
        let response = await BusSchedules.destroy({
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

router.get('/bus-schedule', async (req, res) => {
    try {
        const user_id = req.headers?.['user_id'];
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



        const count = await BusSchedules.count();
        const rows = await BusSchedules.findAll({
            ...applyPagination({ req }),
            include: [
                {
                    model: BusSessions,
                    as: "session",
                    required: true,
                    include: [
                        {
                            model: Bus,
                            as: "bus",
                            required: true,
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
                                            ...role_level !== 'college' && {
                                                where: {
                                                    id: user_id
                                                }
                                            }
                                        }
                                    ]
                                }

                            ]
                        }
                    ]
                }
            ]
        })
        selectionFormat({ data: rows, format: [{ key: "type", enum: "bus_schedules_type" }] })
        returnValue({ res, response: { count, rows } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/bus-schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await BusSchedules.findByPk(id, {
            include: [
                {
                    model: BusSessions,
                    as: "session"
                }
            ]
        });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
})

module.exports = router;