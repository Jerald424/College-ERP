const { DataTypes, ValidationError } = require("sequelize");
const sequelize = require("../../../sequelize");
const { BusSessions } = require("./busSessions");
const { enum_values } = require("../../../utils/enum");
const moment = require('moment');

const BusSchedules = sequelize.define('transport_bus_schedules', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        get() {
            let dt = this.getDataValue('date');
            return dt ? moment(dt).format("DD-MM-YYYY") : null
        }
    },
    type: {
        type: DataTypes.ENUM(...enum_values?.bus_schedules_type?.map(res => res?.id)),
        allowNull: false
    },
    is_entered: DataTypes.BOOLEAN
}, {
    tableName: "transport_bus_schedules"
});

BusSchedules.beforeCreate('check_already_schedule_created', async (instance) => {
    try {
        let record = await BusSchedules.findOne({
            where: {
                date: instance?.dataValues?.date,
                type: instance?.dataValues?.type,
                session_id: instance?.dataValues?.session_id
            }
        });
        if (record) throw new ValidationError(`A schedule has already been created for this bus in the session with an '${instance?.dataValues?.type}' type`)
    } catch (error) {
        throw new Error(error)
    }
})

BusSessions.hasMany(BusSchedules, {
    foreignKey: "session_id",
    as: "schedules"
});
BusSchedules.belongsTo(BusSessions, {
    foreignKey: "session_id",
    as: "session"
});

module.exports = { BusSchedules }