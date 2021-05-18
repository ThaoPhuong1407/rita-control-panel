/* eslint-disable camelcase */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */

// Make connection
const socketFrontEnd = io.connect('http://localhost:3000/state-estimation');

/* ----------------------------*/
/* Efficient Level Graph (EL)  */
/* ----------------------------*/
// Initialize variables
var elGraph = document.getElementById('el-graph');
var predictionID = [];
var percentTrue = 0;
var percentFalse = 0;

if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
  socketFrontEnd.emit('clearState', 'Please clear the current states');
  predictionID = [];
  percentTrue = 0;
  percentFalse = 0;
  console.info('This page is reloaded');
} else {
  console.info('This page is not reloaded');
}

// Initialize graph
var dataEL = [
  {
    y: [0],
  },
];

var layoutEL = {
  hovermode: 'closest',
  title: {
    text: "Prediction's Accuracy Level",
    font: {
      family: 'Courier New, monospace',
      size: 35,
      color: '#ffff',
    },
  },
  xaxis: {
    linecolor: '#228DFF',
    color: '#ffe6ffd2',
    tickformat: ',d',
    title: {
      text: 'Number of predictions',
      font: {
        family: 'monospace',
        size: 18,
        color: '#f9e3ff',
      },
      tickcolor: '#228DFF',
    },
    rangemode: 'nonnegative',
    showspikes: true,
    showgrid: false,
  },
  yaxis: {
    linecolor: '#228DFF',
    color: '#ffe6ffd2',
    tickformat: '%',
    title: {
      text: 'Accuracy',
      font: {
        family: 'monospace',
        size: 18,
        color: '#f9e3ff',
      },
    },
    range: [0, 1],
    rangemode: 'nonnegative',
    showspikes: true,
    showgrid: false,
  },

  paper_bgcolor: 'rgb(0,0,0,0)',
  plot_bgcolor: 'rgb(0,0,0,0)',
};

var configEL = {
  scrollZoom: true,
  responsive: true,
};

Plotly.plot(elGraph, dataEL, layoutEL, configEL);

// Update graph as data coming in
socketFrontEnd.on('newPrediction', function (data) {
  // If new prediction, append to the "monitor"
  if (!predictionID.includes(data.uid)) {
    predictionID.push(data.uid);
    console.log(data.uid, predictionID.length);
    $('.prediction ul').prepend(`<li class="predictionWrapper"> ${data.prediction} - ${data.uid}</li>`);
  }

  // Status = true
  if (data.state === true || data.state === "true") {
    percentTrue = data.accuracy.toFixed(2) * 100;
    percentFalse = 100 - percentTrue;
    
    // Section 2: change color and fadeout, then remove
    if ($(`.prediction ul li:contains(${data.uid})`).length > 0) {
      $(`.prediction ul li:contains(${data.uid})`).addClass('fadeOutTrue'); 
      setTimeout(function () { // wait a bit before removing (animation)
          $(`.prediction ul li:contains(${data.uid})`).remove(); 
      }, 3000);
    }  

    // Mini boxes (Section 3)
    $('.true ul').prepend(`<li class="miniBoxID"> ${data.uid}`); 
    $(`.true h3`).text(`True: ${percentTrue}%`);
    $(`.false h3`).text(`False: ${percentFalse}%`);

    // Update Graph (Section 3)
    Plotly.extendTraces(elGraph, { y: [[data.accuracy]] }, [0]);

    // Status = false
  } else if (data.state === false || data.state === "false") {
    // Section 2: change color and fadeout, then remove
    if ($(`.prediction ul li:contains(${data.uid})`).length > 0) {
      $(`.prediction ul li:contains(${data.uid})`).addClass('fadeOutFalse'); 
      setTimeout(function () { // wait a bit before removing (animation)
        $(`.prediction ul li:contains(${data.uid})`).remove();
      }, 3000);
    }  

    // Section 3 (Mini boxes)
    $('.false ul').prepend(`<li class="miniBoxID"> ${data.uid}`); 

     // Update Graph (Section 3)
     Plotly.extendTraces(elGraph, { y: [[data.accuracy]] }, [0]);
  }
});

/* -------------------------------------------------------*/
/* Cognitive Load graph (CL) && Memory Count Graph (MC) */
/* ------------------------------------------------------*/
var clGraph = document.getElementById('cl-graph');
var mcGraph = document.getElementById('mc-graph');

// Initialize graph: Cognitive Level Graph (CL)
var dataCL = [
  {
    y: [0],
  },
];

