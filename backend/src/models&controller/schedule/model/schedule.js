const { DataTypes, ValidationError, Op } = require("sequelize");
const sequelize = require("../../../sequelize");
const { enum_values } = require("../../../utils/enum");
const { TimeTable } = require('./timetable');
const Class = require("../../department/model/class");
const { isArray } = require('lodash');
const { Calender } = require("./calender");
const Student = require("../../student/model/student");
const { Staff } = require("../../staff/model/staff");
const moment = require('moment');
const { StaffLeave } = require("../../leave/model/staffLeave");

const Schedule = sequelize.define('schedule', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: null,
        get() {
            let rawValue = this.getDataValue("date");
            return rawValue ? moment(rawValue).format('DD-MM-YYYY') : null
        }
    },
    status: {
        type: DataTypes.ENUM(...enum_values?.schedule_status?.map(res => res?.id)),
        defaultValue: 'not_marked',

    }
}, {
    tableName: 'schedule',
    indexes: [
        {
            fields: ['date', 'timetable_id'],
            unique: true,

        }
    ]
});

const ScheduleStudent = sequelize.define('schedule_student', {
    status: {
        type: DataTypes.ENUM(...enum_values?.schedule_student_status?.map(res => res?.id)),
        defaultValue: 'absent'
    }
}, { tableName: "schedule_student" });

const ScheduleSubstitutionStaff = sequelize.define('schedule_substitute_staff', {}, { tableName: 'schedule_substitute_staff' });

StaffLeave.hasOne(ScheduleSubstitutionStaff, {
    foreignKey: "leave_id",
    as: "substitutions",
    onDelete: "CASCADE"
});
ScheduleSubstitutionStaff.belongsTo(StaffLeave, {
    foreignKey: "leave_id",
    as: "leave",
    onDelete: "CASCADE"
})

Schedule.belongsToMany(Staff, {
    through: ScheduleSubstitutionStaff,
    as: "substitute_staffs"
});
Staff.belongsToMany(Schedule, {
    through: ScheduleSubstitutionStaff,
    as: "staff_substitution_schedules"
})

TimeTable.hasOne(Schedule, {
    foreignKey: "timetable_id",
    as: "schedule",

});
Schedule.belongsTo(TimeTable, {
    foreignKey: "timetable_id",
    as: "timetable"
});

Student.belongsToMany(Schedule, {
    through: ScheduleStudent,
    as: "schedules",
    onDelete: "CASCADE"
});
Schedule.belongsToMany(Student, {
    through: ScheduleStudent,
    as: "students",
    onDelete: "CASCADE"
})

const checkHoliday = async (instances) => {
    try {
        for (let instance of instances) {
            let timetable = await TimeTable.findByPk(instance?.dataValues?.timetable_id, {
                include: [
                    {
                        model: Class,
                        as: 'classes'
                    }
                ]
            });
            if (isArray(timetable?.classes)) {
                let cls_ids = timetable?.classes?.map(res => res?.id);
                let calender = await Calender.findOne({
                    where: {
                        is_holiday: true,
                        date: instance?.dataValues?.date,
                    },
                    include: [
                        {
                            model: Class,
                            as: "classes",
                            required: true,
                            where: {
                                id: { [Op.in]: cls_ids },
                            }
                        }
                    ]
                });
                if (calender) throw new ValidationError("Not allowed to schedule on holiday's");
            };

        };

    } catch (error) {
        throw new Error(error)
    }
}
Schedule.beforeBulkCreate('check_holiday', checkHoliday)

module.exports = { Schedule, ScheduleStudent, ScheduleSubstitutionStaff };