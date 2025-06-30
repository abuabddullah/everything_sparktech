const express = require('express');
const { requestForLoad, requestActionHandler, loadRequestHandler } = require('./loadRequest.controller');
const router = express.Router();

const { isValidUser } = require('../../middlewares/auth')

router.post('/', isValidUser, requestForLoad);
router.get('/', isValidUser, loadRequestHandler);
router.post('/action', isValidUser, requestActionHandler);

module.exports = router;