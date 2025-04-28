const { Op } = require('sequelize');
const { returnValue, selectionFormat, applyPagination } = require('../../../functions/handleData');
const { AdmissionApplicant } = require('../../admission/model/admissionApplicant');
const { Programme } = require('../../admission/model/programme');
const AcademicYear = require('../../base/model/academicYear/academicYear');
const StudentCampusYear = require('../model/campusYear');
const Student = require('../model/student');
const Class = require('../../department/model/class');

const router = require('express').Router();

router.get('/student', async (req, res) => {
    try {
        let academic_year_id = req.query?.['academic_year_id'];
        let status = req?.query?.['status'] ?? 'in_progress';

        const student = await Student.findAndCountAll({
            ...applyPagination({ req }),
            include: [
                {
                    model: StudentCampusYear,
                    as: "campus_year",
                    require: true,
                    where: {
                        academic_year_id,
                        status
                    },
                    attributes: []
                },
                {
                    model: AdmissionApplicant,
                    as: "applicant",
                    attributes: ['id', 'name', 'image'],
                    include: [
                        {
                            model: Programme,
                            as: "programme",
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        returnValue({ res, response: student })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id, {
            include: [
                {
                    model: StudentCampusYear,
                    as: "campus_year",
                    include: [
                        {
                            model: AcademicYear,
                            as: "academic_year",
                            attributes: ['id', 'name']
                        },
                        {
                            model: Class,
                            as: 'class'
                        }
                    ]
                },
                {
                    model: AdmissionApplicant,
                    as: 'applicant'
                }
            ]
        });
        selectionFormat({
            data: student?.applicant, format: [
                { enum: "gender", key: "gender" },
                { enum: "applicant_status", key: "status" },
                { enum: "programme_level", key: "programme_level" },
            ]
        })
        student?.['campus_year']?.forEach(campus_year => {
            selectionFormat({ data: campus_year, format: [{ enum: "student_campus_year_status", key: "status" }] })
        })
        returnValue({ res, response: student })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/student/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        console.log('ids: ', ids);
        let response = await Student.destroy({ where: { id: { [Op.in]: ids } }, cascade: true });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

module.exports = router;