const { returnValue } = require('../../../functions/handleData');
const { AdmissionApplicant } = require('../model/admissionApplicant');
const sequelize = require('../../../sequelize');
const { enum_values } = require('../../../utils/enum');
const { Programme } = require('../model/programme');
const State = require('../../base/model/state');
const District = require('../../base/model/district');
const ApplicantFee = require('../model/applicantFee');
const ApplicationFee = require('../model/applicationFee');

const router = require('express').Router();

router.get('/fields', async (req, res) => {
    try {
        let response = AdmissionApplicant.getAttributes();
        let rm_field = ['id', 'username', 'password', 'createdAt', 'updatedAt'];
        rm_field?.forEach(res => {
            delete response[res]
        });
        let arr = Object.entries(response)
        for (let [field, value] of arr) {
            response[field]['field_type'] = value?.type?.key;
            if (value?.references) {

                response[field]['options'] = await sequelize.models[value?.references?.model].findAll();
            }
            else response[field]['options'] = enum_values?.[value?.fieldName];
        }

        returnValue({ res, response })

    } catch (error) {
        returnValue({ res, error: error?.message, status: 500 })
    }
});

router.get('/support-data', async (_, res) => {
    try {
        let response = { ...enum_values };
        //programme
        let programme = await Programme.findAll();
        let state = await State.findAll();
        let district = await District.findAll();
        response['programme'] = programme;
        response['state'] = state;
        response['district'] = district;
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error: error, status: 500 });
    }
})

router.post('/create-applicant', async (req, res) => {
    try {
        let { applicant } = req.body;
        let mandatory_fields = ['mobile', 'email'];
        if (mandatory_fields?.some(res => !applicant?.[res])) return returnValue({ res, status: 400, error: "Required fields are missing" });
        Object.assign(applicant, { username: applicant?.mobile, password: applicant?.mobile })
        let created_app = await AdmissionApplicant.create(applicant);

        returnValue({ res, response: created_app })
    } catch (error) {
        returnValue({ res, error, status: 500 })

    }
});

router.get('/applicant-details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await AdmissionApplicant.findByPk(id);
        returnValue({ response, res })
    } catch (error) {
        returnValue({ res, status: 500, error })
    }
})

router.put('/update-applicant/:id', async (req, res) => {
    try {
        let { applicant } = req.body;
        let { id } = req.params;
        let [_, update] = await AdmissionApplicant.update(applicant, { where: { id }, returning: true, individualHooks: true, applicant_id: id })
        returnValue({ res, response: update?.[0] })
    } catch (error) {
        console.log('error: ', error);
        returnValue({ res, error, status: 500 })
    }
});

router.get('/applicant-fee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const applicant = await AdmissionApplicant.findOne({
            where: { id },
            include: [
                {
                    model: ApplicantFee,
                    as: "applicant_fee",
                    include: [
                        { model: ApplicationFee, as: "application_fee" }
                    ]
                }
            ]
        });
        returnValue({ res, response: applicant?.applicant_fee })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;