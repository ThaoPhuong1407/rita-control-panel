/* eslint-disable camelcase */
/* eslint-disable no-var */
const fs = require('fs');
var RMQemitter = require('../rabbitMQ/processMessage.js').emit;

// var socket;
var allSESockets; // SE = State Estimation
var allSGSockets; // SG = Stacked Graphs
var allMapSockets; // Map = Map pages

const prediction_info = {
  predictionToString  : '',
  totalPredictionID   : [], // Total Predictions
  correctPredictionID : [], // Correct Predictions
  falsePredictionID   : [], // False Predictions
  unknownPredictionID : [], // Unknown Predictions
  accuracy            : 0,
  cognitiveLoad       : 0,
}

/*------------------------------------------*/
/*------ Establish SockIO connection -------*/
/*------------------------------------------*/
module.exports = function (io) {

  //--------  /state-estimation
  io.of('/state-estimation').on('connection', async (currentSocket) => {
    allSESockets = io.of('/state-estimation');

    // Reset states
    currentSocket.on('clearState', (data) => {
      RMQemitter.emit('clearState', data);
    });

    // Reset states
    currentSocket.on('clearState', (data) => {
      prediction_info.predictionToString = '';
      prediction_info.totalPredictionID = [];
      prediction_info.correctPredictionID = [];
      prediction_info.falsePredictionID = [];
      prediction_info.unknownPredictionID = [];
      prediction_info.accuracy = 0;
      prediction_info.cognitiveLoad = 0;
      RMQemitter.emit('clearState', data);
    });
  });

   //--------  /stacked-graphs
  io.of('/stacked-graphs').on('connection', async (currentSocket) => {
    allSGSockets = io.of('/stacked-graphs');

    // Reset states
    currentSocket.on('clearState', (data) => {
      prediction_info.predictionToString = '';
      prediction_info.totalPredictionID = [];
      prediction_info.correctPredictionID = [];
      prediction_info.falsePredictionID = [];
      prediction_info.unknownPredictionID = [];
      prediction_info.accuracy = 0;
      prediction_info.cognitiveLoad = 0;
      RMQemitter.emit('clearState', data);
    });
  });

  //--------  /map
  io.of('/map').on('connection', async (currentSocket) => {
    allMapSockets = io.of('/map');
    
    // Reset states
    currentSocket.on('clearState', (data) => {
      RMQemitter.emit('clearState', data);
    });
  });
};

/*-------------------------------------------*/
/*------ Send data based on Timestamp -------*/
/*-------------------------------------------*/
// Send timestamp, predictions' accuracy, cognitiveLoad to stackedGraphs
RMQemitter.on('timestampMin', (data) => {
  if (allSGSockets !== undefined) {
    setTimeout(() => {
      allSGSockets.emit('timestampMin', {
        timeInMin: data,
        accuracy: prediction_info.accuracy, // calculated and updated in this page, based on incoming new predictions
        cognitiveLoad: prediction_info.cognitiveLoad,
      });
    }, 500);
  }
});

/*------------------------------------------------*/
/*------ Send data based on New Prediction -------*/
/*------------------------------------------------*/
// Calculate the accuracy
// Send prediction string, uid, accuracy to the stateEstimation
RMQemitter.on('newPrediction', (data) => {
   // Add the data to predictionID arry to keep track of data
  if (!prediction_info.totalPredictionID.includes(data[0].uid)) {
    prediction_info.totalPredictionID.push(data[0].uid);
  } 

  if (data[0].state === true || data[0].state === "true") {
    // Add to Correct Prediction
    prediction_info.correctPredictionID.push(data[0].uid);
    // Remove from Unknown Prediction
    if (prediction_info.unknownPredictionID.indexOf(data[0].uid) !== -1) {
      prediction_info.unknownPredictionID.splice(prediction_info.unknownPredictionID.indexOf(data[0].uid), 1);
    }
    // Remove from Fail Prediction (caused by time lag problems)
    if (prediction_info.falsePredictionID.indexOf(data[0].uid) !== -1) {
      prediction_info.falsePredictionID.splice(prediction_info.falsePredictionID.indexOf(data[0].uid), 1);
    } 

  } else if (data[0].state === false || data[0].state === "false") {
    // Add to False Prediction
    prediction_info.falsePredictionID.push(data[0].uid);
    // Remove from Unknown Prediction
    if (prediction_info.unknownPredictionID.indexOf(data[0].uid) !== -1) {
      prediction_info.unknownPredictionID.splice(prediction_info.unknownPredictionID.indexOf(data[0].uid), 1);
    }
  } else {
    prediction_info.unknownPredictionID.push(data[0].uid);
  }
  
  console.log(`
      Failure: ${prediction_info.falsePredictionID.length}, 
      Correct: ${prediction_info.correctPredictionID.length}, 
      Unknown: ${prediction_info.unknownPredictionID.length}, 
      Total: ${prediction_info.totalPredictionID.length}, 
      Acc: ${prediction_info.accuracy}`);
  
  // Update accuracy
  prediction_info.accuracy = prediction_info.correctPredictionID.length / (prediction_info.totalPredictionID.length - prediction_info.unknownPredictionID.length );

  if (allSESockets !== undefined) {
    setTimeout(() => {
      prediction_info.predictionToString = `${data[0].subject} will ${data[0].action.replace('-', ' ')} ${data[0].object} with a probability of ${data[0]['agent-belief']}.`;

      allSESockets.emit('newPrediction', {
        prediction: prediction_info.predictionToString, // String
        uid: data[0].uid, // String
        state: data[0].state, // boolean
        accuracy: prediction_info.accuracy,
      });
    }, 500);
  }


});

