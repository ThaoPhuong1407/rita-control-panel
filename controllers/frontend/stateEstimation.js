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
var correctPrediction = 0;
var accuracy = 0;
var totalRuns = 0;
var percentTrue = 0;
var percentFalse = 0;

// Initialize graph
var dataEL = [
  {
    y: [accuracy],
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
  // 1. Add the data to predictionID arry to keep track of data
  if (!predictionID.includes(data.uid)) {
    totalRuns += 1;
    predictionID.push(data.uid);
    $('.prediction ul').prepend(`<li class="predictionWrapper"> ${data.uid}: ${data.prediction} </li>`);

    // 2. If data is already in the array and status = true
  } else if (data.state) {
    // a) Calculation
    correctPrediction += 1;
    accuracy = correctPrediction / totalRuns;
    percentTrue = accuracy.toFixed(2) * 100;
    percentFalse = 100 - percentTrue;

    // Update Correct UI
    $(`.true h3`).text(`True: ${percentTrue}%`);
    $(`.false h3`).text(`False: ${percentFalse}%`);
    $(`.prediction ul li:contains(${data.uid})`).css({ 'background-color': '#1dac75c7', color: '#fff' }); // Section 2
    $('.true ul').prepend(`<li class="miniBoxID"> ${data.uid}`); // Section 3

    // Update Graph
    Plotly.extendTraces(elGraph, { y: [[accuracy]] }, [0]);

    // 2. If data is already in the array and status = false
  } else {
    // Calcuation
    accuracy = correctPrediction / totalRuns;
    percentTrue = accuracy.toFixed(2) * 100;
    percentFalse = 100 - percentTrue;

    // Update Correct UI
    $(`.true h3`).text(`True: ${percentTrue}%`);
    $(`.false h3`).text(`False: ${percentFalse}%`);
    $(`.prediction ul li:contains(${data.uid})`).css('background-color', 'rgba(177, 75, 92, 0.452)'); // Section 2
    $('.false ul').prepend(`<li class="miniBoxID"> ${data.uid}`); // Section 3

    // Update Graph
    Plotly.extendTraces(elGraph, { y: [[accuracy]] }, [0]);
  }
});

/* ----------------------------*/
/* Cognitive Load Graph (CL)  */
/* ----------------------------*/
var clGraph = document.getElementById('cl-graph');

// Initialize graph
// Note: Untriaged Green Victims = 9 CL
var xValue = ['Cognitive load', 'Rooms Skipped', 'Untriaged Urgent Victims', 'Untriaged Green Victims'];
var yValue = [0, 0, 0, 0];

var dataCL = [
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

var layoutCL = {
  title: {
    text: 'Cognitive Load',
    font: {
      family: 'Courier New, monospace',
      size: 35,
      color: '#ffff',
    },
  },
  xaxis: {
    linecolor: '#ffe6ffd2',
    tickfont: {
      size: 11,
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
    range: [0, 180],
  },

  paper_bgcolor: 'rgb(0,0,0,0)',
  plot_bgcolor: 'rgb(0,0,0,0)',
};

var configCL = {
  scrollZoom: true,
  responsive: true,
};

Plotly.plot(clGraph, dataCL, layoutCL, configCL);

// Update graph based on incoming dataCL
var updatedValue;
socketFrontEnd.on('newCognitiveLoad', function (data) {
  setTimeout(function () {
    console.log(data);
    updatedValue = [data.cognitiveLoad, data.roomsSkipped, data.unUrgentPatients, data.unGreenPatients];
    Plotly.restyle(clGraph, 'y', [updatedValue]);
  }, 300);
});
