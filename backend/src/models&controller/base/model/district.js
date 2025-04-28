const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const State = require("./state");

const District = sequelize.define('district', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state_id: {
        type: DataTypes.INTEGER,
        references: {
            key: "id",
            model: State
        }
    }
}, {
    tableName: "district"
});


State.hasMany(District, {
    foreignKey: "state_id",
    as: "district"
})

District.belongsTo(State, {
    foreignKey: "state_id",
    as: 'state'
})
module.exports = District;