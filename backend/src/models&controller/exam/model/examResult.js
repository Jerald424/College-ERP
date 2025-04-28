const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const Student = require("../../student/model/student");
const { ExamConfig } = require("./examConfig");
const { Course } = require('../../schedule/model/course')

const ExamResult = sequelize.define('exam_result', {
    internal_mark: {
        type: DataTypes.FLOAT
    },
    external_mark: {
        type: DataTypes.FLOAT
    },
}, {
    tableName: "exam_result",
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'exam_config_id', 'course_id']
        }
    ]
});

Student.hasMany(ExamResult, {
    foreignKey: "student_id",
    as: "exam_result"
});
ExamResult.belongsTo(Student, {
    foreignKey: "student_id",
    as: "student"
});

ExamConfig.hasMany(ExamResult, {
    foreignKey: "exam_config_id",
    as: "exam_result"
});
ExamResult.belongsTo(ExamConfig, {
    foreignKey: "exam_config_id",
    as: "exam_config"
});

Course.hasMany(ExamResult, {
    foreignKey: "course_id",
    as: "exam_result"
});
ExamResult.belongsTo(Course, {
    foreignKey: "course_id",
    as: "course"
});

module.exports = { ExamResult }