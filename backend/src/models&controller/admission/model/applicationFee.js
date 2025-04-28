const { DataTypes, ValidationError, Op } = require("sequelize");
const sequelize = require("../../../sequelize");
const { enum_values } = require("../../../utils/enum");
const AcademicYear = require("../../base/model/academicYear/academicYear");
const ApplicantFee = require("./applicantFee");

const checkProgrammeLevelFees = async (application_fee) => {
    try {
        let prev_count = await ApplicationFee.count({
            where: {
                programme_level_id: application_fee?.dataValues?.programme_level_id,
                id: {
                    [Op.notIn]: [application_fee?.dataValues?.id]
                }
            }
        });
        if (prev_count > 0) throw new ValidationError("Fees already created for this programme level");

    } catch (error) {
        throw new Error(error)
    }
}

const ApplicationFee = sequelize.define('application_fee', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    programme_level_id: {
        type: DataTypes.ENUM(...enum_values?.programme_level?.map(res => res?.id)),
        allowNull: false
    },
    academic_year_id: {
        type: DataTypes.INTEGER,
        references: {
            model: AcademicYear,
            key: "id"
        }
    }
}, {
    tableName: "application_fee",
    hooks: {
        beforeCreate: async (application_fee) => {
            await checkProgrammeLevelFees(application_fee);
        },
        beforeUpdate: async (application_fee) => {
            await checkProgrammeLevelFees(application_fee);
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['programme_level_id', 'academic_year_id'],
        }
    ],
});

AcademicYear.hasMany(ApplicationFee, {
    foreignKey: "academic_year_id",
    as: "academic_application_fee"
});

ApplicationFee.belongsTo(AcademicYear, {
    foreignKey: "academic_year_id",
    as: "academic_year"
});

ApplicationFee.hasMany(ApplicantFee, {
    foreignKey: "application_fee_id",
    as: "applicant_fee"
})

ApplicantFee.belongsTo(ApplicationFee, {
    foreignKey: "application_fee_id",
    as: "application_fee"
})


module.exports = ApplicationFee;