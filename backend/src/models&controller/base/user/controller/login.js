const { returnValue, checkValuesAreExist, generateRandomText, selectionFormat } = require('../../../../functions/handleData');
const { AdmissionApplicant } = require('../../../admission/model/admissionApplicant');
const { Staff } = require('../../../staff/model/staff');
const Student = require('../../../student/model/student');
const { verifyUserToken } = require('../middleware/verifyUserToken');
const Role = require('../model/role');
const Users = require('../model/user');
const UserRoles = require('../model/userRole');
const UserToken = require('../model/userToken');

const router = require('express').Router();

router.post('/login', async (req, res) => {
    try {
        const { payload } = req.body;
        const valuesCheck = checkValuesAreExist({ username: payload?.username, password: payload?.password });
        if (valuesCheck) return returnValue({ res, status: 400, error: `${valuesCheck} are required` })
        const user = await Users.findOne({ where: { username: payload?.username }, include: [{ model: UserRoles, as: 'user_roles', include: [{ model: Role, as: "roles" }] }] })
        if (!user) return returnValue({ res, status: 401, error: "User name not found." });
        if (payload?.password !== user?.password) return returnValue({ res, status: 401, error: "User name and password are not match" });

        const activeRole = user?.user_roles?.find(res => res?.is_active);
        if (!activeRole) return returnValue({ res, status: 400, error: "No active role found." });
        let token = generateRandomText();
        await UserToken.create({ token, user_id: user?.id });
        returnValue({ res, response: { user, role: activeRole?.roles?.level_id, user_token: token } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/verify-user-token', verifyUserToken, async (req, res) => {
    try {
        let user_id = req.headers['user_id'];
        console.log('user_id: ', user_id);
        const user = await Users.findOne({
            where: { id: user_id },
            include: [
                {
                    model: UserRoles,
                    as: 'user_roles',
                    include: [
                        {
                            model: Role,
                            as: "roles"
                        }
                    ]
                }, {
                    model: Staff,
                    as: "staff",
                    attributes: ['id', 'name', 'image', 'role']
                }, {
                    model: Student,
                    as: 'student',
                    include: [
                        {
                            model: AdmissionApplicant,
                            as: "applicant",
                            attributes: ['id', 'name', 'image']
                        }
                    ]
                }
            ]
        })
        const activeRole = user?.user_roles?.find(res => res?.is_active);
        selectionFormat({ data: user?.staff, format: [{ enum: "staff_profile_role", key: "role" }] })

        returnValue({ res, response: { user, role: activeRole?.roles?.level_id, user_token: req.headers['user-token'] } })
    } catch (error) {
        returnValue({ res, status: 500, error })
    }
})

module.exports = router;