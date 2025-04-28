const { ValidationError } = require("sequelize");
const AcademicYear = require("../../../base/model/academicYear/academicYear");
const Class = require("../../../department/model/class");
const StudentCampusYear = require("../../../student/model/campusYear");
const Student = require("../../../student/model/student");
const { AdmissionApplicant } = require("../../model/admissionApplicant");
const ApplicantFee = require("../../model/applicantFee");
const ApplicationFee = require("../../model/applicationFee");
const { generateRollNo } = require("../../../student/function/generateRollNo");

ApplicantFee.beforeUpdate('update_fee', async (instance) => {
    try {
        let total_paid = +instance['dataValues']['paid'] + +instance['_previousDataValues']?.paid || 0;
        let schedule = await ApplicationFee.findByPk(instance['dataValues']?.application_fee_id);
        if (+total_paid > schedule?.amount) throw new ValidationError("Cannot pay more than due.");
        instance['dataValues']['paid'] = total_paid;
    } catch (error) {
        throw new Error(error)
    }

})

AdmissionApplicant.beforeUpdate('create_student', async (instance) => {
    try {
        if (instance.dataValues?.status == 'student_created') {
            let active_ac_year = await AcademicYear.findOne({ where: { active: true } });
            if (!active_ac_year) throw new ValidationError("Active ac.year not found");
            let first_year_of_prog = await Class.findOne({
                where: {
                    programme_id: instance?.dataValues?.programme_id,
                    year: '1',
                }
            })
            if (!first_year_of_prog) throw new ValidationError("Class not found for selected programme");

            if (active_ac_year && first_year_of_prog) {
                let roll_no = await generateRollNo({ instance, academic_year: active_ac_year });
                let student = await Student.create({ applicant_id: instance?.dataValues?.id, roll_no }, { returning: true });
                await StudentCampusYear.create({
                    student_id: student?.id,
                    academic_year_id: active_ac_year?.id,
                    class_id: first_year_of_prog?.id,
                })
            }

        }
    } catch (error) {
        throw new Error(error)
    }
})