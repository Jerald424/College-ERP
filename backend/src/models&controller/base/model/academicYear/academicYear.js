const { DataTypes, ValidationError } = require("sequelize");
const sequelize = require("../../../../sequelize");
const moment = require('moment');

//check active
const checkAcActive = async (academic_year) => {
    try {
        if (academic_year?.dataValues?.active) await AcademicYear.update({ active: false }, { where: { active: true } })
    } catch (error) {
        console.error(error)
        throw new ValidationError(error)
    }
}

const AcademicYear = sequelize.define('academic_year', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('start_date');
            return rawValue ? moment(rawValue)?.format('DD-MM-YYYY') : null
        }
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('end_date');
            return rawValue ? moment(rawValue)?.format('DD-MM-YYYY') : null
        }
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "academic_year",
    hooks: {
        beforeCreate: async (academic_yr) => {
            await checkAcActive(academic_yr);
        },
        beforeUpdate: async (academic_yr) => {
            await checkAcActive(academic_yr);
        }
    }
})

module.exports = AcademicYear;