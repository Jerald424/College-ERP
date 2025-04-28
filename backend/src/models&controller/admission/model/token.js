const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { AdmissionApplicant } = require("./admissionApplicant");

const AdmissionToken = sequelize.define('admission_token',
    {
        applicant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: AdmissionApplicant,
                key: "id"
            }
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    { tableName: "admission_token" }
);

AdmissionApplicant.hasOne(AdmissionToken, { foreignKey: "applicant_id", as: "token", onDelete: "CASCADE" })
AdmissionToken.belongsTo(AdmissionApplicant, { foreignKey: "applicant_id", as: "applicant", onDelete: "CASCADE" })

module.exports = AdmissionToken;