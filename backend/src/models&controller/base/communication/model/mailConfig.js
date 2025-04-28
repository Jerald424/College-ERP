const { DataTypes } = require('sequelize');
const sequelize = require('../../../../sequelize');

const MailConfig = sequelize.define('mail_config', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, { tableName: "mail_config" });

const makeInActive = async (instance) => {
    try {
        if (instance?.dataValues?.is_active) await MailConfig.update({ is_active: false }, { where: { is_active: true } });
    } catch (error) {
        throw new Error(error);
    }
}

MailConfig.beforeCreate('mail_create_is_active', makeInActive);
MailConfig.beforeUpdate('mail_update_is_active', makeInActive)

module.exports = MailConfig;