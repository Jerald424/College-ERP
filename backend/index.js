const express = require('express');
const cors = require('cors');
const sequelize = require('./src/sequelize');
const app = express();
const controller = require('./src/controller');
require('dotenv').config();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./src/utils/socket');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});



app.use(express.static('./dist'));
app.use(express.json({ limit: '50mb' })) //to access req.body;
app.use(cors()) // return value to client
const PORT = process.env.PORT || 5000;

async function databaseConnection() {
    await sequelize.authenticate().then(_ => {
        console.log('DATABASE CONNECT SUCCESSFULLY')

    }).catch(err => {
        console.log('error: ', err)
    });

    sequelize.sync({ alter: true })
    app.use(controller);
}

databaseConnection();

app.locals.io = io;
socketHandler(io)


app.get('/vite', (req, res) => {
    res.sendFile(path.resolve(__dirname, './dist', 'index.html'));
});


server.listen(PORT, () => {
    console.log("SERVER STARTED PORT 5000")
})


