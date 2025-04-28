const { DataTypes, ValidationError } = require("sequelize");
const sequelize = require("../../../../sequelize");
const Student = require("../../../student/model/student");
const { Staff } = require("../../../staff/model/staff");

const Users = sequelize.define('users', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },


}, {
    tableName: "users",
    indexes: [
        {
            unique: true,
            fields: ['student_id']
        },
        {
            unique: true,
            fields: ['staff_id']
        }
    ],
});

Student.hasOne(Users, {
    foreignKey: 'student_id',
    as: "user"
});
Users.belongsTo(Student, {
    foreignKey: "student_id",
    as: "student"
});

Staff.hasOne(Users, {
    foreignKey: "staff_id",
    as: "user"
});
Users.belongsTo(Staff, {
    foreignKey: "staff_id",
    as: 'staff'
});

const checkUserCreate = (instance) => {
    try {
        if (instance?.student_id && instance?.staff_id) throw new ValidationError("User must student or staff")
    } catch (error) {
        throw new Error(error);
    }
}
Users.beforeCreate('check_staff_student_create', checkUserCreate)
Users.beforeUpdate('check_staff_student_update', checkUserCreate)

module.exports = Users;