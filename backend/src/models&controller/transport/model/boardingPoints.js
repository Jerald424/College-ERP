const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { Bus } = require("./bus");


const BoardingPoints = sequelize.define(
  "transport_boarding_points",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sequence: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "transport_boarding_points",
  }
);

BoardingPoints.beforeCreate('update_sequence', async (instance) => {
  try {
    if (instance?.dataValues?.bus_id) {
      instance.dataValues['sequence'] = await BoardingPoints.count({
        where: {
          bus_id: instance?.dataValues?.bus_id
        }
      }) + 1
    }
  } catch (error) {
    throw new Error(error)
  }
})

Bus.hasMany(BoardingPoints, {
  foreignKey: "bus_id",
  as: "boarding_points",
  onDelete: "CASCADE"
});
BoardingPoints.belongsTo(Bus, {
  foreignKey: "bus_id",
  as: "bus",
  onDelete: "CASCADE"

});

module.exports = { BoardingPoints };
