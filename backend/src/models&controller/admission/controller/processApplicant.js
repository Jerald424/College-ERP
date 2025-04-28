const router = require('express').Router();

const { Op } = require('sequelize');
const { returnValue, applyPagination, applyAcademicYear, selectionFormat, checkValuesAreExist, applyAttributes } = require('../../../functions/handleData');
const { AdmissionApplicant } = require('../model/admissionApplicant');
const ApplicantFee = require('../model/applicantFee');
const ApplicationFee = require('../model/applicationFee');
const { Programme } = require('../model/programme');
require('./hooks/processFee');

router.get('/fee-process-list', async (req, res) => {
    try {

        let applicant = await AdmissionApplicant.findAndCountAll({
            attributes: [
                'name', 'programme_level', 'id', "status"
            ],
            include: [
                {
                    model: ApplicantFee,
                    as: "applicant_fee",
                    include: [
                        {
                            model: ApplicationFee,
                            as: "application_fee",
                            attributes: ['id', 'name', 'amount']
                        }
                    ],
                    attributes: ['id', 'paid']
                },
                {
                    model: Programme,
                    as: "programme",
                    attributes: ['id', 'name']
                }
            ],
            ...applyPagination({ req }),
            where: {
                ...applyAcademicYear({ req }),
                status: { [Op.notIn]: ['draft'] }
            }
        });
        selectionFormat({ data: applicant?.rows, format: [{ enum: "programme_level", key: "programme_level" }, { enum: "applicant_status", key: "status" }] });
        returnValue({ res, response: applicant })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/fee-process/:id', async (req, res) => {
    try {
        const { id } = req.params;

        let applicant = await AdmissionApplicant.findByPk(id, {
            attributes: [
                'name', 'programme_level', 'id',
            ],
            include: [
                {
                    model: ApplicantFee,
                    as: "applicant_fee",
                    include: [
                        {
                            model: ApplicationFee,
                            as: "application_fee",
                            attributes: ['id', 'name', 'amount']
                        }
                    ],
                    attributes: ['id', 'paid']
                },
                {
                    model: Programme,
                    as: "programme",
                    attributes: ['id', 'name']
                }
            ],
            ...applyPagination({ req }),
        });
        selectionFormat({ data: applicant, format: [{ enum: "programme_level", key: "programme_level" },] })
        returnValue({ res, response: applicant })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


router.post('/collect-application-fee', async (req, res) => {
    try {
        /*
            collect_fee:{
                applicant_id:<number>,
                paid:<number>
            }
        */
        const { collect_fee } = req.body;
        const valuesCheck = checkValuesAreExist({ applicant_id: collect_fee?.applicant_id, paid: collect_fee?.paid })
        if (valuesCheck) return returnValue({ res, error: `${valuesCheck} are required`, status: 400 });
        const response = await ApplicantFee.update(
            {
                paid: collect_fee?.paid
            },
            {
                where: {
                    applicant_id: collect_fee?.applicant_id
                },
                returning: true,
                individualHooks: true,
                user_id: req?.['headers']?.user_id,
                record_id: collect_fee?.applicant_id
            })
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


router.post('/process-applicant/:status', async (req, res) => {
    try {
        let { applicant_ids } = req.body;
        let { status } = req.params;
        applicant_ids = applicant_ids?.map(Number);
        const response = await AdmissionApplicant.update({ status }, { where: { id: { [Op.in]: applicant_ids } }, individualHooks: true })
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});


//selection
router.get('/selected-applicant/:programme_id', async (req, res) => {
    try {
        const { programme_id } = req.params;

        let status = req.query?.['status'] ?? 'submit';

        const applicant = await AdmissionApplicant.findAll({
            where: { programme_id, status, ...applyAcademicYear({ req }) },
            include: [
                {
                    model: ApplicantFee,
                    as: "applicant_fee",
                    required: true,
                    include: [
                        {
                            model: ApplicationFee,
                            as: "application_fee",
                            where: {
                                amount: { [Op.col]: 'applicant_fee.paid' }
                            },
                            required: true,

                        }
                    ]
                }
            ],
            ...applyAttributes({ req })

        })
        selectionFormat({ data: applicant, format: [{ enum: 'gender', key: 'gender' }] })
        returnValue({ res, response: applicant })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;