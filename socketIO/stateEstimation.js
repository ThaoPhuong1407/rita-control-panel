/* eslint-disable no-var */
var RMQ = require('../rabbitMQ/rabbitMQ-receive');
var socket;
var allSocket;

module.exports = function (io) {
  io.of('/state-estimation').on('connection', (s) => {
    socket = s;
    allSocket = io.of('/state-estimation');
  });
};

// Updating the front-end whenever we get info from RMQ
let resultData = '';

RMQ.emit.on('newData', (data) => {
  setTimeout(() => {
    if (data.predictions.action === 'enter-room' || data.predictions.action === 'exit-room') {
      resultData = `The player will ${data.predictions.action.replace('-', ' ')} ${data.predictions.object}`;
    } else {
      resultData = `The player will ${data.predictions.action.replace('-', ' ')}`;
    }

    allSocket.emit('newPrediction', {
      prediction: resultData, // String
      uid: data.predictions.uid, // String
      state: data.predictions.state, // boolean
    });
  }, 500);
});
