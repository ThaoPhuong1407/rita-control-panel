/* eslint-disable camelcase */
/* eslint-disable prefer-destructuring */
const Event = require('events');


// ---------------------
// GLOBAL VARIABLES
// ---------------------
const timeObject = {
  timestamp: null,
  processTimestamp: null,
  minTimestamp: Infinity,
  scaleTimestamp: 0,
  timeScaleSec: null,
  timeScaleMin: null,
  timeDurationTracker: 0, // Graph can't keep up
  previousTimestamp: 0, // Graph can't keep up
  mission_timer: '',
}

const player1 = {
  playername: null,
  callsign: null,
  participantid: null,
  uniqueid: null,
  pos_x: 0,
  pos_z: 0,
  pos_y: 0,
  positions: [],
}

const player2 = {
  playername: null,
  callsign: null,
  participantid: null,
  uniqueid: null,
  pos_x: 0,
  pos_z: 0,
  pos_y: 0,
  positions: [],
}

const player3 = {
  playername: null,
  callsign: null,
  participantid: null,
  uniqueid: null,
  pos_x: 0,
  pos_z: 0,
  pos_y: 0,
  positions: [],
}

let triaged_critical = 0;
let triaged_regular = 0;

// ---------------------
// CLEAR STATE FRONT-END
// ---------------------

const emit = new Event();
emit.on('clearState', () => {
  timeObject.minTimestamp = Infinity;
  timeObject.timeDurationTracker = 0;
  timeObject.previousTimestamp = 0;
  player1.playername = null;
  player1.callsign = null;
  player1.participantid = null;
  player1.uniqueid = null;
  player1.pos_x = 0;
  player1.pos_y = 0;
  player1.pos_z = 0;
  player1.positions = [];
  
  player2.playername = null;
  player2.callsign = null;
  player2.participantid = null;
  player2.uniqueid = null;
  player2.pos_x = 0;
  player2.pos_y = 0;
  player2.pos_z = 0;
  player2.positions = [];
  
  player3.playername = null;
  player3.callsign = null;
  player3.participantid = null;
  player3.uniqueid = null;
  player3.pos_x = 0;
  player3.pos_y = 0;
  player3.pos_z = 0;
  player3.positions = [];
  triaged_critical = 0;
  triaged_regular = 0;
});

// ---------------------
// SUPPORTING FUNCTION
// ---------------------
// handle trial message
const handleTrialMsg = (receivedMsg) => {
  const trial_name = receivedMsg['testbed-message'].data.name;
  const trial_number = receivedMsg['testbed-message'].data.trial_number;
  const trial_condition = receivedMsg['testbed-message'].data.condition;
  const trial_time = receivedMsg['testbed-message'].data.date;
  const subjects = receivedMsg['testbed-message'].data.subjects; // array of subjects
  const experiment_name = receivedMsg['testbed-message'].data.experiment_name;
  const experiment_mission = receivedMsg['testbed-message'].data.experiment_mission;
  const testbed_version = receivedMsg['testbed-message'].data.testbed_version;
  
  if (receivedMsg['testbed-message'].header.version * 1 === 0.6) {
    const client_info = receivedMsg['testbed-message'].data.client_info;
    player1.playername = client_info[0].playername;
    player1.callsign = client_info[0].callsign;
    player1.participantid = client_info[0].participantid;
    player1.uniqueid = client_info[0].uniqueid;
    player2.playername = client_info[1].playername;
    player2.callsign = client_info[1].callsign;
    player2.participantid = client_info[1].participantid;
    player2.uniqueid = client_info[1].uniqueid;
    player3.playername = client_info[2].playername;
    player3.callsign = client_info[2].callsign;
    player3.participantid = client_info[2].participantid;
    player3.uniqueid = client_info[2].uniqueid;
  }

  if (receivedMsg['testbed-message'].msg.sub_type === 'start') { 
    emit.emit('trial_start', {player1, player2: player2, player3: player3, trial_name, trial_number, trial_time, trial_condition, subjects, experiment_name, experiment_mission, testbed_version});  
  } else if (receivedMsg['testbed-message'].msg.sub_type === 'stop') {
    emit.emit('trial_stop', {trial_name, trial_number, trial_time, trial_condition, subjects, experiment_name, experiment_mission, testbed_version});  
  }  
}

