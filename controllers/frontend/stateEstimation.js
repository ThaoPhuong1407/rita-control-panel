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
  }

  // 2. Status = true
  if (data.state === true) {
    // a) Calculation
    correctPrediction += 1;
    accuracy = correctPrediction / totalRuns;
    percentTrue = accuracy.toFixed(2) * 100;
    percentFalse = 100 - percentTrue;

    // Update Correct UI
    $(`.true h3`).text(`True: ${percentTrue}%`);
    $(`.false h3`).text(`False: ${percentFalse}%`);
    $(`.prediction ul li:contains(${data.uid})`).addClass('fadeOutTest1'); // Section 2
    $('.true ul').prepend(`<li class="miniBoxID"> ${data.uid}`); // Section 3

    // Update Graph
    Plotly.extendTraces(elGraph, { y: [[accuracy]] }, [0]);

    // 2. status = false
  } else if (data.state === false) {
    // Calcuation
    accuracy = correctPrediction / totalRuns;
    percentTrue = accuracy.toFixed(2) * 100;
    percentFalse = 100 - percentTrue;

    // Update Correct UI
    $(`.true h3`).text(`True: ${percentTrue}%`);
    $(`.false h3`).text(`False: ${percentFalse}%`);
    $(`.prediction ul li:contains(${data.uid})`).addClass('fadeOutTest2'); // Section 2
    $('.false ul').prepend(`<li class="miniBoxID"> ${data.uid}`); // Section 3

    // Update Graph
    Plotly.extendTraces(elGraph, { y: [[accuracy]] }, [0]);
  }
});

/* -------------------------------------------------------*/
/* Efficient Level Graph (EL) && Memory Count Graph (MC) */
/* ------------------------------------------------------*/
var clGraph = document.getElementById('cl-graph');
var mcGraph = document.getElementById('mc-graph');

// Initialize graph: Cognitive Level Graph (CL)
var dataCL = [
  {
    x: [0],
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
var slGraph = document.getElementById('sl-graph');

// Initialize graph: Cognitive Level Graph (CL)
var dataSL = [
  {
    x: [0],
    y: [0],
  },
];

var layoutSL = {
  hovermode: 'closest',
  title: {
    text: 'Cardiac Signal',
    font: {
      family: 'Courier New, monospace',
      size: 30,
      color: '#ffff',
    },
  },
  xaxis: {
    linecolor: '#228DFF',
    color: '#ffe6ffd2',
    title: {
      text: 'Minutes',
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
      text: '',
      font: {
        family: 'monospace',
        size: 18,
        color: '#f9e3ff',
      },
    },
    showspikes: true,
    showgrid: false,
  },

  paper_bgcolor: 'rgb(0,0,0,0)',
  plot_bgcolor: 'rgb(0,0,0,0)',
};

var configSL = {
  scrollZoom: true,
  responsive: true,
};

Plotly.newPlot(slGraph, dataSL, layoutSL, configSL);

socketFrontEnd.on('newFNIRS', function (data) {
  setTimeout(function () {
    var updatedData = {
      x: [data.timeInMin],
      y: [data.cardiacSignal],
    };

    if (data.stressLevel === 1) {
      $(`#stress-icon-1`).css('opacity', '0.9');
      $(`#stress-icon-2`).css('opacity', '0.3');
      $(`#stress-icon-3`).css('opacity', '0.3');
    } else if (data.stressLevel === 2) {
      $(`#stress-icon-1`).css('opacity', '0.3');
      $(`#stress-icon-2`).css('opacity', '0.9');
      $(`#stress-icon-3`).css('opacity', '0.3');
    } else if (data.stressLevel === 3) {
      $(`#stress-icon-1`).css('opacity', '0.3');
      $(`#stress-icon-2`).css('opacity', '0.3');
      $(`#stress-icon-3`).css('opacity', '0.9');
    }

    Plotly.update(slGraph, updatedData);
  }, 300);
});
