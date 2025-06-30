const express = require('express');
const { getLocationSuggestions, getLocationCoordinates, getDistance } = require('./map.controller');
const router = express.Router();
const { isValidUser } = require('../../middlewares/auth')

router.get('/suggestions', getLocationSuggestions);
router.get('/co-ordinates', getLocationCoordinates);
router.get('/distance', getDistance);

module.exports = router;