/*----------------------------------------------------*/
/*------ Send data based on New Cognitive Load -------*/
/*----------------------------------------------------*/
// Send cognitive load to stateEstimation
RMQemitter.on('newCognitiveLoad', (data) => {
  prediction_info.cognitiveLoad = data['total-cognitive-load']; 
  
  if (allSESockets !== undefined) {
    setTimeout(() => {
      allSESockets.emit('newCognitiveLoad', {
        cognitiveLoad: data['total-cognitive-load'],
        roomsSkipped: data['rooms-skipped'],
        unUrgentPatients: data['untriaged-urgent-patients'],
        unGreenPatients: data['untriaged-green-victims'],
      });
    }, 500);
  }
});

/*----------------------------------------------*/
/*------ Send data (from Testbed) to Map -------*/
/*----------------------------------------------*/
// Trial
RMQemitter.on('trial_start', (data) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
        
      const map_name = `${data.experiment_mission} ${data.name}`;
      
      console.log(map_name);
      allMapSockets.emit('trial_start', {map_name, data});
    }, 500);
  }
});

RMQemitter.on('trial_stop', (data) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('trial_stop', data);
    }, 500);
  }
});

// Misison
RMQemitter.on('mission_start', (data) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('mission_start', data);
    }, 500);
  }
});

RMQemitter.on('mission_stop', (data) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('mission_stop', data);
    }, 500);
  }
});

RMQemitter.on('mission_timer', (data) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('mission_timer', data);
    }, 500);
  }
});

// Victim list (groundtruth)
RMQemitter.on('victim_list', (victim_list) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('victim_list', victim_list);
    }, 500);
  }
});

// Blockage list (groundtruth)
RMQemitter.on('blockage_list', (blockage_list) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('blockage_list', blockage_list);
    }, 500);
  }
});

// Freeze Block list (groundtruth)
RMQemitter.on('freezeBlock_list', (freezeBlock_list) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('freezeBlock_list', freezeBlock_list);
    }, 500);
  }
});

// Threat Sign list (groundtruth)
RMQemitter.on('threatsign_list', (threatsign_list) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('threatsign_list', threatsign_list);
    }, 500);
  }
});

// Victimes expired (groundtruth)
RMQemitter.on('victims_timeout', (message) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('victims_timeout', message);
    }, 500);
  }
});


// Rescued all victims (groundtruth)
RMQemitter.on('victims_rescued', (message) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('victims_rescued', message);
    }, 500);
  }
});

// Player changes role
RMQemitter.on('event_roleChange', (message) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('event_roleChange', message);
    }, 500);
  }
});

// Pause (event)
RMQemitter.on('pause', (status) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('pause', status.pause_status);
    }, 500);
  }
});


// Door (event)
RMQemitter.on('event_door', (state_and_coordinates) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('event_door', state_and_coordinates);
    }, 500);
  }
});

// Triage (event)
RMQemitter.on('event_triage', (state_and_coordinates) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('event_triage', state_and_coordinates);
    }, 500);
  }
});

// Placed victim (event)
RMQemitter.on('event_victimPlaced', (name_location) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('event_victimPlaced', name_location);
    }, 500);
  }
});

// Pickup victim (event)
RMQemitter.on('event_victimPickedUp', (name_location) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('event_victimPickedUp', name_location);
    }, 500);
  }
});

// Rubble destroyed (event)
RMQemitter.on('event_rubbleDestroyed', (name_location) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('event_rubbleDestroyed', name_location);
    }, 500);
  }
});

// Player Frozen (event)
RMQemitter.on('event_playerFrozen', (name_location) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('event_playerFrozen', name_location);
    }, 500);
  }
});

// Score update (event)
RMQemitter.on('score', (score) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('score', score);
    }, 500);
  }
});

// Robot Location (observation)
RMQemitter.on('robot_pos', (data) =>{ 
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('robot_pos', data);
    }, 500);
  }
});

// Player Location (observation)
RMQemitter.on('player1_position', (playerPosition) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('player1_position', playerPosition);
    }, 500);
  }
});

RMQemitter.on('player2_position', (playerPosition) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('player2_position', playerPosition);
    }, 500);
  }
});

RMQemitter.on('player3_position', (playerPosition) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('player3_position', playerPosition);
    }, 500);
  }
});


// Next room predictions
RMQemitter.on('next_room_predictions', (prediction) => {
  if (allMapSockets !== undefined) {
    setTimeout(() => {
      allMapSockets.emit('next_room_predictions', prediction);
    }, 500);
  }
});
