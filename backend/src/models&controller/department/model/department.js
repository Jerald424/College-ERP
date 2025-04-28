const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const Department = sequelize.define('department', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    code: DataTypes.STRING,

}, {
    tableName: "department"
});

module.exports = Department;