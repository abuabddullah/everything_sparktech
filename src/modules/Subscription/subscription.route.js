const express = require('express');
const router = express.Router();

const { isValidUser } = require('../../middlewares/auth');
const { addNewSubscription, getAllSubscription } = require('./subscription.controller');

//Sign-up user
router.post('/', isValidUser, addNewSubscription);
router.get('/', isValidUser, getAllSubscription);

module.exports = router;