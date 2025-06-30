const express = require('express');
const { addNewReview, getAllReviews, getReviewsList } = require('./review.controller');
const router = express.Router();

const { isValidUser } = require('../../middlewares/auth')

//follow routes
router.post('/', isValidUser, addNewReview);
router.get('/details/:id', getAllReviews);
router.get('/:id', getReviewsList);

module.exports = router;