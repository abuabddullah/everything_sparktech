const express = require('express');
const { isValidUser } = require('../../middlewares/auth')
const { addMyPreferredDriver, getMyPreferredDrivers} = require('./preferredDriver.controller');

const router = express.Router();

router.get('/', isValidUser, getMyPreferredDrivers);
router.post('/', isValidUser, addMyPreferredDriver);

module.exports = router;
