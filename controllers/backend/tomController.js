// Can be deleted later
/* ------- IMPORT -------- */
// Custom
const catchAsync = require('../../utils/catchAsync'); // handles try/catch block separately
const RMQ = require('../../rabbitMQ/rabbitMQ-receive.js'); // get access to the array of json data

/* ------- FUNCTIONS for each route -------- */
// 1. Getting all messages from RMQ and displaying them in JSON format || Route: /tom/
exports.getAllTom = catchAsync(async (req, res, next) => {
  const data = await RMQ.dataArray;

  const tom = [];

  data.forEach((eachData) => {
    if (eachData['belief-state-changes']) {
      tom.unshift(eachData);
    }
  });

  // Send back the response
  res.status(200).json({
    status: 'success',
    allData: tom,
    data: {
      missionID: tom[0]['mission-id'],
      timestamp: tom[0].timestamp,
      routingKey: tom[0]['routing-key'],
      appID: tom[0]['app-id'],
      state: tom[0]['belief-state-changes'],
      participant: tom[0]['belief-state-changes'].participant,
    },
  });
});

// await RMQ.myEmitter.on('newMessage', (msg) => {
// });