// get coords of the correct player and store value
const handleMultiplePlayerMovement = (playerName, receivedMsg) => {
  if (player1.playername === playerName) {
    player1.pos_x = receivedMsg['testbed-message'].data.x; 
    player1.pos_z = receivedMsg['testbed-message'].data.z; 
    player1.pos_y = receivedMsg['testbed-message'].data.y; 
    player1.positions.push([player1.pos_x, player1.pos_z]);
  } else if (player2.playername === playerName) {
    player2.pos_x = receivedMsg['testbed-message'].data.x; 
    player2.pos_z = receivedMsg['testbed-message'].data.z; 
    player2.pos_y = receivedMsg['testbed-message'].data.y; 
    player2.positions.push([player2.pos_x, player2.pos_z]);
  } else {
    player3.pos_x = receivedMsg['testbed-message'].data.x; 
    player3.pos_z = receivedMsg['testbed-message'].data.z; 
    player3.pos_y = receivedMsg['testbed-message'].data.y; 
    player3.positions.push([player3.pos_x, player3.pos_z]);
  }
}

// handle players moving victims around
function moveVictim(data, emitType) {
  const victim_location = {'x': data.victim_x, 'z' : data.victim_z};
  const playername = data.playername;
  let victim_type;
  if (data.color) {
    victim_type = (data.color.toLowerCase() === 'green') ? 'regular' : 'critical';
  } else if (data.type) {
    if (data.type.toLowerCase() === 'victim_1' || data.type.toLowerCase() === 'regular') {
      victim_type = 'regular'; 
    } else {
      victim_type ='critical';
    } 
  } 
  emit.emit(emitType, {playername, victim_location, victim_type}); 
}

