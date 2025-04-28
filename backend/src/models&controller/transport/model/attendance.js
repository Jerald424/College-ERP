const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const Users = require("../../base/user/model/user");
const { enum_values } = require("../../../utils/enum");
const { BusSchedules } = require("./busSchedules");

const BusScheduleAttendance = sequelize.define('transport_attendance', {
    status: {
        type: DataTypes.ENUM(...enum_values?.transport_attendance_status?.map(res => res?.id)),
        allowNull: false
    }
}, {
    tableName: "transport_attendance",
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'schedule_id']
        }
    ]
})


Users.hasMany(BusScheduleAttendance, {
    foreignKey: "user_id",
    as: "transport_schedule_attendances"
});
BusScheduleAttendance.belongsTo(Users, {
    foreignKey: 'user_id',
    as: "user"
});

BusSchedules.hasMany(BusScheduleAttendance, {
    foreignKey: "schedule_id",
    as: "attendance"
});
BusScheduleAttendance.belongsTo(BusSchedules, {
    foreignKey: "schedule_id",
    as: "schedule"
})


module.exports = { BusScheduleAttendance };