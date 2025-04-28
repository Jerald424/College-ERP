const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const ExamTime = sequelize.define('exam_time', {
    time_from: {
        type: DataTypes.TIME,
        allowNull: false
    },
    time_to: {
        type: DataTypes.TIME,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING
    }
}, { tableName: 'exam_time' })

module.exports = { ExamTime }