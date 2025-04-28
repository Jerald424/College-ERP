const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const AcademicYear = require("../../base/model/academicYear/academicYear");
const Student = require("./student");
const { enum_values } = require("../../../utils/enum");
const Class = require("../../department/model/class");

const StudentCampusYear = sequelize.define('student_campus_year', {
    status: {
        type: DataTypes.ENUM(...enum_values?.student_campus_year_status?.map(res => res?.id)),
        defaultValue: "in_progress"
    }
}, {
    tableName: "student_campus_year"
});

Student.hasMany(StudentCampusYear, {
    foreignKey: "student_id",
    as: "campus_year",
    onDelete: "CASCADE"
});
StudentCampusYear.belongsTo(Student, {
    foreignKey: "student_id",
    as: "student",
    onDelete: "CASCADE"

});

AcademicYear.hasMany(StudentCampusYear, {
    foreignKey: "academic_year_id",
    as: "campus_year",
    onDelete: "CASCADE"

});
StudentCampusYear.belongsTo(AcademicYear, {
    foreignKey: "academic_year_id",
    as: "academic_year",
    onDelete: "CASCADE"

});

Class.hasMany(StudentCampusYear, {
    foreignKey: 'class_id',
    as: "academic_year",
    onDelete: "CASCADE"

});
StudentCampusYear.belongsTo(Class, {
    foreignKey: "class_id",
    as: "class",
    onDelete: "CASCADE"

})

module.exports = StudentCampusYear;