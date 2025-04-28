const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const Class = require("../../department/model/class");


const Calender = sequelize.define('calender', {
    date: {
        type: DataTypes.DATEONLY,
    },
    event_name: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('event_name');
            let regex = new RegExp('ql-align-center', 'g');

            return rawValue ? rawValue?.replace?.(regex, 'text-center') : null
        }
    },
    title: DataTypes.STRING,
    is_holiday: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
}, {
    tableName: "calender",

});

const CalenderClass = sequelize.define('calender_class', {}, { tableName: "calender_class" });

Calender.belongsToMany(Class, {
    through: CalenderClass,
    as: "classes",
});
Class.belongsToMany(Calender, {
    through: CalenderClass,
    as: 'calenders'
})

module.exports = { Calender, CalenderClass };

