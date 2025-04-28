const { DataTypes } = require('sequelize');
const sequelize = require('../../../sequelize');
const { enum_values } = require('../../../utils/enum');
const { Staff } = require('../../staff/model/staff');
const transporterInstance = require('../../../utils/nodemailer');

const StaffLeaveConfig = sequelize.define('staff_leave_config', {
    type: {
        type: DataTypes.ENUM(...enum_values.staff_leave_type?.map(res => res?.id)),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    days: {
        type: DataTypes.INTEGER,
    },
    days_for: {
        type: DataTypes.ENUM(...enum_values?.staff_leave_days_for?.map(res => res?.id)),
    },

}, {
    tableName: "staff_leave_config"
});

const StaffLeaveConfigApprover = sequelize.define('staff_leave_config_approver', {
    role: {
        type: DataTypes.ENUM(...enum_values?.staff_profile_role?.map(res => res?.id))
    }
}, { tableName: "staff_leave_config_approver" });

StaffLeaveConfig.hasMany(StaffLeaveConfigApprover, {
    foreignKey: "leave_config_id",
    as: "approvers"
});
StaffLeaveConfigApprover.belongsTo(StaffLeaveConfig, {
    foreignKey: "leave_config_id",
    as: "staff_leave_config"
})

const StaffLeaveCredits = sequelize.define('staff_leave_credits', {}, { tableName: 'staff_leave_credits' });

StaffLeaveConfig.belongsToMany(Staff, {
    through: StaffLeaveCredits,
    as: "staffs"
});
Staff.belongsToMany(StaffLeaveConfig, {
    through: StaffLeaveCredits,
    as: "staff_leave_configs"
});

//send mail while allocate credit
const sendMailAllocateCredit = async (instances) => {
    try {
        const transporter = await transporterInstance();

        let mail = [];
        let config = await StaffLeaveConfig.findByPk(instances?.[0]?.staffLeaveConfigId);
        for (let instance of instances) {
            let staff = await Staff.findByPk(instance?.staffId, {
                attributes: ['id', 'email']
            });
            mail.push(staff?.email)
        }
        transporter.sendMail({
            to: mail?.join(','),
            subject: "Approval updated",
            text: `You have been assigned as the approver for ${config?.name} requests. You can now review and approve ${config?.name}.`,
        }, (err, info) => {
            console.log(err, info)
        })
    } catch (error) {
        throw new Error(error);
    }
};

StaffLeaveCredits.afterBulkCreate('allocated_credit_send_mail', sendMailAllocateCredit)

module.exports = { StaffLeaveConfig, StaffLeaveConfigApprover, StaffLeaveCredits };