var layoutCL = {
  hovermode: 'closest',
  title: {
    text: 'Cognitive Load',
    font: {
      family: 'Courier New, monospace',
      size: 30,
      color: '#ffff',
    },
  },
  xaxis: {
    linecolor: '#228DFF',
    color: '#ffe6ffd2',
    tickformat: ',d',
    title: {
      text: 'Unit of time',
      font: {
        family: 'monospace',
        size: 18,
        color: '#f9e3ff',
      },
      tickcolor: '#228DFF',
    },
    rangemode: 'nonnegative',
    showspikes: true,
    showgrid: false,
  },
  yaxis: {
    linecolor: '#228DFF',
    color: '#ffe6ffd2',
    title: {
      text: 'Bits',
      font: {
        family: 'monospace',
        size: 18,
        color: '#f9e3ff',
      },
    },
    range: [0, 150],
    rangemode: 'nonnegative',
    showspikes: true,
    showgrid: false,
  },

  paper_bgcolor: 'rgb(0,0,0,0)',
  plot_bgcolor: 'rgb(0,0,0,0)',
};

var configCL = {
  scrollZoom: true,
  responsive: true,
};

Plotly.plot(clGraph, dataCL, layoutCL, configCL);

// Initialize graph: Memory Count Graph (MC)
var xValue = ['Rooms Skipped', 'Untriaged Urgent Victims', 'Untriaged Green Victims'];
var yValue = [0, 0, 0];

var dataMC = [
  {
    x: xValue,
    y: yValue,
    type: 'bar',
    marker: {
      color: '#ff70ae',
      line: {
        color: '#f73b8d',
        width: 1,
      },
    },
  },
];

var layoutMC = {
  title: {
    text: 'Memory Pieces',
    font: {
      family: 'Bellota, monospace',
      size: 30,
      color: '#ffff',
    },
  },
  xaxis: {
    linecolor: '#ffe6ffd2',
    tickfont: {
      size: 13,
      color: '#ffe6ffd2',
    },
  },
  yaxis: {
    linecolor: '#ffe6ffd2',
    color: '#ffe6ffd2',
    title: {
      text: 'Counts',
      font: {
        family: 'monospace',
        size: 18,
        color: '#f9e3ff',
      },
    },
    showspikes: true,
    showgrid: false,
    range: [0, 50],
  },

  paper_bgcolor: 'rgb(0,0,0,0)',
  plot_bgcolor: 'rgb(0,0,0,0)',
};

var configMC = {
  scrollZoom: true,
  responsive: true,
};

Plotly.plot(mcGraph, dataMC, layoutMC, configMC);

// Update graphes based on incoming data
var updatedValue;
socketFrontEnd.on('newCognitiveLoad', function (data) {
  // CL graph
  Plotly.extendTraces(clGraph, { y: [[data.cognitiveLoad]] }, [0]);
  console.log(data.cognitiveLoad);
  console.log(data); 

  // MC graph
  setTimeout(function () {
    updatedValue = [data.roomsSkipped, data.unUrgentPatients, data.unGreenPatients];
    Plotly.restyle(mcGraph, 'y', [updatedValue]);
    $(`#cognitive_load`).text(`${data.cognitiveLoad} bits`);
    $(`#room_skipped`).text(`${data.roomsSkipped} room(s)`);
    $(`#urgent_patient`).text(`${data.unUrgentPatients} patient(s)`);
    $(`#green_patient`).text(`${data.unGreenPatients} patient(s)`);

    $(`#cognitive_load1`).text(`${data.cognitiveLoad} bits`);
    $(`#room_skipped1`).text(`${data.roomsSkipped} room(s)`);
    $(`#urgent_patient1`).text(`${data.unUrgentPatients} patient(s)`);
    $(`#green_patient1`).text(`${data.unGreenPatients} patient(s)`);
  }, 300);
});

/* -------------------------------------------------------*/
/* Stress Level GRaph (SL) */
/* ------------------------------------------------------*/
// var slGraph = document.getElementById('sl-graph');

// Initialize graph: Stress Level Graph (CL)
// var cardiac_signal = {
//   x: [0],
//   y: [0],
//   mode: 'lines',
//   name: 'cardiac_signal',
//   line: {
//     color: '#e36464',
//     width: 0.9,
//   },
// };

// var oxygenated_blood_signal1 = {
//   x: [0],
//   y: [0],
//   mode: 'lines',
//   name: 'oxygenated_signal1',
//   line: {
//     color: '#5fad82',
//     width: 0.9,
//   },
// };

