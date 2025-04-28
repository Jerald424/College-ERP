const router = require('express').Router();
const { returnValue } = require('../../../functions/handleData');
const Role = require('../../base/user/model/role');
const Users = require('../../base/user/model/user');
const UserRoles = require('../../base/user/model/userRole');
const Class = require('../../department/model/class');
const { Staff } = require('../../staff/model/staff');
const Student = require('../../student/model/student');
const StudentCampusYear = require("../../student/model/campusYear");
const Department = require('../../department/model/department');
const { Programme } = require('../../admission/model/programme');
const isEmpty = require('lodash/isEmpty');
const { Op } = require('sequelize');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const { ComGroup, ComGroupMembers, ComGroupAdmin } = require('../models/group');
const { ComMessage } = require('../models/message');
const { getLastMessage } = require('../functions/message');
const sequelize = require('../../../sequelize');


router.get('/class-students', async (req, res) => {
    try {
        const user_id = req.headers['user_id'];

        let user = await Users.findByPk(user_id, {
            include: [
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['role', 'department_id'],
                    include: [
                        {
                            model: Class,
                            as: "classes",
                            attributes: ['id']
                        },
                        {
                            model: Department,
                            as: "department",
                            include: [
                                {
                                    model: Programme,
                                    as: "programme",
                                    attributes: ['id'],
                                    include: [
                                        {
                                            model: Class,
                                            as: "class"
                                        }
                                    ]
                                }
                            ]
                        }

                    ]
                },
                {
                    model: UserRoles,
                    as: 'user_roles',
                    attributes: ['id'],
                    where: {
                        is_active: true
                    },
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            attributes: ['level_id']
                        }
                    ]
                }
            ]
        });

        user = user.toJSON();
        if (!user?.staff_id) return returnValue({ res, status: 400, error: "Staff not found" });
        user['user_roles'] = user?.['user_roles']?.[0];

        let my_class_ids = user?.staff?.classes?.map(res => res?.id);
        let dep_class_ids = user?.staff?.department?.programme?.map(res => res?.class?.map(res => res?.id))?.flat(2);
        if (!isEmpty(my_class_ids) && !isEmpty(dep_class_ids)) {
            dep_class_ids = [...new Set(dep_class_ids?.concat(my_class_ids))]
        }

        let campus_year_where = {
            status: 'in_progress'
        };
        if (user?.user_roles?.roles?.level_id !== 'college') campus_year_where['class_id'] = {
            [Op.in]: user?.staff?.role == 'hod' ? dep_class_ids : my_class_ids
        }
        let students = await Student.findAll({
            include: [
                {
                    model: StudentCampusYear,
                    as: "campus_year",
                    where: campus_year_where,
                    required: true,
                    include: [
                        {
                            model: Class,
                            as: "class"
                        }
                    ]
                },
                {
                    model: AdmissionApplicant,
                    as: "applicant",
                    attributes: ['id', 'name', 'image']
                },
                {
                    model: Users,
                    as: "user",
                    required: true,
                    attributes: ['id']
                }
            ]
        });
        let std_response = [];
        students?.forEach((student) => {
            student = student.toJSON();
            student['class'] = student?.campus_year?.[0]?.['class'];
            std_response?.push(student);
            delete student['campus_year']

        })

        returnValue({ res, response: std_response });
    } catch (error) {
        returnValue({ res, status: 500, error })
    }
});

