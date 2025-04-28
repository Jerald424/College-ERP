const { DataTypes } = require('sequelize');
const sequelize = require('../../../sequelize')
const AcademicYear = require('../../base/model/academicYear/academicYear');

const InstitutionProfile = sequelize.define('institution', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    description: {
        type: DataTypes.TEXT
    },
    image: DataTypes.TEXT
}, {
    tableName: "institution_profile",

});

AcademicYear.hasOne(InstitutionProfile, {
    foreignKey: "academic_year_id",
    as: "institution_profile"
});
InstitutionProfile.belongsTo(AcademicYear, {
    foreignKey: "academic_year_id",
    as: "academic_year"
});

module.exports = InstitutionProfile;
