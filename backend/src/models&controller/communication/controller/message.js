const { Op } = require('sequelize');
const { returnValue, applyPagination } = require('../../../functions/handleData');
const { ComMessage } = require('../models/message');
const Users = require('../../base/user/model/user');
const Student = require('../../student/model/student');
const { Staff } = require('../../staff/model/staff');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const router = require('express').Router();


router.post('/message', async (req, res) => {

    try {
        const io = req.app.locals.io;

        //id | message | createdAt | updatedAt | sender_id | receiver_id |group_id
        let { message } = req.body;
        message['sender_id'] = req?.headers['user_id'];
        let message_created = await ComMessage.create(message);
        message_created = message_created?.toJSON();

        let sender = await Users.findByPk(req?.headers?.['user_id'], {
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
        let receiver = await Users.findByPk(message?.receiver_id, {
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
        message_created['sender'] = sender;
        message_created['receiver'] = receiver;
        io.to(String(message?.receiver_id ?? message.group_id))?.to(String(req?.headers['user_id'])).emit('receive_message', message_created);
        returnValue({ res, response: message_created })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

/**
 * type: group | private
 * id: receiver_id | group_id
 */
router.get('/message/:type/:id', async (req, res) => {
    try {
        const { id, type } = req.params;
        let where = {};

        if (type == 'group') where['group_id'] = id
        else Object.assign(where, {
            ['receiver_id']: {
                [Op.in]: [id, req.headers['user_id']]
            },
            ['sender_id']: {
                [Op.in]: [id, req.headers['user_id']]
            }
        })


        const messages = await ComMessage.findAll({
            where,
            ...applyPagination({ req }),
            include: [
                {
                    model: Users,
                    as: "sender",
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
                }
            ]
        });
        returnValue({ res, response: messages });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;