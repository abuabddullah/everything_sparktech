const express = require('express');
const { upgradeStaticContent, getAllStaticContent } = require('./staticContent.controller');
const router = express.Router();
const { isValidUser } = require('../../middlewares/auth')

router.post('/',  isValidUser, upgradeStaticContent);
router.get('/', getAllStaticContent);

module.exports = router;