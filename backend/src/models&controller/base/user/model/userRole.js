const { DataTypes } = require("sequelize");
const sequelize = require("../../../../sequelize");
const Role = require("./role");
const Users = require("./user");


const updateActive = async (userRole) => {
    try {
        if (userRole?.dataValues?.is_active) UserRoles.update({ is_active: false }, { where: { user_id: userRole?.dataValues?.user_id } })
    } catch (error) {
        throw new Error(error);
    }
}

const UserRoles = sequelize.define('user_role', {
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "user_role",
    indexes: [
        {
            unique: true,
            fields: ['role_id', 'user_id'],
        }
    ],
    hooks: {
        beforeBulkCreate: async (userRoles) => {
            await updateActive(userRoles)
        },
        beforeBulkUpdate: async (userRoles) => {
            await updateActive(userRoles)
        }
    }
});

Role.hasMany(UserRoles, {
    foreignKey: "role_id",
    as: "user_roles",
    onDelete: "CASCADE"
})

UserRoles.belongsTo(Role, {
    foreignKey: "role_id",
    as: "roles",
    onDelete: "CASCADE"

})

Users.hasMany(UserRoles, {
    foreignKey: "user_id",
    as: "user_roles"
});

UserRoles.belongsTo(Users, {
    foreignKey: "user_id",
    as: "users"
})

module.exports = UserRoles;