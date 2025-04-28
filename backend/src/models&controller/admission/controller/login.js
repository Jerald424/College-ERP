const { returnValue, generateRandomText } = require('../../../functions/handleData');
const { REQUIRED_FIELDS_ARE_MISSING } = require('../../../functions/variables');
const { authenticateApplicant } = require('../middleware/authenticateApplicant');
const { AdmissionApplicant } = require('../model/admissionApplicant');
const AdmissionToken = require('../model/token')

const router = require('express').Router();

router.post('/login', async (req, res) => {
    try {
        const { payload } = req.body;
        if ([payload?.username, payload?.password].some(res => !res)) return returnValue({ error: REQUIRED_FIELDS_ARE_MISSING, res, status: 400 })
        const applicant = await AdmissionApplicant.findOne({ where: { username: payload?.username } })
        if (!applicant) return returnValue({ error: "username not found", res, status: 401 });
        if (applicant?.password !== payload?.password) return returnValue({ error: "username and password does't match", res, status: 401 });
        let token = generateRandomText();
        await AdmissionToken.create({ applicant_id: applicant?.id, token })
        returnValue({ res, response: { applicant, token, role: "applicant" } })
    } catch (error) {
        returnValue({ error, res, status: 500 })
    }
});

router.get('/verify-token', authenticateApplicant, async (req, res) => {
    try {
        const { applicant_id } = req.headers;
        let applicant = await AdmissionApplicant.findOne({ where: { id: applicant_id } });
        returnValue({ res, response: { applicant, role: "applicant" } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;