const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const ExamRoom = sequelize.define('exam_room', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    row: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    column: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, { tableName: "exam_room" })

module.exports = { ExamRoom };