// var oxygenated_blood_signal2 = {
//   x: [0],
//   y: [],
//   mode: 'lines',
//   name: 'oxygenated_signal2',
// };

// var deoxygenated_signal1 = {
//   x: [0],
//   y: [0],
//   mode: 'lines',
//   name: 'deoxygenated_signal1',
//   line: {
//     color: '#e0dd7b',
//     width: 0.9,
//   },
// };

// var deoxygenated_signal2 = {
//   x: [0],
//   y: [0],
//   mode: 'lines',
//   name: 'deoxygenated_signal2',
// };

// var total_oxygenated_signal1 = {
//   x: [0],
//   y: [0],
//   mode: 'lines',
//   name: 'total_oxygenated_signal1',
//   line: {
//     color: 'rgba(99, 99, 191, 0.6)',
//     width: 0.9,
//   },
// };

// var total_oxygenated_signal2 = {
//   x: [0],
//   y: [0],
//   mode: 'lines',
//   name: 'total_oxygenated_signal2',
// };

// var dataSL = [
//   cardiac_signal,
//   oxygenated_blood_signal1,
//   // oxygenated_blood_signal2,
//   deoxygenated_signal1,
//   // deoxygenated_signal2,
//   total_oxygenated_signal1,
//   // total_oxygenated_signal2,
// ];

// var layoutSL = {
//   hovermode: 'closest',
//   title: {
//     text: 'fNIRs',
//     font: {
//       family: 'Courier New, monospace',
//       size: 30,
//       color: '#ffff',
//     },
//   },
//   xaxis: {
//     linecolor: '#228DFF',
//     color: '#ffe6ffd2',

//     spikemode: 'across',
//     showspikes: true,
//     spikedash: 'solid',
//     spikethickness: 0.5,

//     showgrid: false,
//     range: [0, 10],
//     title: {
//       text: 'Minutes',
//       font: {
//         family: 'monospace',
//         size: 18,
//         color: '#f9e3ff',
//       },
//       tickcolor: '#228DFF',
//     },
//     rangemode: 'nonnegative',
//   },

//   yaxis: {
//     autorange: true,
//     linecolor: '#228DFF',
//     color: '#ffe6ffd2',
//     title: {
//       text: '',
//       font: {
//         family: 'monospace',
//         size: 18,
//         color: '#f9e3ff',
//       },
//     },
//     showspikes: true,
//     spikethickness: 0.5,
//     showgrid: false,
//   },

//   shapes: [
//     //line vertical
//     {
//       type: 'line',
//       x0: 0,
//       y0: 4,
//       x1: 0,
//       y1: -8,
//       line: {
//         color: 'rgba(27, 110, 218, 0.64)',
//         width: 0.8,
//       },
//     },
//   ],

//   paper_bgcolor: 'rgb(0,0,0,0)',
//   plot_bgcolor: 'rgb(0,0,0,0)',
// };

// var configSL = {
//   scrollZoom: true,
//   responsive: true,
// };

// Plotly.newPlot(slGraph, dataSL, layoutSL, configSL);

// socketFrontEnd.on('newFNIRS', function (data) {
//   setTimeout(function () {
//     var updatedData = {
//       x: [data.timeInMin],
//       y: [
//         data.cardiac_signal,
//         data.oxygenated_blood_signal1,
//         // data.oxygenated_blood_signal2,
//         data.deoxygenated_signal1,
//         // data.deoxygenated_signal2,
//         data.total_oxygenated_signal1,
//         // data.total_oxygenated_signal2,
//       ],
//     };

//     var updateLayout = {
//       'shapes[0].x0': data.currentTime,
//       'shapes[0].x1': data.currentTime,
//     };

//     if (data.stressLevel === 1) {
//       $(`#stress-icon-1`).css('opacity', '0.9');
//       $(`#stress-icon-2`).css('opacity', '0.3');
//       $(`#stress-icon-3`).css('opacity', '0.3');
//     } else if (data.stressLevel === 2) {
//       $(`#stress-icon-1`).css('opacity', '0.3');
//       $(`#stress-icon-2`).css('opacity', '0.9');
//       $(`#stress-icon-3`).css('opacity', '0.3');
//     } else if (data.stressLevel === 3) {
//       $(`#stress-icon-1`).css('opacity', '0.3');
//       $(`#stress-icon-2`).css('opacity', '0.3');
//       $(`#stress-icon-3`).css('opacity', '0.9');
//     }

//     Plotly.update(slGraph, updatedData);
//     Plotly.relayout(slGraph, updateLayout);
//   }, 300);
// });
