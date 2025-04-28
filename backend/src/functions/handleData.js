const { ValidationError } = require("sequelize");
const { enum_values } = require("../utils/enum");
const { isArray, isEqual, isObject } = require('lodash');
const sequelize = require("../sequelize");


function returnValue({ res, status = 200, response, error }) {
    if (error instanceof ValidationError) {
        let validationErrors = error?.errors?.[0]?.message;
        error = validationErrors;
        status = 400
    } else if (error?.message) error = error?.message;
    if (error) error = String(error)?.replace('SequelizeValidationError: ', '')
    res?.status?.(status)?.json?.({ response, error })
};

function consoleJson(string, value) {
    console.log(string, JSON.stringify(value, null, 2))
}


function generateRandomText(length = 30) {
    let txt = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let arr = [];
    for (let x = 0; x < length; x++) {
        arr.push(txt[Math.ceil(Math.random() * txt?.length)])
    }
    return arr.join('')
}

function checkValuesAreExist(values) {
    try {
        return Object.entries(values)?.filter(([key, value]) => !value)?.map(([key]) => key)?.join(', ')
    } catch (error) {
        throw new Error(error)
    }
}

function applyPagination({ req }) {
    try {
        return {
            order: [['createdAt', 'DESC']],
            limit: req?.query?.['limit'],
            offset: req?.query?.['offset']
        }
    } catch (error) {
        throw new Error(error)
    }
}

function applyAttributes({ req }) {
    try {
        let attributes = req.query?.['attributes'];
        if (attributes) return { attributes: attributes?.split(',') }
        else return {}

    } catch (error) {
        throw new Error(error)
    }
}


function selectionFormat({ data, format = [] }) {
    try {
        if (!isArray(data)) format?.forEach(fr => {
            data[fr?.key] = enum_values?.[fr?.enum]?.find(en => data?.[fr?.key] == en?.id) || null
        })
        else data?.forEach((dt, index) => {
            format?.forEach(fr => {
                data[index][fr?.key] = enum_values?.[fr?.enum]?.find(en => dt?.[fr?.key] == en?.id) || null
            })
        })
    } catch (error) {
        console.log('error: ', error);
        return data;
    }
};

function applyAcademicYear({ req }) {
    try {
        let academic_year_id = req?.query?.['academic_year_id'];
        if (academic_year_id) return { academic_year_id };
    } catch (error) {
        throw new Error(error)
    }
}



function getObjectDifferences({ newVal, prevVal }) {
    try {
        if ([newVal, prevVal].every(isObject)) for (let x of [...Object.keys(newVal), ...Object.keys(prevVal)]) {
            if (isEqual(newVal?.[x], prevVal?.[x])) {
                delete newVal?.[x]
                delete prevVal?.[x]
            }
        }
        return { prevVal, newVal }
    } catch (error) {
        throw new Error(error);
    }
}


function getRelationFromModel(model) {
    try {
        const relations = {};
        for (const associationName in model.associations) {
            if (model.associations.hasOwnProperty(associationName)) {
                const association = model.associations[associationName];
                relations[association?.foreignKey] = {
                    relatedModel: association.target.name,
                    relatedTable: association.target.tableName
                }
            }
        }
        return relations;
    } catch (error) {
        throw new Error(error)
    }
};

async function getRelationFieldRecord({ relations, dataValues }) {
    try {
        let obj = {}
        for (let [key, relation] of Object.entries(relations)) {
            let field = dataValues?.[key];
            if (field) {
                let [record] = await sequelize.query(`SELECT name FROM  ${relation?.relatedTable} WHERE id = ${field} LIMIT 1`)
                if (record[0]?.name) obj[key] = record?.[0]?.name;
            }
        }
        return obj
    } catch (error) {
        throw new Error(error)
    }
}

async function sequenceRecord({ modal, value }) {
    const transaction = await sequelize.transaction();
    try {
        for (let [id, sequence] of Object.entries(value)) {
            await modal.update({ sequence: +sequence }, { where: { id: +id }, transaction });
        }
        await transaction.commit();
    } catch (error) {
        console.error(error);
        await transaction.rollback();

        throw new Error(error)
    }
};

function getDaysBetweenDates({ start_date, end_date }) {
    try {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        const differenceInMilliseconds = endDate - startDate;

        // Convert milliseconds to days
        const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

        return differenceInDays + 1
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    returnValue,
    consoleJson,
    generateRandomText,
    checkValuesAreExist,
    applyPagination,
    selectionFormat,
    applyAcademicYear,
    applyAttributes,
    getObjectDifferences,
    getRelationFromModel,
    getRelationFieldRecord,
    sequenceRecord,
    getDaysBetweenDates
} 