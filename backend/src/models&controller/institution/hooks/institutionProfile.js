const InstitutionProfile = require("../model/institution");

const changeActive = async (instance) => {
    try {
        if (instance?.dataValues?.is_active) InstitutionProfile.update({ is_active: false }, { where: { is_active: true } });
    } catch (error) {
        throw new Error(error)
    }
};

InstitutionProfile.beforeCreate('checkActive', changeActive)
InstitutionProfile.beforeUpdate('checkActive', changeActive)
