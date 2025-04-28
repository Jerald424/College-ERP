const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { Programme } = require("../../admission/model/programme");
const { enum_values } = require("../../../utils/enum");

const Class = sequelize.define('class', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    acronym: DataTypes.STRING,
    year: {
        type: DataTypes.ENUM(...enum_values?.class_year?.map(res => res?.id))
    }

}, {
    tableName: "class"
})

Programme.hasMany(Class, {
    foreignKey: "programme_id",
    as: "class"
});

Class.belongsTo(Programme, {
    foreignKey: "programme_id",
    as: "programme"
});

module.exports = Class;