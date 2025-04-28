const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const Users = require("../../base/user/model/user");

const ComUserBlock = sequelize.define("com_blocked_user", {
    is_block: DataTypes.BOOLEAN
}, { tableName: "com_blocked_user" });

Users.hasMany(ComUserBlock, {
    foreignKey: "user_id",
    as: "my_blocked_users"
});
ComUserBlock.belongsTo(Users, {
    foreignKey: "user_id",
    as: "users"
});

Users.hasMany(ComUserBlock, {
    foreignKey: "blocked_user_id",
    as: "blocked_users"
});
ComUserBlock.belongsTo(Users, {
    foreignKey: "blocked_user_id",
    as: "blocked_user"
})

module.exports = { ComUserBlock }