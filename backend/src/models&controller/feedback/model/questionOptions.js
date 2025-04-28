const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const FeedbackQuestionOptions = sequelize.define('feedback_question_options', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "feedback_question_options"
});



module.exports = { FeedbackQuestionOptions };