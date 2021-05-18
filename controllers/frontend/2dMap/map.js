/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
const Phaser = require('phaser');
const Game = require('./scenes/Game.js'); 
const Preloader = require('./scenes/Preload.js'); 
const socketFrontEnd = io.connect('http://localhost:3000/map');

/*----------------------------------*/
/*----- Socket Keys Mapping --------*/
/*----------------------------------*/
const socket_key = { // key = map_id, value = socket_id
    'trial_start'                       :   'trial_start', 
    'trial_stop'                        :   'trial_stop', 
    'mission_start'                     :   'mission_start',
    'mission_stop'                      :   'mission_stop', 
    'groundtruth_victim_list'           :   'victim_list', 
    'groundtruth_blockage_list'         :   'blockage_list',
    'groundtruth_freezeBlock_list'      :   'freezeBlock_list',
    'groundtruth_threatsign_list'       :   'threatsign_list',
    'groundtruth_victims_expired'       :   'victims_timeout',
    'groundtruth_all_victims_rescued'   :   'victims_rescued',
    'event_door'                        :   'event_door',
    'event_triage'                      :   'event_triage',
    'event_pause'                       :   'pause',
    'event_score'                       :   'score',
    'observation_player1'                :  'player1_position',
    'observation_player2'                :  'player2_position',
    'observation_player3'                :  'player3_position',
    'mission_timer'                     :   'mission_timer', 
    'next_room'                         :   'next_room_predictions',
    'victimPlaced'                :   'event_victimPlaced',
    'victimPickedUp'              :   'event_victimPickedUp',
    'rubbleDestroyed'             : 'event_rubbleDestroyed',
    'frozen'                        : 'event_playerFrozen',
    'robot_pos'                     : 'robot_pos',
    'event_roleChange'              : 'event_roleChange',
    
}

/*---------------------------------------------------*/
/*----- 2D MAP INFORMATION for PHASER CANVAS ------*/
/*---------------------------------------------------*/
// 1. Create and export Phaser Canvas with config info
const config = {
	type: Phaser.AUTO,
    width: 1000,
    height: 1000,
    parent: 'map',
    backgroundColor: '#ffffff',
    pixelArt: true,
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
		}
	},
    // resolution: window.devicePixelRatio,
	scene: [Preloader, Game],
	scale: { 
        zoom: 0.7,
        mode: Phaser.Scale.NONE,
	},
};
const newPhaserWindow = new Phaser.Game(config);
exports.newPhaserWindow = newPhaserWindow;

// 2. Manually added coordinates for Minecraft maps 
// a) MAP Boundary coordinates
    // get info from Map-processedData.json file: 
    // minXFloor (x_left), maxXFloor (x-right), minZFloor (z-top), maxZFloor (z-bottom)
exports.map_coordinates = {
    'Falcon': {x_left: -2112, x_right: -2020, z_top: 143, z_bottom: 207}, 
    'Sparky': {x_left: -2176, x_right: -2108, z_top: 144, z_bottom: 199},
    'Saturn': {x_left: -2225, x_right: -2087, z_top: -11, z_bottom: 128},
    'Saturn1': {x_left: -2225, x_right: -2087, z_top: -11, z_bottom: 128},
};

//  b) ROOM Boundary coordinates
exports.room_coordinates = { //(x, z)
    'FalconLobby':      {'l': -2095, 'r': -2089, 't': 144, 'b': 150},
    'FalconSO':         {'l': -2088, 'r': -2085, 't': 144, 'b': 151},
    'FalconBreakR':     {'l': -2084, 'r': -2076, 't': 144, 'b': 151},
    'FalconExecS1':     {'l': -2075, 'r': -2059, 't': 144, 'b': 151},
    'FalconExecS2':     {'l': -2058, 'r': -2044, 't': 144, 'b': 151},
    'FalconKO':         {'x': -2043, 'x1': -2028, 'y': 144,  'x2': -2028, 'x3': -2036, 'y2': 159, 'x4': -2036, 'x5': -2043, 'y3': 151},
    'FalconKT':         {'l': -2027, 'r': -2020, 't': 144, 'b': 159},
    'FalconMCR':        {'l': -2050, 'r': -2042, 't': 157, 'b': 178},
    'FalconSCR1':       {'l': -2064, 'r': -2056, 't': 157, 'b': 167},
    'FalconSCR2':       {'l': -2064, 'r': -2056, 't': 168, 'b': 178},
    'FalconWomRR':      {'l': -2072, 'r': -2066, 't': 170, 'b': 178},
    'FalconMenRR':      {'l': -2072, 'r': -2066, 't': 161, 'b': 169},
    'FalconRoomJ':      {'l': -2072, 'r': -2066, 't': 157, 'b': 160},
    'FalconCFarm':      {'l': -2095, 'r': -2078, 't': 157, 'b': 178},
    'FalconR101':       {'l': -2036, 'r': -2028, 't': 161, 'b': 169},
    'FalconR102':       {'l': -2036, 'r': -2028, 't': 170, 'b': 178},
    'FalconR103':       {'l': -2036, 'r': -2028, 't': 184, 'b': 192},
    'FalconR104':       {'l': -2045, 'r': -2037, 't': 184, 'b': 192},
    'FalconR105':       {'l': -2054, 'r': -2046, 't': 184, 'b': 192},
    'FalconR106':       {'l': -2063, 'r': -2055, 't': 184, 'b': 192},
    'FalconR107':       {'l': -2072, 'r': -2064, 't': 184, 'b': 192},
    'FalconR108':       {'l': -2081, 'r': -2073, 't': 184, 'b': 192},
    'FalconR109':       {'l': -2090, 'r': -2082, 't': 184, 'b': 192},
    'FalconR110':       {'l': -2099, 'r': -2091, 't': 184, 'b': 192},
    'FalconR111':       {'l': -2108, 'r': -2100, 't': 184, 'b': 192},
};
// c) Mapping rooms 'name (SE component to RITA UI component)
exports.mappingName_SE_UI = {
    'Lobby': 'FalconLobby', 
    'CloakR': 'FalconSO',
    'BreakR': 'FalconBreakR',
    'ExecS1': 'FalconExecS1',
    'ExecS2': 'FalconExecS2',
    'CSNorth': 'FalconKO',
    'CSEast': 'FalconKO',
    'Terrance': 'FalconKT',
    'MCR': 'FalconMCR',
    'SCR1': 'FalconSCR1',
    'SCR2': 'FalconSCR2',
    'WomRR': 'FalconWomRR',
    'MenRR': 'FalconMenRR',
    'RoomJ': 'FalconRoomJ',
    'Cfarm': 'FalconCFarm',
    'Room101': 'FalconR101',
    'Room102': 'FalconR102',
    'Room103': 'FalconR103',
    'Room104': 'FalconR104',
    'Room105': 'FalconR105',
    'Room106': 'FalconR106',
    'Room107': 'FalconR107',
    'Room108': 'FalconR108',
    'Room109': 'FalconR109',
    'Room110': 'FalconR110',
    'Room111': 'FalconR111'
};

