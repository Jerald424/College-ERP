const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { FeedbackForm } = require("./form");
const { FeedbackQuestions } = require("./question");
const { FeedbackQuestionOptions } = require("./questionOptions");
const Users = require("../../base/user/model/user");

const FeedbackAnswer = sequelize.define('feedback_answer', {
    text_answer: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: "feedback_answer",
    indexes: [
        {
            fields: ['feedback_form_id', "question_id", "user_id"],
            unique: true
        }
    ]
});

const AnswerOptions = sequelize.define('feedback_answer_options', {}, { tableName: "feedback_answer_options" });
FeedbackAnswer.belongsToMany(FeedbackQuestionOptions, {
    through: AnswerOptions,
    as: "options"
});
FeedbackQuestionOptions.belongsToMany(FeedbackAnswer, {
    through: AnswerOptions,
    as: "answer"
});

FeedbackForm.hasMany(FeedbackAnswer, {
    foreignKey: "feedback_form_id",
    as: "answers"
});
FeedbackAnswer.belongsTo(FeedbackForm, {
    foreignKey: "feedback_form_id",
    as: "form"
});

FeedbackQuestions.hasMany(FeedbackAnswer, {
    foreignKey: "question_id",
    as: 'answers'
});
FeedbackAnswer.belongsTo(FeedbackQuestions, {
    foreignKey: "question_id",
    as: "question"
});

// FeedbackQuestionOptions.hasMany(FeedbackAnswer, {
//     foreignKey: "option_id",
//     as: "answers"
// });
// FeedbackAnswer.belongsTo(FeedbackQuestionOptions, {
//     foreignKey: "option_id",
//     as: "option"
// });

Users.hasMany(FeedbackAnswer, {
    foreignKey: "user_id",
    as: "feedback_answers",
});
FeedbackAnswer.belongsTo(Users, {
    foreignKey: "user_id",
    as: "user"
});

module.exports = { FeedbackAnswer, AnswerOptions };