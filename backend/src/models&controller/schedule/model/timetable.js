const { DataTypes, ValidationError, Op } = require("sequelize");
const sequelize = require("../../../sequelize");
const { Staff } = require('../../staff/model/staff')
const Class = require('../../department/model/class')
const { Course } = require('../../schedule/model/course');
const Term = require("../../base/model/academicYear/term");
const Hours = require("../../base/model/academicYear/hour");
const { enum_values } = require("../../../utils/enum");


const TimeTable = sequelize.define('timetable', {
    day: {
        type: DataTypes.ENUM(...enum_values?.timetable_day?.map(res => res?.id)),
        allowNull: false
    }
}, {
    tableName: "timetable"
});

const TimeTableStaff = sequelize.define('timetable_staff', {}, { tableName: "timetable_staff" });
const TimeTableClass = sequelize.define('timetable_class', {}, { tableName: "timetable_class" });

TimeTable.belongsToMany(Staff, {
    through: 'timetable_staff',
    as: "staffs",
    onDelete: "CASCADE"
});
Staff.belongsToMany(TimeTable, {
    through: 'timetable_staff',
    as: 'timetables',
    onDelete: "CASCADE"
});

Class.belongsToMany(TimeTable, {
    through: "timetable_class",
    as: 'timetables',
    onDelete: "CASCADE"
});
TimeTable.belongsToMany(Class, {
    through: 'timetable_class',
    as: "classes",
    onDelete: "CASCADE"
})

Course.hasOne(TimeTable, {
    foreignKey: "course_id",
    as: "timetable"
});
TimeTable.belongsTo(Course, {
    foreignKey: "course_id",
    as: "course"
});

Term.hasMany(TimeTable, {
    foreignKey: 'term_id',
    as: "timetables"
});
TimeTable.belongsTo(Term, {
    foreignKey: "term_id",
    as: "term"
});

Hours.hasMany(TimeTable, {
    foreignKey: 'hour_id',
    as: "timetables"
});
TimeTable.belongsTo(Hours, {
    foreignKey: "hour_id",
    as: "hour"
});

const checkAlreadyExist = async (instance, options) => {
    try {
        let already_exist = await TimeTable.findOne({
            where: {
                day: instance?.dataValues?.day,
                hour_id: instance?.dataValues?.hour_id
            },
            include: [
                {
                    model: Class,
                    as: "classes",
                    required: true,
                    where: {
                        id: {
                            [Op.in]: options?.class_ids
                        }
                    },
                }
            ]
        });
        if (already_exist) throw new ValidationError("Timetable hour already exist for this class")

    } catch (error) {
        throw new Error(error);
    }
}

TimeTable.beforeCreate('check_already_exist', checkAlreadyExist)


module.exports = { TimeTable, TimeTableStaff, TimeTableClass }