const { DataTypes } = require("sequelize");
const sequelize = require("../../../../sequelize");
const Term = require("./term");
const { enum_values } = require("../../../../utils/enum");


const Hours = sequelize.define('hours', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    time_from: DataTypes.TIME,
    time_to: DataTypes.TIME,
    type: {
        type: DataTypes.ENUM(...enum_values.hour_type?.map(res => res.id))
    },
    sequence: {
        type: DataTypes.INTEGER,
    },
    session: {
        type: DataTypes.ENUM(...enum_values?.staff_leave_session?.map(res => res?.id)),
        allowNull: false,
        defaultValue: "forenoon"
    }

}, {
    tableName: "hours"
});

Term.hasMany(Hours, {
    foreignKey: "term_id",
    as: "hour"
});
Hours.belongsTo(Term, {
    foreignKey: "term_id",
    as: "term"
})

Hours.beforeCreate('sequence', async (instance) => {
    try {
        instance['dataValues']['sequence'] = await Hours.count({ where: { term_id: instance?.dataValues?.term_id } }) + 1
    } catch (error) {
        throw new Error(Error)
    }
})


module.exports = Hours;