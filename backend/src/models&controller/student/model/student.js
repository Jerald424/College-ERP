const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { AdmissionApplicant } = require("../../admission/model/admissionApplicant");

const Student = sequelize.define('student', {
    roll_no: DataTypes.STRING
}, {
    tableName: "student",
    indexes: [
        {
            unique: true,
            fields: ['applicant_id']
        }
    ]
})

AdmissionApplicant.hasOne(Student, {
    foreignKey: "applicant_id",
    as: 'student'
});

Student.belongsTo(AdmissionApplicant, {
    foreignKey: "applicant_id",
    as: "applicant"
});



module.exports = Student;