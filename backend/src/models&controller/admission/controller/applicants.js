const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat, applyAcademicYear } = require('../../../functions/handleData');
const { enum_values } = require('../../../utils/enum');
const District = require('../../base/model/district');
const State = require('../../base/model/state');
const { AdmissionApplicant } = require('../model/admissionApplicant');
const { Programme } = require('../model/programme');
const AcademicYear = require('../../base/model/academicYear/academicYear');

const router = require('express').Router();

router.get('/applicants', async (req, res) => {
    try {

        let applicants = await AdmissionApplicant.findAndCountAll({
            attributes: [
                'id',
                'name',
                'status',
                'application_no',
                'image',
                'academic_year_id'
            ],
            include: [
                {
                    model: Programme,
                    as: 'programme'
                },

            ],
            where: { ...applyAcademicYear({ req }) },
            ...applyPagination({ req })
        });

        selectionFormat({ data: applicants?.rows, format: [{ key: "gender", enum: "gender" }, { key: "status", enum: "applicant_status" }] })
        returnValue({ res, response: applicants })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/applicants/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await AdmissionApplicant.destroy({ where: { id: { [Op.in]: ids } }, cascade: true });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/applicant/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let applicant = await AdmissionApplicant.findOne({
            include: [
                {
                    model: Programme,
                    as: 'programme'
                },
                {
                    model: State,
                    as: 'state'
                },
                {
                    model: District,
                    as: "district"
                },
                {
                    model: AcademicYear,
                    as: "academic_year"
                }
            ],
            where: { id }
        });
        selectionFormat({
            data: applicant, format: [
                { enum: "gender", key: "gender" },
                { enum: "applicant_status", key: "status" },
                { enum: "programme_level", key: "programme_level" },
            ]
        })
        returnValue({ res, response: applicant })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;