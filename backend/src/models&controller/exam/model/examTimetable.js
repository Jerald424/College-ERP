const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const Class = require("../../department/model/class");
const { Course } = require("../../schedule/model/course");
const { Exam } = require("./exam");
const { ExamRoom } = require("./examRoom");
const { Staff } = require("../../staff/model/staff");
const { ExamTime } = require('./examTime');
const moment = require('moment');

const ExamTimetable = sequelize.define('exam_timetable', {
    date: {
        type: DataTypes.DATEONLY,
        get() {
            let rawValue = this.getDataValue('date');
            return rawValue ? moment(rawValue).format('DD-MM-YYYY') : null
        }
    },
    is_attendance_marked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "exam_timetable"
});

ExamTime.hasMany(ExamTimetable, {
    foreignKey: "exam_time_id",
    as: "exam_timetable"
});
ExamTimetable.belongsTo(ExamTime, {
    foreignKey: "exam_time_id",
    as: "exam_time"
})

Exam.hasMany(ExamTimetable, {
    foreignKey: "exam_id",
    as: "exam_timetable"
});
ExamTimetable.belongsTo(Exam, {
    foreignKey: "exam_id",
    as: "exam"
});

ExamRoom.hasMany(ExamTimetable, {
    foreignKey: "exam_room_id",
    as: "exam_timetable"
});
ExamTimetable.belongsTo(ExamRoom, {
    foreignKey: "exam_room_id",
    as: "exam_room"
});

Staff.hasMany(ExamTimetable, {
    foreignKey: "staff_id",
    as: "exam_timetable"
});
ExamTimetable.belongsTo(Staff, {
    foreignKey: "staff_id",
    as: "invigilator"
});

Course.hasMany(ExamTimetable, {
    foreignKey: "course_id",
    as: "exam_timetable"
});
ExamTimetable.belongsTo(Course, {
    foreignKey: "course_id",
    as: "course"
});

Class.hasMany(ExamTimetable, {
    foreignKey: "class_id",
    as: "exam_timetable"
});
ExamTimetable.belongsTo(Class, {
    foreignKey: "class_id",
    as: "class"
});

module.exports = { ExamTimetable };