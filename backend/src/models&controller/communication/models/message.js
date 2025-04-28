const { DataTypes } = require('sequelize');
const sequelize = require('../../../sequelize');
const Users = require('../../base/user/model/user');
const { ComGroup } = require('./group');

const ComMessage = sequelize.define('com_message', {
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

}, {
    tableName: "com_message"
});

Users.hasMany(ComMessage, {
    foreignKey: "sender_id",
    as: "sended_messages",
});
ComMessage.belongsTo(Users, {
    foreignKey: "sender_id",
    as: "sender"
});

Users.hasMany(ComMessage, {
    foreignKey: "receiver_id",
    as: "receive_messages"
});
ComMessage.belongsTo(Users, {
    foreignKey: "receiver_id",
    as: "receiver"
});

ComGroup.hasMany(ComMessage, {
    foreignKey: 'group_id',
    as: "message"
});
ComMessage.belongsTo(ComGroup, {
    foreignKey: "group_id",
    as: "group"
});

module.exports = { ComMessage };