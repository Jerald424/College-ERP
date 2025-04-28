const { getObjectDifferences, getRelationFromModel, getRelationFieldRecord } = require("../../../functions/handleData");
const AuditLog = require("../model/auditLog");
const { isEmpty } = require('lodash');


async function create({ instance, model, options, operation }) {

    let { newVal, prevVal } = getObjectDifferences({ prevVal: isEmpty(instance?._previousDataValues) ? {} : { ...instance?._previousDataValues }, newVal: isEmpty(instance?.dataValues) ? {} : { ...instance?.dataValues } })
    let relations = getRelationFromModel(model);
    let newValues = await getRelationFieldRecord({ dataValues: newVal, relations })

    let prevValues = await getRelationFieldRecord({ dataValues: prevVal, relations });
    if (operation == 'delete') prevValues = instance?.['dataValues']

    try {
        await AuditLog.create({
            table_name: model?.getTableName(),
            record_id: options?.record_id ?? instance?.dataValues?.id,
            operation,
            old_values: { ...prevVal, ...prevValues },
            new_values: { ...newVal, ...newValues },
            applicant_id: options?.applicant_id ? +options?.applicant_id : null,
            user_id: options?.user_id ? +options?.user_id : null,
            timestamp: new Date()
        })
    } catch (error) {
        throw new Error(error)
    }
}

const createAudit = async ({ instance, options, operation, model, creationMode }) => {
    if (creationMode == 'bulkCreate') for (let ins of instance) {
        await create({ instance: ins, model, options, operation })
    }
    else await create({ instance, model, options, operation })
}

module.exports = { createAudit, }