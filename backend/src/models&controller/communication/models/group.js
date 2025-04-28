const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const User = require('../../base/user/model/user')

const ComGroup = sequelize.define('com_group', {
    name: DataTypes.STRING,
    image: DataTypes.TEXT,
    description: DataTypes.TEXT
}, {
    tableName: 'com_group'
});

User.hasMany(ComGroup, {
    foreignKey: "created_by_id",
    as: "groups_created"
});
ComGroup.belongsTo(User, {
    foreignKey: "created_by_id",
    as: "created_by"
});

const ComGroupAdmin = sequelize.define('com_group_admin', {}, { tableName: "com_group_admin" });
const ComGroupMembers = sequelize.define('com_group_members', {}, { tableName: "com_group_members" });

ComGroup.belongsToMany(User, {
    through: ComGroupAdmin,
    as: 'admins'
});
User.belongsToMany(ComGroup, {
    through: ComGroupAdmin,
    as: "groups_in_admin"
});

ComGroup.belongsToMany(User, {
    through: ComGroupMembers,
    as: "members_in_groups"
});
User.belongsToMany(ComGroup, {
    through: ComGroupMembers,
    as: "members"
});

module.exports = { ComGroup, ComGroupAdmin, ComGroupMembers };