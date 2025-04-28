const { Op } = require('sequelize');
const { returnValue } = require('../../../functions/handleData');
const { ComMessage } = require('../models/message');
const { ComUserBlock } = require('../models/useBlock');

const router = require('express').Router();

router.get('/contact-info/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const response = {};
        let is_block = await ComUserBlock.count({
            where: {
                user_id,
                blocked_user_id: req.headers?.['user_id'],
                is_block: true
            }
        });
        let i_is_blocked = await ComUserBlock.count({
            where: {
                user_id: req.headers['user_id'],
                blocked_user_id: user_id,
                is_block: true
            }
        })
        response['is_block'] = is_block > 0;
        response['i_is_blocked'] = i_is_blocked > 0

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.post('/block-unblock/:type/:user_id', async (req, res) => {
    try {
        /*
            type = block | unblock
        */
        const { type, user_id } = req.params;
        let response = {};



        let record_exist = await ComUserBlock.findOne({
            where: {
                user_id: req.headers?.['user_id'],
                blocked_user_id: user_id
            }
        });

        if (record_exist) {
            let [_, updated] = await ComUserBlock.update({ is_block: type == 'block' ? true : false }, { where: { id: record_exist?.id }, returning: true })
            Object.assign(response, updated?.[0]?.dataValues);

        } else {
            let payload = {
                is_block: type == 'block' ? true : false,
                user_id: req.headers?.['user_id'],
                blocked_user_id: user_id
            }
            let created = await ComUserBlock.create(payload, { returning: true });
            Object.assign(response, created?.dataValues)
        }

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/delete-chat/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const io = req.app.locals.io;

        let deleted_id = req.headers['user_id'];

        await ComMessage.destroy({
            where: {
                sender_id: {
                    [Op.in]: [deleted_id, user_id]
                },
                receiver_id: {
                    [Op.in]: [deleted_id, user_id]
                }
            }
        });
        io.to(String(user_id)).emit('message_deleted', { from: deleted_id, to: user_id });
        returnValue({ res, response: { message: "Message deleted" } })

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/delete-message/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let query = req.query;
        const io = req.app.locals.io;

        await ComMessage.destroy({ where: { id } });
        query?.['group_id'] ? io.to(String(query?.['group_id'])).emit('single_message_deleted', { id }) : io.to(String(req?.headers['user_id'])).to(req.query?.['user_id']).emit('single_message_deleted', { id })
        returnValue({ res, response: { message: "Message deleted successfully" } });

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;
