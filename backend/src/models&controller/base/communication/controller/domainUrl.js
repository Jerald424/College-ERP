const { Op } = require('sequelize');
const { returnValue, applyPagination, selectionFormat } = require('../../../../functions/handleData');
const { DomainUrl } = require('../model/domainUrl');
const { enum_values } = require('../../../../utils/enum');

const router = require('express').Router();

router.post('/domain-url', async (req, res) => {
    try {
        const { domain_url } = req.body;
        let response = await DomainUrl.create(domain_url, { returning: true, user_id: req.headers['user_id'] })
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.put('/domain-url/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { domain_url } = req.body;
        const [count, updated] = await DomainUrl.update(domain_url, { where: { id }, returning: true, individualHooks: true });
        returnValue({ res, response: updated?.[0] })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.get('/domain-url', async (req, res) => {
    try {
        const response = await DomainUrl.findAndCountAll({
            ...applyPagination({ req })
        })
        selectionFormat({ data: response?.rows, format: [{ enum: "domain_source", key: "source" }] })
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
});

router.delete('/domain-url/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',')?.map(Number);
        let response = await DomainUrl.destroy({
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

router.get('/domain-url/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await DomainUrl.findByPk(id);
        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.get('/domain-create-support-data', async (req, res) => {
    try {
        const response = {
            source: enum_values?.domain_source
        };

        returnValue({ res, response })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;