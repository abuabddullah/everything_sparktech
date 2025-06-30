const express = require('express');
const { addNewLoadDetails, loadDetails } = require('./load.controller');
const router = express.Router();

const { isValidUser } = require('../../middlewares/auth')

router.post('/', isValidUser, addNewLoadDetails);
router.get('/:id', isValidUser, loadDetails);

module.exports = router;