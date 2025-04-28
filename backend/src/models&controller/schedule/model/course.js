const { DataTypes } = require('sequelize');
const sequelize = require('../../../sequelize');
const Term = require('../../base/model/academicYear/term');
const { Programme } = require('../../admission/model/programme');
const { Staff } = require('../../staff/model/staff');
const Class = require('../../department/model/class');

const Course = sequelize.define('course', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: "course"
});

const CourseTerm = sequelize.define('course_term', {}, { tableName: "course_term" })
// const CourseProgramme = sequelize.define('course_programme', {}, { tableName: "course_programme" })
const CourseStaff = sequelize.define('course_staff', {}, { tableName: "course_staff" });
const CourseClass = sequelize.define('course_classes', {}, { tableName: "course_classes" });

Course.belongsToMany(Term, {
    through: CourseTerm,
    as: "terms",
    onDelete: "CASCADE"
});
Term.belongsToMany(Course, {
    through: CourseTerm,
    as: 'courses',
    onDelete: "CASCADE"

});

Course.belongsToMany(Class, {
    through: CourseClass,
    as: "classes",
    onDelete: "CASCADE"
});
Class.belongsToMany(Course, {
    through: CourseClass,
    as: "courses",
    onDelete: "CASCADE"
})
// Course.belongsToMany(Programme, {
//     through: CourseProgramme,
//     as: 'programmes',
//     onDelete: "CASCADE"

// });
// Programme.belongsToMany(Course, {
//     through: CourseProgramme,
//     as: "courses",
//     onDelete: "CASCADE"

// });

Course.belongsToMany(Staff, {
    through: CourseStaff,
    as: "staffs",
    onDelete: "CASCADE"

});
Staff.belongsToMany(Course, {
    through: CourseStaff,
    as: 'courses',
    onDelete: "CASCADE"

});


module.exports = { Course, CourseTerm, CourseStaff, CourseClass };