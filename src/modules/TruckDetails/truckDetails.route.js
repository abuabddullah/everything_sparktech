const express = require('express');
const { addNewTruckDetails, myEquipment } = require('./truckDetails.controller');
const router = express.Router();

const { isValidUser } = require('../../middlewares/auth')

router.get('/', isValidUser, myEquipment);
router.post('/', isValidUser, addNewTruckDetails);

module.exports = router;