const nodemailer = require('nodemailer');
const MailConfig = require('../models&controller/base/communication/model/mailConfig');
const { ValidationError } = require('sequelize');


const transporterInstance = async () => {
    try {
        const mail = await MailConfig.findOne({ where: { is_active: true } });
        if (!mail) throw new ValidationError("No active mail config found");
        const trans = nodemailer.createTransport({
            port: 465,
            host: 'smtp.gmail.com',
            auth: {
                user: mail?.email,
                pass: mail?.password
            },
            secure: true
        });
        return trans;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = transporterInstance