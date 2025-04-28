const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { enum_values } = require("../../../utils/enum");
const Department = require("../../department/model/department");
const { FeedbackQuestions } = require("./question");

const FeedbackForm = sequelize.define("feedback_form", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    feedback_for: {
        type: DataTypes.ENUM(...enum_values.feedback_form_for?.map(res => res?.id)),
    },
    level: {
        type: DataTypes.ENUM(...enum_values.feedback_form_level?.map(res => res?.id)),
    },
    start_date: {
        type: DataTypes.DATE,
    },
    end_date: {
        type: DataTypes.DATE,
    }
}, {
    tableName: "feedback_form"
});

const FeedbackDepartment = sequelize.define('feedback_form_department', {}, { tableName: "feedback_form_department" });

FeedbackForm.belongsToMany(Department, {
    through: FeedbackDepartment,
    as: "feedback_form_departments",
    onDelete: "CASCADE"
});
Department.belongsToMany(FeedbackForm, {
    through: FeedbackDepartment,
    as: "feedback_form",
    onDelete: "CASCADE"
});

const FeedbackFormQuestions = sequelize.define('feedback_form_questions', {}, { tableName: 'feedback_form_questions' });

FeedbackQuestions.belongsToMany(FeedbackForm, {
    through: FeedbackFormQuestions,
    as: "questions_forms"
});
FeedbackForm.belongsToMany(FeedbackQuestions, {
    through: FeedbackFormQuestions,
    as: 'form_questions'
})

module.exports = { FeedbackForm, FeedbackDepartment, FeedbackFormQuestions };