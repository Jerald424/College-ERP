const { Sequelize } = require("sequelize");
require("dotenv").config();
const pg = require("pg");

//'postgres://default:3BQJF6uEemCV@ep-empty-recipe-a4vg5jum.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
// const sequelize = new Sequelize("postgres://default:3BQJF6uEemCV@ep-empty-recipe-a4vg5jum.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require", {
//     dialect: 'postgres',
//     protocol: 'postgres',
//     dialectModule: pg,
//     // host: "localhost",
//     username: "postgres",
//     password: "9965452128@J2cutz",
//     port: 5432,
//     logging: false,
//     // database: "college_may_250"
//     // dialectOptions: {
//     //     ssl: {
//     //         require: true,
//     //         rejectUnauthorized: false // You may need to adjust this for your SSL setup
//     //     }
//     // }
// })

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  username: "postgres",
  password: "admin",
  port: 5432,
  logging: false,
  database: "college_may_250",
});

module.exports = sequelize;
