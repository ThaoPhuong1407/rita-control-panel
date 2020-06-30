/* eslint-disable no-var */
var RMQ = require('../rabbitMQ/rabbitMQ-receive');

// var socket;
var allSocket;
module.exports = function (io) {
  io.of('/state-estimation').on('connection', async () => {
    // socket = s;
    allSocket = io.of('/state-estimation');
  });
};

// Sending predictions to the front-end whenever we get info from RMQ
let resultData = '';
RMQ.emit.on('newPrediction', (data) => {
  if (allSocket !== undefined) {
    setTimeout(() => {
      // Handle predictions
      resultData = `The player will ${data.predictions.action.replace('-', ' ')} ${data.predictions.object}`;

      allSocket.emit('newPrediction', {
        prediction: resultData, // String
        uid: data.predictions.uid, // String
        state: data.predictions.state, // boolean
      });
    }, 500);
  }
});

// Sending cognitive load to the front-end whenever we get info from RMQ
RMQ.emit.on('newCognitiveLoad', (data) => {
  if (allSocket !== undefined) {
    setTimeout(() => {
      // console.log(data['belief-state-changes'].values);
      allSocket.emit('newCognitiveLoad', {
        cognitiveLoad: data['belief-state-changes'].values['total-cognitive-load'],
        roomsSkipped: data['belief-state-changes'].values['rooms-skipped'],
        unUrgentPatients: data['belief-state-changes'].values['untriaged-urgent-patients'],
        unGreenPatients: data['belief-state-changes'].values['untriaged-green-victims'],
      });
    }, 500);
  }
});

// Sending fNIRS to the front-end whenever we get info from RMQ
let timeMili;
let timeScaleMili;
let timeScaleSec;
let timeScaleMin;

let timeDurationTracker = 0; // Graph can't keep up
let previousTimestamp = 0; // Graph can't keep up
const timeArray = [];
const cardiacSignalArray = [];
let stressLevel = 0;

const scaleEl = Date.parse('2020-06-12T18:49:23.100000Z'); // Hard Coded

RMQ.emit.on('newFNIRS', (data) => {
  if (allSocket !== undefined) {
    setTimeout(() => {
      timeMili = Date.parse(data.timestamp);
      timeScaleMili = timeMili - scaleEl;
      timeScaleSec = timeScaleMili * 0.001;
      timeScaleMin = timeScaleSec * 0.0166667;
      timeArray.push(timeScaleMin);
      cardiacSignalArray.push(data.ppg_cardiacrms);

      if (data.ppg_cardiacrms < 0.1) {
        stressLevel = 1;
      } else if (data.ppg_cardiacrms >= 0.1 && data.ppg_cardiacrms <= 1) {
        stressLevel = 2;
      } else {
        stressLevel = 3;
      }

      // Duration = 1 second (based on timestampe)
      if (timeDurationTracker > 1) {
        allSocket.emit('newFNIRS', {
          timeInMin: timeArray,
          cardiacSignal: cardiacSignalArray,
          stressLevel: stressLevel,
        });

        previousTimestamp = timeScaleSec;
        timeDurationTracker = 0;
      }
      timeDurationTracker = timeScaleSec - previousTimestamp;
    }, 500);
  }
});

// Reading a file and parse CSV -> JSON
// const papa = require('papaparse');
// const fs = require('fs');
// const readCSV = async (filePath) => {
//   const csvFile = fs.readFileSync(filePath);
//   const csvData = csvFile.toString();
//   return new Promise((resolve) => {
//     papa.parse(csvData, {
//       header: true,
//       complete: (results) => {
//         resolve(results.data);
//       },
//     });
//   });
// };
