const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { enum_values } = require("../../../utils/enum");
const { ExamConfig } = require("./examConfig");


const Exam = sequelize.define('exam', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.ENUM(...enum_values.exam_type?.map(res => res?.id)),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "exam"
});

ExamConfig.hasMany(Exam, {
    foreignKey: "exam_config_id",
    as: "exam",
    onDelete: "CASCADE"
});

Exam.belongsTo(ExamConfig, {
    foreignKey: "exam_config_id",
    as: "exam_config",
    onDelete: "CASCADE"
});

const changeActive = async (instance) => {
    try {
        if (instance?.is_active) await Exam.update({ is_active: false }, { where: { is_active: true } })
    } catch (error) {
        throw new Error(error);
    }
}

Exam.beforeCreate('create_update_is_active', changeActive)
Exam.beforeUpdate('update_update_is_active', changeActive)

module.exports = { Exam };