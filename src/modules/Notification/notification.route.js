const express = require('express');
const { getAllNotifications } = require('./notification.controller');
const router = express.Router();
const { isValidUser } = require('../../middlewares/auth')

router.get('/', isValidUser, getAllNotifications);

module.exports = router;