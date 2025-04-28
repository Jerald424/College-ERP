const { DataTypes } = require("sequelize");
const sequelize = require("../../../../sequelize");
const Users = require("./user");

const UserToken = sequelize.define('user_token', {
    token: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "user_token"
});

Users.hasMany(UserToken, {
    foreignKey: "user_id",
    as: "user_token"
});

UserToken.belongsTo(Users, {
    foreignKey: "user_id",
    as: 'user'
})

module.exports = UserToken;