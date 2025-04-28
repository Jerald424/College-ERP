const { DataTypes, ValidationError, Op } = require("sequelize");
const sequelize = require("../../../sequelize");
const { StaffLeaveConfig, StaffLeaveCredits } = require("./staffLeaveConfig");
const { Staff } = require("../../staff/model/staff");
const { enum_values } = require("../../../utils/enum");
const { getDaysBetweenDates } = require("../../../functions/handleData");
const moment = require("moment");

const StaffLeave = sequelize.define(
  "staff_leave",
  {
    reason: {
      type: DataTypes.STRING,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      get() {
        let rawValue = this.getDataValue("start_date");
        return rawValue ? moment(rawValue)?.format("DD-MM-YYYY") : null;
      },
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      get() {
        let rawValue = this.getDataValue("end_date");
        return rawValue ? moment(rawValue)?.format("DD-MM-YYYY") : null;
      },
    },
    start_session: {
      type: DataTypes.ENUM(...enum_values?.staff_leave_session?.map((res) => res?.id)),
      allowNull: false,
    },
    end_session: {
      type: DataTypes.ENUM(...enum_values?.staff_leave_session?.map((res) => res?.id)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...enum_values?.staff_leave_status?.map((res) => res?.id)),
      defaultValue: "applied",
    },
    evidence: DataTypes.TEXT,
  },
  { tableName: "staff_leave" }
);

StaffLeaveConfig.hasMany(StaffLeave, {
  foreignKey: "leave_config_id",
  as: "staff_leave",
});
StaffLeave.belongsTo(StaffLeaveConfig, {
  foreignKey: "leave_config_id",
  as: "staff_leave_config",
});

Staff.hasMany(StaffLeave, {
  foreignKey: "staff_id",
  as: "staff_leaves",
});
StaffLeave.belongsTo(Staff, {
  foreignKey: "staff_id",
  as: "staff",
});


