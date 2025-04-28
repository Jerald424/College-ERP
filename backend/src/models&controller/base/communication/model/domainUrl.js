const { DataTypes } = require("sequelize");
const sequelize = require("../../../../sequelize");
const { enum_values } = require("../../../../utils/enum");

const DomainUrl = sequelize.define('domain_url', {
    source: {
        type: DataTypes.ENUM(...enum_values?.domain_source.map(res => res?.id))
    },
    url: DataTypes.STRING,
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "domain_url"
});

const changeActive = async (instance) => {
    try {
        if (instance?.is_active) {
            await DomainUrl.update({ is_active: false }, {
                where: {
                    source: instance?.source,
                    is_active: true
                }
            })
        }
    } catch (error) {
        throw new Error(error)
    }
}

DomainUrl.beforeCreate('create_active', changeActive);
DomainUrl.beforeUpdate('update_active', changeActive);

module.exports = { DomainUrl }