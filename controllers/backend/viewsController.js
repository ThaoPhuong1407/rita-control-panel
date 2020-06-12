/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const RMQ = require('../../rabbitMQ/rabbitMQ-receive');
const catchAsync = require('../../utils/catchAsync');
const RitaComponent = require('../../models/backend/ritaComponentModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get data
  const components = await RitaComponent.find();

  // 2) Render the template with data from dbs
  res.status(200).render('overview', {
    title: 'All components',
    components,
  });
});

exports.getPrediction = catchAsync(async (req, res, next) => {
  // 2)  Render the template 'stateEstimation' and pass data to it
  res.status(200).render('stateEstimation', {
    title: 'State Estimation',
    allPredictions: RMQ.predictionArray,
  });
});
