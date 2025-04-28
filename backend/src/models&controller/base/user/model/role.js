const { DataTypes } = require("sequelize");
const sequelize = require("../../../../sequelize");
const { enum_values } = require("../../../../utils/enum");

const Role = sequelize.define('role', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    level_id: {
        type: DataTypes.ENUM(...enum_values?.role_level?.map(res => res?.id)),
        allowNull: false
    },
    permissions: {
        type: DataTypes.TEXT
    }
}, {
    tableName: "role"
})

module.exports = Role;