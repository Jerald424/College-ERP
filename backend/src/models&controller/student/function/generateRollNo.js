const { ValidationError } = require("sequelize");
const { Programme } = require("../../admission/model/programme")
const Department = require("../../department/model/department");
const Student = require("../model/student");
const { AdmissionApplicant } = require("../../admission/model/admissionApplicant");

const generateRollNo = async ({ instance, academic_year }) => {
    try {
        let programme = await Programme.findByPk(instance?.dataValues?.programme_id, {
            include: [
                {
                    model: Department,
                    as: "department",
                    required: true
                }
            ]
        });
        if (!programme?.department) throw new ValidationError("Department not found this programme");
        let [_, __, year] = academic_year?.start_date?.split('-');
        let stdCount = await Student.count({
            include: [
                {
                    model: AdmissionApplicant,
                    as: "applicant",
                    required: true,
                    include: [
                        {
                            model: Programme,
                            as: "programme",
                            required: true,
                            include: [
                                {
                                    model: Department,
                                    as: "department",
                                    required: true,
                                    where: {
                                        id: programme?.department?.id
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        return `${instance?.dataValues?.programme_level}${programme?.department?.code}${year?.slice(-2)}${stdCount + 1}`
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = { generateRollNo }