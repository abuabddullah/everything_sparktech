const express = require('express');
const { addNewFeedback, getFeedbacksList } = require('./feedback.controller');
const router = express.Router();

const { isValidUser } = require('../../middlewares/auth')

//follow routes
router.post('/', isValidUser, addNewFeedback);
router.get('/:id', getFeedbacksList);

module.exports = router;