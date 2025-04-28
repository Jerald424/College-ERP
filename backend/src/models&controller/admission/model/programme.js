const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { enum_values } = require("../../../utils/enum");
const Department = require("../../department/model/department");


const Programme = sequelize.define('programme',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: "Programme name must be unique"
        },
        programme_programme_level: {
            type: DataTypes.ENUM(...enum_values?.programme_level?.map(res => res?.id)),
            allowNull: false,

        },
        image: DataTypes.TEXT,
        description: DataTypes.STRING
    },
    {
        tableName: "programme"
    });


Department.hasMany(Programme, {
    foreignKey: "department_id",
    as: "programme"
});

Programme.belongsTo(Department, {
    foreignKey: "department_id",
    as: "department"
});


module.exports = { Programme };