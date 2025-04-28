const { Op } = require("sequelize");
const { ComMessage } = require("../models/message")

module.exports = {
    async getLastMessage(item, user_id) {
        let where = {};
        if (item?.is_group) where['group_id'] = item?.id
        else {
            Object.assign(where, {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { sender_id: user_id },
                            { receiver_id: item?.id },
                        ],
                    },
                    {
                        [Op.and]: [
                            { receiver_id: user_id },
                            { sender_id: item?.id },
                        ]
                    }
                ]
            })
        }

        let last_message = await ComMessage.findOne({
            order: [
                ["createdAt", 'DESC']
            ],
            where
        });

        return last_message;
    }
}