router.get('/my-groups-chats', async (req, res) => {
    try {
        // const io = req.app.locals.io;
        let user_id = req.headers['user_id']

        const groups = await ComGroup.findAll({
            include: [
                {
                    model: Users,
                    as: "members_in_groups",
                    where: {
                        id: user_id
                    },
                    required: true,
                    attributes: []
                }
            ]
        });
        let response = [];
        for (let x in groups) {
            let group = groups?.[x].toJSON();
            group['is_group'] = true
            group['last_message'] = await getLastMessage(group);
            response.push(group)
        };

        let user_msg = await Users.findAll({
            where: {
                [Op.or]: [
                    { '$receive_messages.sender_id$': user_id },
                    { '$sended_messages.receiver_id$': user_id },
                ]
            },
            include: [
                {
                    model: ComMessage,
                    as: "sended_messages",
                    attributes: []
                },
                {
                    model: ComMessage,
                    as: "receive_messages",
                    attributes: []
                },
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['id', 'name', 'image']
                        },

                    ]
                },
                {
                    model: Staff,
                    as: "staff",
                    attributes: ['id', 'name', 'image']
                }

            ]
        });

        for (let x of user_msg) {
            let user = x?.toJSON();
            user['last_message'] = await getLastMessage(user, user_id);
            response?.push(user)
        };

        response = response?.sort((a, b) => {
            if (!a?.last_message?.createdAt) return -1
            let a_createdAt = new Date(a?.last_message?.createdAt).getTime();
            let b_createdAt = new Date(b?.last_message?.createdAt).getTime();
            return a_createdAt > b_createdAt ? -1 : 1
        })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, status: 500, error });
    }
});

router.put("/update-group-info/:group_id", async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            {
                group:{
                    name:string; image:string; description:string
                },
                removed_user:number[],
                added_user:number[],
                group_admins:number[]
            }
        */
        const io = req.app.locals.io;

        const response = {
            removed_user: [],
            group: null,
            added_user: [],
            added_group_admins: [],
            removed_group_admins: []
        };
        const { group_id } = req.params;
        const { group, removed_user, added_user, group_admins, removed_group_admins } = req.body;
        const [count, updated] = await ComGroup.update(group, { transaction, returning: true, where: { id: group_id } });
        if (count > 0) response['group'] = updated?.[0];

        if (!isEmpty(removed_user)) {
            await ComGroupMembers.destroy({
                where: {
                    comGroupId: group_id,
                    userId: removed_user
                }
            }, { transaction });
            removed_user?.forEach(user => {
                io.to(String(user)).emit('group_created', null);
            });

        }

        if (!isEmpty(added_user)) {
            let add_user_payload = added_user?.map(res => ({ userId: res, comGroupId: group_id }))
            let added_user_db = await ComGroupMembers.bulkCreate(add_user_payload, { transaction, returning: true });
            added_user_db?.forEach(user => {
                io.to(String(user?.userId)).emit('group_created', null);
            });
            response['added_user'] = added_user_db;
        }

        if (!isEmpty(group_admins)) {
            let added_admin_payload = group_admins?.map(userId => ({ userId, comGroupId: group_id }))
            let admins = await ComGroupAdmin.bulkCreate(added_admin_payload, { transaction, returning: true });
            response['added_group_admins'] = admins;
        }

        if (!isEmpty(removed_group_admins)) {
            await ComGroupAdmin.destroy({
                where: {
                    userId: {
                        [Op.in]: removed_group_admins
                    },
                    comGroupId: group_id
                }
            },
                transaction
            );
            response['removed_group_admins'] = removed_group_admins
        }

        if (removed_user) response['removed_user'] = removed_user;
        await transaction.commit();
        io.to(String(group_id)).emit('group_updated', response)
        returnValue({ res, response });
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.delete("/delete-group/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const io = req.app.locals.io;

        await ComGroup.destroy({
            where: {
                id
            }
        });
        io.to(String(id)).emit("group_deleted");
        returnValue({ res, response: { id } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/group-members/:group_id', async (req, res) => {
    try {
        const { group_id } = req.params;

        const members = await Users.findAll({
            include: [
                {
                    model: ComGroup,
                    as: "members",
                    where: {
                        id: group_id
                    },
                    required: true,
                    attributes: []
                },
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
        })


        const admins = await ComGroupAdmin.findAll({
            where: {
                comGroupId: group_id
            }
        })
        returnValue({ res, response: { members, admins } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;