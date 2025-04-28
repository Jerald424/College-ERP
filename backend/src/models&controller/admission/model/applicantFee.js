const { DataTypes, ValidationError } = require("sequelize");
const sequelize = require("../../../sequelize");
const ApplicationFee = require("./applicationFee");

const ApplicantFee = sequelize.define('applicant_fee', {
    paid: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
}, {
    tableName: "applicant_fee",
    hooks: {

    }
});




module.exports = ApplicantFee;