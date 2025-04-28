const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { enum_values } = require("../../../utils/enum");
const Class = require('../../department/model/class');
const Department = require("../../department/model/department");

const Staff = sequelize.define('staff', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        unique: true
    },
    gender: {
        type: DataTypes.ENUM(...enum_values?.gender?.map(res => res?.id))
    },
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    dob: DataTypes.DATEONLY,
    address: DataTypes.TEXT,
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    image: DataTypes.TEXT,
    role: {
        type: DataTypes.ENUM(...enum_values?.staff_profile_role?.map(res => res?.id))
    }

}, {
    tableName: "staff"
});

const StaffClass = sequelize.define('staff_class', {}, { tableName: "staff_class" })

Staff.belongsToMany(Class, {
    through: StaffClass,
    as: "classes",
    onDelete: "CASCADE"
});
Class.belongsToMany(Staff, {
    through: StaffClass,
    as: "staffs",
    onDelete: "CASCADE"
});

Department.hasOne(Staff, {
    foreignKey: "department_id",
    as: 'staffs'
});
Staff.belongsTo(Department, {
    foreignKey: "department_id",
    as: 'department'
})

module.exports = { Staff, StaffClass };