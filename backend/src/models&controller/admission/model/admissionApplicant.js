const { DataTypes, ValidationError } = require('sequelize');
const sequelize = require('../../../sequelize');
const { enum_values } = require('../../../utils/enum');

const { Programme } = require('./programme');
const State = require('../../base/model/state')
const District = require('../../base/model/district');
const AcademicYear = require('../../base/model/academicYear/academicYear');
const ApplicationFee = require('./applicationFee');
const ApplicantFee = require('./applicantFee');

//load default academic year
const loadAcademicYear = async (applicant) => {
    try {
        const active_ac = await AcademicYear.findOne({ where: { active: true } });
        if (!active_ac) throw new ValidationError("No active academic year found.");
        applicant['academic_year_id'] = active_ac?.id;
    } catch (error) {
        throw new Error(error)
    }
}

//generate application no
const generateApplicationNo = async (applicant) => {
    try {

        let programme = await Programme.findByPk(applicant?.programme_id);
        if (programme) {
            let applicant_count = await AdmissionApplicant.count({ where: { programme_id: applicant?.programme_id } });
            applicant['application_no'] = `${programme?.name}-${applicant_count + 1}`;
        } else throw new Error("Programme not found");
    } catch (error) {
        throw new Error(error);
    }
}

// generate fees.
const generateApplicationFee = async (applicant) => {
    try {
        let p_level_fees = await ApplicationFee.findOne({ where: { programme_level_id: applicant?.dataValues?.programme_level } });
        if (!p_level_fees) throw new ValidationError("Application fees is not created for this programme level");
        await ApplicantFee.create({ applicant_id: applicant?.dataValues?.id, application_fee_id: p_level_fees?.id })
    } catch (error) {
        throw new Error(error)
    }
}

const AdmissionApplicant = sequelize.define('admission_applicant', {
    //user
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "username must be unique"
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "Mobile no must be unique"
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    image: DataTypes.TEXT,
    gender: {
        type: DataTypes.ENUM(...enum_values?.gender?.map(res => res?.id))
    },
    programme_level: {
        type: DataTypes.ENUM(...enum_values?.programme_level?.map(res => res?.id))
    },
    programme_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Programme,
            key: "id"
        }
    },
    status: {
        type: DataTypes.ENUM(...enum_values?.applicant_status?.map(res => res?.id)),
        defaultValue: "draft"
    },
    application_no: {
        type: DataTypes.STRING
    },
    academic_year_id: {
        type: DataTypes.INTEGER,
        references: {
            model: AcademicYear,
            key: "id"
        }
    },
    // applicant_fee_id: {
    //     type: DataTypes.INTEGER,
    //     references: {
    //         model: ApplicationFee,
    //         key: "id"
    //     }
    // },
    //academic
    ['10th_marksheet']: DataTypes.TEXT,
    ['12th_marksheet']: DataTypes.TEXT,
    ['12th_mark']: DataTypes.STRING,
    ['10th_mark']: DataTypes.STRING,

    //personal
    address: DataTypes.TEXT,
    state_id: {
        type: DataTypes.INTEGER,
        references: {
            model: State,
            key: "id"
        }
    },
    district_id: {
        type: DataTypes.INTEGER,
        references: {
            model: District,
            key: "id"
        }
    }

}, {
    tableName: "admission_applicant",

    hooks: {
        beforeCreate: async (applicant) => {
            await loadAcademicYear(applicant?.dataValues);
        },
        beforeUpdate: async (applicant) => {
            if (applicant?._previousDataValues?.status == 'draft' && applicant?.dataValues?.status == 'submit') {
                await generateApplicationNo(applicant?.dataValues);
                await generateApplicationFee(applicant)
            }
        },

    }
})

Programme.hasOne(AdmissionApplicant, {
    foreignKey: "programme_id",
    as: "applicant"
});
AdmissionApplicant.belongsTo(Programme, {
    foreignKey: "programme_id",
    as: "programme"
})

District.hasMany(AdmissionApplicant, {
    foreignKey: "district_id",
    as: "applicant"
});
AdmissionApplicant.belongsTo(District, {
    foreignKey: "district_id",
    as: "district"
})

State.hasMany(AdmissionApplicant, {
    foreignKey: 'state_id',
    as: "applicant"
})
AdmissionApplicant.belongsTo(State, {
    foreignKey: "state_id",
    as: "state"
})

AcademicYear.hasMany(AdmissionApplicant, {
    foreignKey: "academic_year_id",
    as: "applicant"
})

AdmissionApplicant.belongsTo(AcademicYear, {
    foreignKey: "academic_year_id",
    as: "academic_year"
})

AdmissionApplicant.hasOne(ApplicantFee, {
    foreignKey: "applicant_id",
    as: "applicant_fee",
    onDelete: "CASCADE"
});

ApplicantFee.belongsTo(AdmissionApplicant, {
    foreignKey: "applicant_id",
    as: "applicant",
    onDelete: "CASCADE"
})

module.exports = { AdmissionApplicant };