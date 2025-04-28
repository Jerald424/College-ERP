const { returnValue } = require("../../../../functions/handleData");
const UserToken = require("../model/userToken");

const verifyUserToken = async (req, res, next) => {
    try {
        const token = req.headers['user-token'];
        if (!!!token) return returnValue({ res, status: 401, error: "Provide token" });
        let user_token = await UserToken.findOne({ where: { token } })
        if (!user_token) return returnValue({ res, status: 401, error: "Token not found" })
        req.headers['user_id'] = user_token?.user_id;
        next();
    } catch (error) {
        returnValue({ res, error, status: 500 })

    }
}

module.exports = { verifyUserToken };