// ---------------------
// MAIN FUNCTION
// ---------------------
const processMsg = async (msg) => {
  const receivedMsg = await JSON.parse(msg.content.toString());

  if (receivedMsg['routing-key'] === "observations.ui") {
      const header = receivedMsg.header;
      const meta_msg = receivedMsg.msg;
      const data = receivedMsg.data;
      
      setTimeout(function () {
        if (header.message_type === 'observation' && meta_msg.sub_type === 'state') {
          emit.emit('robot_pos', {x: data.x, z: data.z, y: data.y}); // array, current_pos
        } else if (header.message_type === 'event') {
          if (meta_msg.sub_type === 'Event:startRender') { 
            const mapName = data.mission;
            emit.emit('trial_start', {name: mapName});
          }
        }
      }, 500);
  }

  /*------------------------------------------------------*/
  /*  Timestamp, 2D Map messages from Testbed AND RITA UI */
  /*------------------------------------------------------*/
  // console.log(receive dMsg);
  else if (receivedMsg['routing-key'] === "testbed-message") {
    if (receivedMsg['testbed-message']) {

      // All msg from the testbed have timestamp
      if (receivedMsg['testbed-message'].msg) {
        if (receivedMsg['testbed-message'].msg.timestamp) {
          timeObject.timestamp = receivedMsg['testbed-message'].msg.timestamp;
          setTimeout(function () {

            // Convert timestamp to minutes
            timeObject.processTimestamp = Date.parse(timeObject.timestamp);
            timeObject.minTimestamp = Math.min(timeObject.minTimestamp, timeObject.processTimestamp);
            timeObject.scaleTimestamp = timeObject.processTimestamp - timeObject.minTimestamp;
            timeObject.timeScaleSec = timeObject.scaleTimestamp * 0.001;
            timeObject.timeScaleMin = timeObject.timeScaleSec * 0.0166667;
  
            // Handle Trial Start/Stop 
            if (receivedMsg['testbed-message'].header.message_type === 'trial') {
              handleTrialMsg(receivedMsg);
            } 
 
            // Handle Groundtruth Data: list of victims, list of holes & additional blockages, victims expired
            else if (receivedMsg['testbed-message'].header.message_type === 'groundtruth') {
              // List of victims
              if (receivedMsg['testbed-message'].msg.sub_type === 'Mission:VictimList') { 
                emit.emit('victim_list', receivedMsg['testbed-message'].data.mission_victim_list);  
              // List of holes & any additional blockages     
              } else if (receivedMsg['testbed-message'].msg.sub_type === 'Mission:BlockageList') { 
                emit.emit('blockage_list', receivedMsg['testbed-message'].data.mission_blockage_list); 
              // List of FreezeBlockList     
              } else if (receivedMsg['testbed-message'].msg.sub_type === 'Mission:FreezeBlockList') {
                emit.emit('freezeBlock_list', receivedMsg['testbed-message'].data.mission_freezeblock_list); 
               // List of Threat Sign     
              } else if (receivedMsg['testbed-message'].msg.sub_type === 'Mission:ThreatSignList') {
                emit.emit('threatsign_list', receivedMsg['testbed-message'].data.mission_threatsign_list); 
                // Victimes expired
              } else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:VictimsExpired') { 
                emit.emit('victims_timeout', receivedMsg['testbed-message'].data.expired_message); 
              } else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:VictimsRescued') { 
                emit.emit('victims_rescued', receivedMsg['testbed-message'].data.rescued_message); 
              }
            }
            
            // Handle (1) mission state (start), (2) door events, (3) triage events, (4) pause event (5) Saturn format
            else if (receivedMsg['testbed-message'].header.message_type === 'event') {
              // Mission state: start, stop
              if (receivedMsg['testbed-message'].msg.sub_type === 'Event:MissionState') { 
                if (receivedMsg['testbed-message'].data.mission_state === 'Start') {
                  emit.emit('mission_start', {
                    'mission_timer': receivedMsg['testbed-message'].data.mission_timer,
                    'mission_state': receivedMsg['testbed-message'].data.mission_state
                  });   
                } else if (receivedMsg['testbed-message'].data.mission_state === 'Stop') {
                  emit.emit('mission_stop', {
                    'mission_timer': receivedMsg['testbed-message'].data.mission_timer,
                    'mission_state': receivedMsg['testbed-message'].data.mission_state
                  });   
                }
              }
              // Change roles event
              else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:RoleSelected') {
                const {playername} = receivedMsg['testbed-message'].data;
                const {new_role} = receivedMsg['testbed-message'].data;
                const {prev_role} = receivedMsg['testbed-message'].data;
                let playerNum;
                if (playername === player1.playername) playerNum = 'player1';
                else if (playername === player2.playername) playerNum = 'player2';
                else if (playername === player3.playername) playerNum = 'player3';
                emit.emit('event_roleChange', {playerNum, playername, new_role, prev_role});   
              } 
              // Pause event
              else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:Pause') { 
                emit.emit('pause', {'pause_status': receivedMsg['testbed-message'].data.paused}); 
              }
              // Door event
              else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:Door') { 
                const doorEventData = receivedMsg['testbed-message'].data;
                const coordinates = {'z': doorEventData.door_z, 'x': doorEventData.door_x}
                emit.emit('event_door', {state: doorEventData.open, coordinates: coordinates, playername: doorEventData.playername});   
              }

              // Triage event 
              // 3 state: UNSUCCESSFUL, SUCCESSFUL, IN_PROGRESS
              else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:Triage') { 
                const triage_event = receivedMsg['testbed-message'].data
                const state = triage_event.triage_state;
                const playername = triage_event.playername;
                const victim_location = {'x': triage_event.victim_x, 'z' : triage_event.victim_z};
                let victim_type;

                if (triage_event.color) {
                  if (triage_event.color.toLowerCase() === 'green') {
                    victim_type = 'regular';
                  } else {
                    victim_type = 'critical';
                  }
                }
                if (triage_event.type) {
                  if (triage_event.type.toLowerCase() === 'regular') {
                    victim_type = 'regular';
                  } else {
                    victim_type = 'critical';
                  }
                } 

                if (state === 'SUCCESSFUL') {
                  if (victim_type === 'regular') {
                    triaged_regular += 1;
                  } else {
                    triaged_critical += 1;
                  }
                } 
                emit.emit('event_triage', {state, victim_location, victim_type, triaged_critical, triaged_regular, playername});   
              } 
              
              // Placed victim event
              else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:VictimPlaced') {
                const data = receivedMsg['testbed-message'].data;
                moveVictim(data, 'event_victimPlaced');
              }

              // Picked up victim event
              else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:VictimPickedUp') {
                const data = receivedMsg['testbed-message'].data;
                moveVictim(data, 'event_victimPickedUp');
              }

              // Rubble destroyed 
              else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:RubbleDestroyed') {
                const data = receivedMsg['testbed-message'].data;
                const rubbleLocation = {'x': data.rubble_x, 'z' : data.rubble_z, 'y' : data.rubble_y};
                const playername = data.playername;
                emit.emit('event_rubbleDestroyed', { playername, rubbleLocation }); 
              }
              
              // Player Frozen
              else if (receivedMsg['testbed-message'].msg.sub_type === 'Event:PlayerFrozenStateChange') {
                const data = receivedMsg['testbed-message'].data;
                const frozen = (data.state_changed_to === "FROZEN"); // true or false
                const location = {'x': data.player_x, 'z' : data.player_z};
                const playername = data.playername;
                const medic_playername = (!frozen) ? data.medic_playername : 'NA';
                emit.emit('event_playerFrozen', {playername, medic_playername, frozen, location}); 
                
              }

              // Send score
              // else if(receivedMsg['testbed-message'].msg.sub_type === 'Event:Scoreboard') {   
              //   emit.emit('score', Object.values(receivedMsg['testbed-message'].data.scoreboard));   
              // }    
            }

            // Handle observation state (player's movements) and Mission state: stop 
            // ASU_MC = not the player... 
            else if (receivedMsg['testbed-message'].header.message_type === 'observation') {
              // 🔥 This version has single player, name attribute, no players' color
              const observationState_version = receivedMsg['testbed-message'].header.version * 1;              
              if (observationState_version === 1.0) {
                if (receivedMsg['testbed-message'].msg.sub_type === 'state' && receivedMsg['testbed-message'].data.name !== 'ASU_MC'){
                  timeObject.mission_timer = receivedMsg['testbed-message'].data.mission_timer;
                  player1.pos_x = receivedMsg['testbed-message'].data.x; 
                  player1.pos_z = receivedMsg['testbed-message'].data.z; 
                  player1.pos_y = receivedMsg['testbed-message'].data.y; 
                  player1.positions.push([player1.pos_x, player1.pos_z]);
                }
              // 🔥 This version has multiplayer, playername attribute, no players' color
              } else if (observationState_version === 1.1) {
                const playerName = receivedMsg['testbed-message'].data.playername;     
                if (receivedMsg['testbed-message'].msg.sub_type === 'state' && receivedMsg['testbed-message'].data.playername !== 'ASU_MC') {
                  timeObject.mission_timer = receivedMsg['testbed-message'].data.mission_timer;
                  // Find 3 player names
                  if (player1.playername == null) {
                    player1.playername = playerName;
                  } else if (player2.playername  == null 
                    && playerName !== player1.playername ) {
                    player2.playername = playerName;
                  } else if (player3.playername  == null 
                    && playerName !== player1.playername  
                    && playerName !== player2.playername) {
                    player3.playername = playerName;
                  }
                  handleMultiplePlayerMovement(playerName, receivedMsg);
                } 
               // 🔥 This version has multiplayer, playername attribute, has players' colors, and playername in trial msg
              } else if (observationState_version === 0.6) {
                if (receivedMsg['testbed-message'].msg.sub_type === 'state' && receivedMsg['testbed-message'].data.playername !== 'ASU_MC') {
                  timeObject.mission_timer = receivedMsg['testbed-message'].data.mission_timer;
                  const playerName = receivedMsg['testbed-message'].data.playername;     
                  handleMultiplePlayerMovement(playerName, receivedMsg);
                }
              } 
            }        

            // 1 duration = 1 section, so update the graph every 3 second
            if (timeObject.timeDurationTracker >= 0.5) {
              emit.emit('timestampMin', timeObject.timeScaleMin);
              
              if (timeObject.mission_timer !== 'Mission Timer not initialized.') {
                emit.emit('mission_timer', timeObject.mission_timer);
                console.log(timeObject.mission_timer);
              }

              // Only send observation during the mission duration 
              if ((timeObject.mission_timer !== '0 : 0') && (timeObject.mission_timer !== 'Mission Timer not initialized.')) {
                // emit.emit('mission_timer', timeObject.mission_timer);
                emit.emit('player1_position', {player_pos: player1.positions, playerData: player1}); // array, current_pos
                emit.emit('player2_position', {player_pos: player2.positions, playerData: player2}); // array, current_pos
                emit.emit('player3_position', {player_pos: player3.positions, playerData: player3}); // array, current_pos
                player1.positions = []; 
                player2.positions = []; 
                player3.positions = []; 
              }
              timeObject.previousTimestamp = timeObject.timeScaleSec;
              timeObject.timeDurationTracker = 0;
            }
            timeObject.timeDurationTracker = timeObject.timeScaleSec - timeObject.previousTimestamp;

          }, 500);
        }
      }
    }
  }

  /*-------------------------------------------------------------------*/
  /* Predictions messages from State Estimation, Prediction Generation, 2D Map */
  /*-------------------------------------------------------------------*/
  else if (receivedMsg['testbed-message'] === "predictions") {
    if (receivedMsg.predictions) {
      if (
        // Receiving predictions from state estimation (all states)
        receivedMsg['app-id'] === 'StateEstimation' ||
        // Receiving predictions from mission tracker (all states)
        receivedMsg['app-id'] === 'MissionTracker' ||
        // Receiving predictions from mission tracker (all states)
        receivedMsg['app-id'] === 'InversePlanning' ||
        // Receiving predictions from prediction generator (false)
        (receivedMsg['app-id'] === 'PredictionGenerator' && !receivedMsg.predictions.state)
      ) {
        // Only accept hypothesis with rank 0 (meaning the most favored prediction)
        if (receivedMsg.predictions['hypothesis-rank'] === 0) {
          setTimeout(function () {
            emit.emit('newPrediction', [receivedMsg.predictions, timeObject.timeScaleMin]);
          }, 500);
  
          if (receivedMsg.predictions.action === 'enter-room') {
            setTimeout(function () {
              emit.emit('next_room_predictions', [receivedMsg.predictions, timeObject.timeScaleMin]);
            }, 50
            )};
        }
      }
    }
  }
  
  
  /*-------------------------------------------------*/
  /*  Cognitive Load messages from State Estimation  */
  /*-------------------------------------------------*/
  else if(receivedMsg['testbed-message'] === "belief-state-changes") {
    if (receivedMsg['belief-state-changes']) {
      if (receivedMsg['belief-state-changes'].changed === 'cognitive-load') {
        setTimeout(function () {
          emit.emit('newCognitiveLoad', receivedMsg['belief-state-changes'].values);
        }, 500);
      }
    }
  }
};

module.exports.emit = emit;
module.exports.processMsg = processMsg;