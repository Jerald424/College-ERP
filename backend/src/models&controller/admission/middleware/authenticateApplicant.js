const { returnValue } = require("../../../functions/handleData");
const AdmissionToken = require("../model/token");

async function authenticateApplicant(req, res, next) {
    try {
        let token = req?.headers['admission-token'];
        if (!token) return returnValue({ res, error: "Provide a token", status: 401 });
        let applicant_token = await AdmissionToken.findOne({ where: { token } })
        if (!applicant_token) return returnValue({ res, error: "Token not found.", status: 401 });
        req.headers['applicant_id'] = applicant_token?.['applicant_id'];
        next();
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
}

module.exports = { authenticateApplicant }