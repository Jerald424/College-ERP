const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const Bus = sequelize.define(
  "transport_bus",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "transport_bus",
  }
);

module.exports = { Bus };
