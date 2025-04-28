const { Op, ValidationError } = require("sequelize");
const transporterInstance = require("../../../utils/nodemailer");
const { Staff } = require("../../staff/model/staff");
const { StaffLeave } = require("../model/staffLeave");
const { StaffLeaveConfig, StaffLeaveConfigApprover } = require("../model/staffLeaveConfig");
const { DomainUrl } = require("../../base/communication/model/domainUrl");
const { EncLeaveApproval } = require("../model/encApproval");
const { generateRandomText } = require("../../../functions/handleData");
const Users = require("../../base/user/model/user");

StaffLeave.afterCreate('send_mail_to_approver', async (instance) => {
    try {
        let transporter = await transporterInstance();
        let config = await StaffLeaveConfig.findByPk(instance?.leave_config_id, {
            attributes: ['id', 'name'],
            include: [
                {
                    model: StaffLeaveConfigApprover,
                    as: "approvers",
                    attributes: ['id', 'role']
                }
            ]
        });
        let approvers = config?.approvers?.map(res => res?.role);
        let applier = await Staff.findByPk(instance?.staff_id, { attributes: ['id', 'department_id', 'name'] });

        let staffs = [];
        for (let role of approvers) {
            let staff = await Staff.findAll({
                attributes: ['id', 'email'],
                where: {
                    role
                },
                ...role !== 'principal' && {
                    department_id: applier?.department_id
                }
            });
            staffs.push(...staff?.map(res => res?.email))
        };
        const front_end_domain = await DomainUrl.findOne({
            where: {
                source: "frontend",
                is_active: true
            }
        });
        if (!front_end_domain) throw new ValidationError("No active domain url found");
        let enc = await EncLeaveApproval.create({
            enc: generateRandomText(10),
            staff_leave_id: instance?.id
        }, { returning: true });

        transporter.sendMail({
            to: staffs?.join(','),
            subject: "🕒    Waiting for Approval: Leave Request Received ",
            html: `<div style=" border: 1px solid #abb2b9; border-radius: 3px; padding: 10px; text-align: center">
      You have received a leave request from ${applier?.name} for a ${config?.name} to ${instance?.reason ?? "NIL"} reason. You can now approve or reject the request
      <div style="text-align: center; margin-top: 20px">
      <a href="${front_end_domain?.url}/#/leave/staff-leave-approve/approved/${enc?.enc}">
          <button style="color: white; background-color: #117a65; border: none; padding: 10px; margin-right: 10px; border-radius: 5px; cursor:pointer">Approve</button>
          </a>
      <a href="${front_end_domain?.url}/#/leave/staff-leave-approve/rejected/${enc?.enc}">
          <button style="color: white; background-color: #b03a2e; border: none; padding: 10px; border-radius: 5px; cursor:pointer">Reject</button>
          </a>
        </div>
    </div>`
        }, (err, info) => {
            console.log(err, info)
        })
    } catch (error) {
        throw new Error(error);
    }
});

StaffLeave.beforeUpdate('send_mail_to_applier_about_status', async (instance, options) => {
    try {
        if (instance?._previousDataValues?.status == 'applied' && ['approved', 'rejected'].includes(instance?.dataValues?.status)) {
            let staff = await Staff.findByPk(instance?.staff_id, {
                attributes: ['id', 'email']
            });
            if (!staff) throw new ValidationError("Staff not found");
            if (!staff?.email) return;

            let transporter = await transporterInstance();
            let status = instance?.status;
            let approved_staff = await Users.findByPk(options?.user_id, {
                include: [
                    {
                        model: Staff,
                        as: "staff",
                        attributes: ['id', 'name']
                    }
                ]
            });
            let leave_config = await StaffLeaveConfig.findByPk(instance?.leave_config_id, { attributes: ['id', 'name'] });

            transporter.sendMail({
                to: staff?.email,
                subject: `${status == 'approved' ? "✔️" : "❌"} Leave request is ${status}`,
                html: `<div style="background-color:#eaecee; padding:10px; text-align:center">
                      Your ${leave_config?.name} application has been approved by ${approved_staff?.staff?.name ?? "ANONYMOUS"} on ${new Date().toDateString()}, ${new Date().getHours()}:${new Date().getMinutes()}
                 </div>
              </div>`
            }, (err, info) => {
                console.log(err, info)
            })
        };

    } catch (error) {
        throw new Error(error);
    }
})