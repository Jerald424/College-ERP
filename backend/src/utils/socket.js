const communicationSocket = require('../models&controller/communication/socket');

module.exports = (io) => {
  communicationSocket(io)
};