// 3. IMAGE mapping
exports.block_to_texture = {
    // Passable 
    'passable' : 'passable.png',

    // Blockage
    'bedrock' : 'bedrock.png',
    'gravel'  : 'gravel.png',
    'frozen' : 'frozen.png',
    'redstone': 'redstone.png',


    // Doors
    'open_door': 'door_open.png',

    // Player
    'redPlayer' : 'redPlayer.png',
    'bluePlayer' : 'bluePlayer.png',
    'greenPlayer' : 'greenPlayer.png',
    'frozenPlayer': 'freeze_player.png',
    

    // Victims
    'yellow_victim': 'victim-yellow.gif',
    'green_victim': 'victim-green.gif',
    'red_victim': 'victim-red.gif',
    'green_victim_triaged': 'victim-green-triaged.gif',
    'yellow_victim_triaged': 'victim-yellow-triaged.gif',
};

// 4. Socket address
exports.socketFrontEnd = socketFrontEnd;
exports.socketKey = socket_key;

// 5. Victims 
const victims = {
    critical: 0, // old: yellow
    regular: 0, // old: green
}

exports.victims = victims;

/*---------------------------------------------------*/
/*--------- WEBPAGE UI (not PHASER CANVAS) ----------*/
/*---------------------------------------------------*/
// DOM elements
const DOM = {
    trial_name: $("#trial_name"),
    trial_number: $("#trial_number"),
    trial_condition: $("#trial_condition"),
    trial_date: $("#trial_date"),
    subject_id: $("#subject_id"),
    experiment_name: $("#experiment_name"),
    experiment_mission: $("#mission_name"),
    testbed_version: $("#testbed_v"),

    mission_timer:$("#mission_timer"),
    score: $("#teamScore"),
    pause: $("#pause"),
    triaged_yellow_victims: $("#yellow"),
    triaged_green_victims: $("#green"),
}

// Update data as we receive new data from Socket backend
socketFrontEnd.on(socket_key.trial_start, function (data) { 
    const info = data.data;
    // trial_name, trial_number, trial_time, trial_condition, subjects, experiment_name, experiment_mission, testbed_version
    DOM.trial_name.text(`Trial name: ${info.trial_name}`);
    DOM.trial_number.text(`Trial number: ${info.trial_number}`);
    DOM.trial_condition.text(`Trial condition: ${info.trial_condition}`);
    DOM.trial_date.text(`Trial date: ${info.trial_time}`);
    DOM.subject_id.text(`Subject ID: ${info.subjects}`);
    DOM.experiment_name.text(`Experiment name: ${info.experiment_name}`);
    DOM.experiment_mission.text(`Mission name: ${info.experiment_mission}`);
    DOM.testbed_version.text(`Testbed version: ${info.testbed_version}`); 

    // Resetting scene... NEED WORK
    console.log('TRIAL_START');
});

socketFrontEnd.on(socket_key.mission_timer, function (data) { 
    // console.log(data);
    DOM.mission_timer.text(data);
});

socketFrontEnd.on(socket_key.event_pause, function (data) { 
    DOM.pause.text(data);
});

socketFrontEnd.on(socket_key.event_score, function (data) { 
    DOM.score.text(data);
});

socketFrontEnd.on(socket_key.event_triage, function (data) { 
    DOM.triaged_green_victims.text(`Green: ${data.triaged_regular} out of ${victims.regular}`);
    DOM.triaged_yellow_victims.text(`Yellow: ${data.triaged_critical} out of ${victims.critical}`); 
});

if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    socketFrontEnd.emit('clearState', 'Please clear the current states');
    victims.regular = 0;
    victims.critical = 0;
    console.info('This page is reloaded');
  } else {
    console.info('This page is not reloaded');
  }
  
