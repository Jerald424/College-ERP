const { Op } = require('sequelize');
const { returnValue, applyPagination } = require('../../../../functions/handleData');
const MailConfig = require('../model/mailConfig');

const router = require('express').Router();

router.post('/mail-config', async (req, res) => {
    try {
        const { mail_config } = req.body;
        let response = await MailConfig.create(mail_config, { returning: true, user_id: req.headers['user_id'] })
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put('/mail-config/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mail_config } = req.body;
        const [count, updated] = await MailConfig.update(mail_config, { where: { id }, returning: true, individualHooks: true });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/mail-config', async (req, res) => {
    try {
        const response = await MailConfig.findAndCountAll({
            ...applyPagination({ req })
        })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/mail-config/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await MailConfig.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/mail-config/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await MailConfig.findByPk(id);
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

module.exports = router;