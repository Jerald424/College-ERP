const { DataTypes } = require("sequelize");
const sequelize = require("../../../../sequelize");
const AcademicYear = require("./academicYear");
const moment = require('moment');


const makeIsActive = async (instance) => {
    try {
        if (instance?.dataValues?.is_active && instance?.dataValues?.academic_year_id) await Term.update(
            { is_active: false },
            { where: { academic_year_id: instance?.dataValues?.academic_year_id } }
        )
    } catch (error) {
        throw new Error(error)
    }
};

const Term = sequelize.define('term', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        get() {
            const rawValue = this.getDataValue('start_date');
            return rawValue ? moment(rawValue)?.format('DD-MM-YYYY') : null
        }
    },
    end_date: {
        type: DataTypes.DATEONLY,
        get() {
            const rawValue = this.getDataValue('end_date');
            return rawValue ? moment(rawValue)?.format('DD-MM-YYYY') : null
        }
    }
}, {
    tableName: 'term'
});

AcademicYear.hasMany(Term, {
    foreignKey: "academic_year_id",
    as: "term"
});
Term.belongsTo(AcademicYear, {
    foreignKey: "academic_year_id",
    as: "academic_year"
});

Term.beforeCreate('change_is_active_create', makeIsActive)
Term.beforeUpdate('change_is_active_update', makeIsActive)

module.exports = Term;