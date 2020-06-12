const express = require('express');
const viewsController = require('../controllers/backend/viewsController');

const router = express.Router();

router.get('/', viewsController.getOverview); // Landing page
router.get('/state-estimation', viewsController.getPrediction); // state-estimation

module.exports = router;
