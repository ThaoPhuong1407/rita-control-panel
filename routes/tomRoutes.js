/* ------- IMPORT -------- */
// 3rd party
const express = require('express');

// custom
const tomController = require('../controllers/backend/tomController');

/* ----- Setting up routes ----- */
const router = express.Router();
router.route('/').get(tomController.getAllTom); // trigger function getAllTom when get a GET request

module.exports = router;
