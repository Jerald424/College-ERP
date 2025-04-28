const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { StaffLeave } = require("./staffLeave");

const EncLeaveApproval = sequelize.define('enc_leave_approvals', {
    enc: DataTypes.STRING
}, {
    tableName: "enc_leave_approvals"
});

StaffLeave.hasOne(EncLeaveApproval, {
    foreignKey: "staff_leave_id",
    as: "enc_leave_approval"
});

EncLeaveApproval.belongsTo(StaffLeave, {
    foreignKey: "staff_leave_id",
    as: "staff_leave"
});

module.exports = { EncLeaveApproval };