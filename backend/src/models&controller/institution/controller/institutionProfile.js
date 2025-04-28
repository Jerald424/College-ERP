const { Op } = require('sequelize');
const { returnValue, checkValuesAreExist, applyPagination } = require('../../../functions/handleData');
const AcademicYear = require('../../base/model/academicYear/academicYear');
const InstitutionProfile = require('../model/institution');
require('../hooks/institutionProfile');
const router = require('express').Router();

//admin
router.post('/institution-profile', async (req, res) => {
    try {
        const { institution_profile } = req.body;
        const valuesCheck = checkValuesAreExist({ name: institution_profile?.name, academic_year_id: institution_profile?.academic_year_id });
        if (valuesCheck) return returnValue({ res, error: `${valuesCheck} are required`, status: 400 })
        const response = await InstitutionProfile.create(institution_profile, { returning: true });
        returnValue({ res, response: response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put("/institution-profile/:id", async (req, res) => {
    try {
        const { institution_profile } = req.body;
        const { id } = req.params;

        const [count, updated] = await InstitutionProfile.update(institution_profile, { where: { id }, returning: true })
        if (!count > 0) return returnValue({ res, error: "Institution profile not found", status: 400 });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/institution-profile', async (req, res) => {
    try {

        const response = await InstitutionProfile.findAndCountAll({
            include: [
                {
                    model: AcademicYear,
                    as: "academic_year"
                }
            ],
            ...applyPagination({ req })
        })

        returnValue({ res, response })
    } catch (error) {

        returnValue({ res, error, status: 500 })

    }

});

router.delete('/institution-profile/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await InstitutionProfile.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/institution-profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await InstitutionProfile.findByPk(id)
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

//student
router.get('/active-institution', async (req, res) => {
    try {
        const response = await InstitutionProfile.findOne({
            where: {
                is_active: true
            },
            include: [
                {
                    model: AcademicYear,
                    as: "academic_year",
                    required: true,
                    where: {
                        active: true
                    }
                }
            ]
        });

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;