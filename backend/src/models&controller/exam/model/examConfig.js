const { DataTypes } = require('sequelize')
const sequelize = require('../../../sequelize');
const Term = require('../../base/model/academicYear/term')

const ExamConfig = sequelize.define('exam_config', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    internal: DataTypes.INTEGER,
    external: DataTypes.INTEGER,
    internal_pass_mark: DataTypes.INTEGER,
    external_pass_mark: DataTypes.INTEGER,
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "exam_config"
});

Term.hasMany(ExamConfig, {
    foreignKey: "term_id",
    as: "exam_config"
});
ExamConfig.belongsTo(Term, {
    foreignKey: "term_id",
    as: 'term'
});

const changeActive = async (instance) => {
    try {
        if (instance?.is_active) await ExamConfig.update({ is_active: false }, {
            where: {
                term_id: instance?.term_id,
                is_active: true
            }
        });
    } catch (error) {
        throw new Error(error);
    }
}

ExamConfig.beforeCreate('create_active_check', changeActive);
ExamConfig.beforeUpdate('update_active_check', changeActive)

module.exports = { ExamConfig };
