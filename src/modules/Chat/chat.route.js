const express = require('express');
const { getAllChats, deleteChat } = require('./chat.controller');
const { isValidUser } = require('../../middlewares/auth')

const router = express.Router();

router.get('/', isValidUser,getAllChats);
router.get('/:id', isValidUser, deleteChat);

module.exports = router;
