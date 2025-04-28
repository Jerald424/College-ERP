const { DataTypes } = require('sequelize');
const sequelize = require('../../../sequelize');
const { enum_values } = require('../../../utils/enum');
const Users = require('../user/model/user');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');

const AuditLog = sequelize.define('audit_log', {
    table_name: DataTypes.STRING,
    record_id: DataTypes.INTEGER,
    operation: DataTypes.ENUM(...enum_values?.audit_operation?.map(res => res?.id)),
    old_values: DataTypes.JSON,
    new_values: DataTypes.JSON,
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
    }
}, {
    tableName: 'audit_log'
})

Users.hasMany(AuditLog, {
    foreignKey: "user_id",
    as: "audit"
});
AuditLog.belongsTo(Users, {
    foreignKey: "user_id",
    as: "user"
});

AdmissionApplicant.hasMany(AuditLog, {
    foreignKey: "applicant_id",
    as: "audit"
});
AuditLog.belongsTo(AdmissionApplicant, {
    foreignKey: 'applicant_id',
    as: "applicant"
})

module.exports = AuditLog;