const express = require('express');
const { addNewPaymentData, allPaymentList, getPaymentChart } = require('./paymentData.controller');
const router = express.Router();
const { isValidUser } = require('../../middlewares/auth')

router.post('/',  isValidUser, addNewPaymentData);
router.get('/charts',  isValidUser, getPaymentChart); 
router.get('/',  isValidUser, allPaymentList);

module.exports = router;