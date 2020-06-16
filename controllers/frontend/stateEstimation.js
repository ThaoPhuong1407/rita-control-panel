/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */

// Make connection
const socketFrontEnd = io.connect('http://localhost:3000/state-estimation');

// Initialized variables
var predictionID = [];
var correctPrediction = 0;
var accuracy = 0;
var totalRuns = 0;
var test = document.getElementById('graph');
var percentTrue = 0;
var percentFalse = 0;

// GRAPH
var data = [
  {
    y: [accuracy],
  },
];

var layout = {
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

var config = {
  scrollZoom: true,
  responsive: true,
};

Plotly.plot(test, data, layout, config);
socketFrontEnd.on('newPrediction', function (data) {
  if (!predictionID.includes(data.uid)) {
    totalRuns += 1;
    predictionID.push(data.uid);
    $('.prediction ul').prepend(`<li class="predictionWrapper"> ${data.uid}: ${data.prediction} </li>`);
  } else if (data.state) {
    // Calcuation
    correctPrediction += 1;
    accuracy = correctPrediction / totalRuns;
    percentTrue = accuracy.toFixed(2) * 100;
    // Update Correct UI
    $(`.true h3`).text(`True: ${percentTrue}%`);
    $(`.prediction ul li:contains(${data.uid})`).css({ 'background-color': '#1dac75c7', color: '#fff' }); // Section 2
    $('.true ul').prepend(`<li class="miniBoxID"> ${data.uid}`); // Section 3
    // Update Graph
    Plotly.extendTraces(test, { y: [[accuracy]] }, [0]);
    console.log(correctPrediction, totalRuns, accuracy);
  } else {
    // Calcuation
    accuracy = correctPrediction / totalRuns;
    percentFalse = 100 - accuracy.toFixed(2) * 100;
    // Update Correct UI
    $(`.false h3`).text(`False: ${percentFalse}%`);
    $(`.prediction ul li:contains(${data.uid})`).css('background-color', 'rgba(177, 75, 92, 0.452)'); // Section 2
    $('.false ul').prepend(`<li class="miniBoxID"> ${data.uid}`); // Section 3
    // Update Graph
    Plotly.extendTraces(test, { y: [[accuracy]] }, [0]);
    console.log(correctPrediction, totalRuns, accuracy);
  }
});

/* background animation */
// function animateWithRandomNumber(myClass, from, to) {
//   TweenMax.fromTo(
//     myClass,
//     Math.floor(Math.random() * (60 - 2 + 1) + 2) * 0.5 + 0.5,
//     { y: from },
//     { y: to, onComplete: animateWithRandomNumber, onCompleteParams: [myClass, from, to], ease: Linear.easeNone }
//   );
// }
// var itemsDown = [
//   '.light4',
//   '.light5',
//   '.light6',
//   '.light7',
//   '.light8',
//   '.light11',
//   '.light12',
//   '.light13',
//   '.light14',
//   '.light15',
//   '.light16',
// ].forEach(function (e) {
//   animateWithRandomNumber(e, -1080, 1080);
// });
// var itemsUp = ['.light1', '.light2', '.light3', '.light9', '.light10', '.light17'].forEach(function (e) {
//   animateWithRandomNumber(e, 1080, -1080);
// });
