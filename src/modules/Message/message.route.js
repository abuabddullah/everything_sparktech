const express = require('express');
const { isValidUser } = require('../../middlewares/auth')
const { getAllMessages} = require('./message.controller');

const router = express.Router();

router.get('/', isValidUser, getAllMessages);

module.exports = router;
