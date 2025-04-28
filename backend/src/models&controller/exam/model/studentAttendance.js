const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const Student = require("../../student/model/student");
const { ExamTimetable } = require("./examTimetable");

const ExamTimetableStudentAttendance = sequelize.define('exam_timetable_student_attendance', {
    is_present: DataTypes.BOOLEAN
}, { tableName: "exam_timetable_student_attendance" });

ExamTimetable.hasMany(ExamTimetableStudentAttendance, {
    foreignKey: "exam_timetable_id",
    as: "exam_student_attendance"
});
ExamTimetableStudentAttendance.belongsTo(ExamTimetable, {
    foreignKey: "exam_timetable_id",
    as: "exam_timetable"
});

Student.hasMany(ExamTimetableStudentAttendance, {
    foreignKey: "student_id",
    as: "exam_student_attendance"
});
ExamTimetableStudentAttendance.belongsTo(Student, {
    foreignKey: "student_id",
    as: "student"
})

module.exports = { ExamTimetableStudentAttendance };