const checkCreditFn = async (instance) => {
  try {
    const config = await StaffLeaveConfig.findByPk(instance?.leave_config_id, {
      include: [
        {
          model: Staff,
          as: 'staffs',
          required: true
        }
      ]
    });
    if (!config) throw new ValidationError("Leave credits not found")
    if (config?.type == "paid") {
      if (config?.days_for == "month") {
        let month_year = {};
        let additional_days = {};
        for (let st_date = new Date(instance?.dataValues?.start_date); st_date <= new Date(instance?.dataValues?.end_date); st_date.setDate(st_date.getDate() + 1)) {
          let key = `${st_date?.getMonth()}_${st_date?.getFullYear()}`;
          if (!month_year[key]) month_year[key] = 0;
          if (!additional_days[key]) additional_days[key] = 0;
          month_year[key] += 1;
          additional_days[key] += 1;
        }
        let arr = Object.keys(month_year);

        if (instance?.start_session == "afternoon") month_year[arr?.[0]] -= 0.5;
        if (instance?.end_session == "forenoon") month_year[arr?.at(-1)] -= 0.5;
        if (instance?.start_session == "afternoon") additional_days[arr?.[0]] -= 0.5;
        if (instance?.end_session == "forenoon") additional_days[arr?.at(-1)] -= 0.5;

        for (let [key, value] of Object.entries(month_year)) {
          let [month, year] = key?.split("_");
          let month_end_date = new Date(+year, +month + 1, 0);
          let month_start_date = new Date(+year, +month, 1);

          let records = await StaffLeave.findAll({
            where: {
              [Op.or]: {
                start_date: {
                  [Op.and]: [
                    sequelize.where(sequelize.fn("EXTRACT", sequelize.literal('YEAR from "start_date"')), year),
                    sequelize.where(sequelize.fn("EXTRACT", sequelize.literal('MONTH from "start_date"')), +month + 1),
                  ],
                },
                end_date: {
                  [Op.and]: [
                    sequelize.where(sequelize.fn("EXTRACT", sequelize.literal('YEAR from "end_date"')), year),
                    sequelize.where(sequelize.fn("EXTRACT", sequelize.literal('MONTH from "end_date"')), +month + 1),
                  ],
                },
              },
              staff_id: instance?.staff_id,
              leave_config_id: instance?.leave_config_id,
              ...(instance?.id && {
                id: {
                  [Op.notIn]: [instance?.id],
                },
              }),
            },
          });
          let taken_days = 0;
          for (let rec of records) {
            let rec_start_date = new Date(rec?.dataValues?.start_date);
            rec_start_date.setHours(0, 0, 0, 0)
            let rec_end_date = new Date(rec?.dataValues?.end_date);
            rec_end_date.setHours(0, 0, 0, 0)

            let is_end_this_month = month_end_date >= rec_end_date;
            let is_start_this_month = month_start_date <= rec_start_date;

            if (!is_end_this_month) rec_end_date = month_end_date;
            if (!is_start_this_month) rec_start_date = month_start_date;

            let leave_count = +getDaysBetweenDates({ start_date: new Date(rec_start_date), end_date: new Date(rec_end_date) })?.toFixed(0);

            if (is_start_this_month && rec?.start_session == "afternoon") leave_count -= 0.5;
            if (is_end_this_month && rec?.end_session == "forenoon") leave_count -= 0.5;
            taken_days += leave_count;
            month_year[key] += leave_count;
          }
          if (month_year[key] > config?.days)
            throw new ValidationError(
              `${config?.name} is allocated at ${config?.days} days per year. You have already taken ${taken_days} days. You cannot take an additional ${additional_days?.[key]} days`
            );
        }
        return { total: month_year, additional_days }

      } else {
        let month_year = {};
        let additional_days = {};
        for (let st_date = new Date(instance?.dataValues?.start_date); st_date <= new Date(instance?.dataValues?.end_date); st_date.setDate(st_date.getDate() + 1)) {
          let key = st_date?.getFullYear();
          if (!month_year[key]) month_year[key] = 0;
          if (!additional_days[key]) additional_days[key] = 0;
          month_year[key] += 1;
          additional_days[key] += 1;
        }
        let arr = Object.keys(month_year);

        if (instance?.start_session == "afternoon") month_year[arr?.[0]] -= 0.5;
        if (instance?.end_session == "forenoon") month_year[arr?.at(-1)] -= 0.5;
        if (instance?.start_session == "afternoon") additional_days[arr?.[0]] -= 0.5;
        if (instance?.end_session == "forenoon") additional_days[arr?.at(-1)] -= 0.5;

        for (let [year, value] of Object.entries(month_year)) {
          let year_end_date = new Date(+year + 1, 0, 0);
          let year_start_date = new Date(+year, 0, 1);

          let records = await StaffLeave.findAll({
            where: {
              [Op.or]: {
                start_date: {
                  [Op.and]: [sequelize.where(sequelize.fn("EXTRACT", sequelize.literal('YEAR from "start_date"')), year)],
                },
                end_date: {
                  [Op.and]: [sequelize.where(sequelize.fn("EXTRACT", sequelize.literal('YEAR from "end_date"')), year)],
                },
              },
              staff_id: instance?.staff_id,
              leave_config_id: instance?.leave_config_id,
              ...(instance?.id && {
                id: {
                  [Op.notIn]: [instance?.id],
                },
              }),
            },
          });
          let taken_days = 0;
          for (let rec of records) {
            let rec_start_date = new Date(rec?.dataValues?.start_date);
            let rec_end_date = new Date(rec?.dataValues?.end_date);

            let is_end_this_year = year_end_date > rec_end_date;
            let is_start_this_year = year_start_date < rec_start_date;

            if (!is_end_this_year) rec_end_date = year_end_date;
            if (!is_start_this_year) rec_start_date = year_start_date;

            let leave_count = +getDaysBetweenDates({ start_date: new Date(rec_start_date), end_date: new Date(rec_end_date) })?.toFixed(0);

            if (is_start_this_year && rec?.start_session == "afternoon") leave_count -= 0.5;
            if (is_end_this_year && rec?.end_session == "forenoon") leave_count -= 0.5;
            taken_days += leave_count;
            month_year[year] += leave_count;
          }
          if (month_year[year] > config?.days)
            throw new ValidationError(
              `${config?.name} is allocated at ${config?.days} days per year. You have already taken ${taken_days} days. You cannot take an additional ${additional_days?.[year]} days`
            );
        }
        return { total: month_year, additional_days }

      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

const checkCredits = async (instance) => {
  await checkCreditFn(instance);
};

const checkAlreadyLeaveThisDate = async (instance) => {
  try {
    let leave = await StaffLeave.findOne({
      where: {
        [Op.or]: {
          start_date: {
            [Op.between]: [instance?.dataValues?.start_date, instance?.dataValues?.end_date],
          },
          end_date: {
            [Op.between]: [instance?.dataValues?.start_date, instance?.dataValues?.end_date],
          },
        },
        staff_id: instance?.staff_id,
        ...(instance?.id && {
          id: {
            [Op.ne]: instance?.id
          }
        }),
      },
    });
    if (leave) throw new ValidationError("Leave already taken date range");
  } catch (error) {
    throw new Error(error);
  }
};

StaffLeave.beforeCreate("create_check_leave_exist", checkAlreadyLeaveThisDate);
StaffLeave.beforeCreate("create_check_credits", checkCredits);
StaffLeave.beforeUpdate("update_check_leave_exist", checkAlreadyLeaveThisDate);
StaffLeave.beforeUpdate("update_check_credits", checkCredits);

module.exports = { StaffLeave, checkCreditFn };
