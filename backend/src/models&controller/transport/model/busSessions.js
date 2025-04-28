const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const { Bus } = require("./bus");
const Users = require("../../base/user/model/user");

const BusSessions = sequelize.define(
  "transport_bus_session",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time_from: {
      type: DataTypes.TIME,
    },
    time_to:{
      type:DataTypes.TIME
    }
  },
  {
    tableName: "transport_bus_session",
  }
);

Bus.hasMany(BusSessions, {
  foreignKey: "bus_id",
  as: "sessions",
});
BusSessions.belongsTo(Bus, {
  foreignKey: "bus_id",
  as: "bus",
});

const BusSessionIncharge = sequelize.define(
  "transport_bus_session_incharge",
  {},
  { tableName: "transport_bus_session_incharge" }
);

BusSessions.belongsToMany(Users, {
  through: BusSessionIncharge,
  as: "incharges",
});
Users.belongsToMany(BusSessions, {
  through: BusSessionIncharge,
  as: "incharge_bus_sessions",
});

const BusSessionPassengers = sequelize.define(
  "transport_bus_session_passengers",
  {},
  { tableName: "transport_bus_session_passengers" }
);
BusSessions.belongsToMany(Users, {
  through: BusSessionPassengers,
  as: "passengers",
});
Users.belongsToMany(BusSessions, {
  through: BusSessionPassengers,
  as: "passenger_bus_sessions",
});

module.exports = { BusSessions, BusSessionIncharge, BusSessionPassengers };
