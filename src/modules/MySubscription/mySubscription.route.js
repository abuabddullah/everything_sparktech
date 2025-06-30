const express = require('express');
const router = express.Router();

const { isValidUser } = require('../../middlewares/auth');
const { getMySubscriptionDetails } = require('./mySubscription.controller');

router.get('/', isValidUser, getMySubscriptionDetails);

module.exports = router;