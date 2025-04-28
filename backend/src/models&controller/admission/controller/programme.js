const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat, applyAttributes } = require('../../../functions/handleData');
const { REQUIRED_FIELDS_ARE_MISSING } = require('../../../functions/variables');
const { Programme } = require('../model/programme');
const { enum_values } = require('../../../utils/enum');
const { verifyUserToken } = require('../../base/user/middleware/verifyUserToken');

const router = require('express').Router();

router.get('/programme-support-data', async (req, res) => {
    try {

        const response = {
            level: enum_values?.programme_level
        };
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

router.get('/programme/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Programme.findOne({
            where: { id },
        })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


router.post('/create-programme', async (req, res) => {
    try {
        const { programme } = req.body;
        if ([programme?.name, programme?.programme_programme_level].some(res => !res)) return returnValue({ res, error: REQUIRED_FIELDS_ARE_MISSING, status: 400 });
        let created = await Programme.create(programme, { returning: true });
        returnValue({ res, response: created })
    } catch (error) {
        returnValue({ error, res, status: 500 })

    }
});

router.get('/get-programme', async (req, res) => {
    try {

        let programme = await Programme.findAndCountAll({
            ...applyAttributes({ req }),
            ...applyPagination({ req })
        });
        selectionFormat({ data: programme?.rows, format: [{ key: "programme_programme_level", enum: "programme_level" }] });
        returnValue({ res, response: programme })

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});


router.put('/edit-programme/:id', verifyUserToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { programme } = req.body;
        const [_, updated] = await Programme.update(programme, { where: { id }, returning: true, individualHooks: true, user_id: req?.['headers']?.user_id })
        returnValue({ res, response: updated?.[0] })

    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});




router.delete('/programme/:ids', verifyUserToken, async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await Programme.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});





module.exports = router;

