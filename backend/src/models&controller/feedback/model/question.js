const { DataTypes } = require('sequelize');
const sequelize = require('../../../sequelize');
const { enum_values } = require('../../../utils/enum');
const { FeedbackQuestionOptions } = require('./questionOptions');


const FeedbackQuestions = sequelize.define('feedback_questions', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM(...enum_values.feedback_question_type?.map(res => res?.id)),
    }
}, {
    tableName: "feedback_questions"
});

FeedbackQuestions.beforeUpdate('remove_question_options', async (instance) => {
    try {

        if (
            ['dropdown-multiple', 'dropdown-single'].includes(instance?._previousDataValues?.type) &&
            !['dropdown-multiple', 'dropdown-single'].includes(instance?.dataValues?.type)

        )
            await FeedbackQuestionOptions.destroy({ where: { question_id: instance?.dataValues?.id } })
    } catch (error) {
        throw new Error(error)
    }
})


FeedbackQuestions.hasMany(FeedbackQuestionOptions, {
    foreignKey: "question_id",
    as: "question_options"
});
FeedbackQuestionOptions.belongsTo(FeedbackQuestions, {
    foreignKey: "question_id",
    as: "question"
});

module.exports = { FeedbackQuestions };