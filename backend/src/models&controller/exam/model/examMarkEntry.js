const { DataTypes } = require('sequelize');
const sequelize = require('../../../sequelize');
const { ExamTimetable } = require('./examTimetable');
const Student = require('../../student/model/student')

const ExamMarkEntry = sequelize.define('exam_timetable_mark_entry', {
    mark: {
        type: DataTypes.INTEGER,
    }
}, {
    tableName: "exam_timetable_mark_entry",
    indexes: [
        {
            unique: true,
            fields: ['exam_timetable_id', 'student_id'],
        }
    ]
});

ExamTimetable.hasMany(ExamMarkEntry, {
    foreignKey: "exam_timetable_id",
    as: "exam_mark"
});
ExamMarkEntry.belongsTo(ExamTimetable, {
    foreignKey: "exam_timetable_id",
    as: "exam_timetable"
});

Student.hasMany(ExamMarkEntry, {
    foreignKey: "student_id",
    as: "exam_mark"
});
ExamMarkEntry.belongsTo(Student, {
    foreignKey: "student_id",
    as: "student"
});


module.exports = { ExamMarkEntry };