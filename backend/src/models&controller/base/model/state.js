const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const State = sequelize.define('state', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "state"
});

module.exports = State;