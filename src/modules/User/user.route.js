const express = require('express');
const { userDetails, updateProfile, allUsers, userRatio, completeAccount } = require('./user.controller');
const router = express.Router();
const userFileUploadMiddleware = require("../../middlewares/fileUpload");

const UPLOADS_FOLDER_USERS = "./public/uploads/users";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

const { isValidUser, tokenCheck, noCheck } = require('../../middlewares/auth')
const convertHeicToPng = require('../../middlewares/converter');
const ensureUploadFolderExists = require('../../helpers/fileExists');

ensureUploadFolderExists(UPLOADS_FOLDER_USERS);

//Sign-up user
router.get('/user-details', isValidUser, userDetails);
router.get('/', isValidUser, allUsers);
router.post('/complete', isValidUser, completeAccount);
router.post('/ratio', isValidUser, userRatio);
router.put('/', uploadUsers.fields([
  { name: 'identityImage', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
  { name: 'certificateImage', maxCount: 1 }
]), convertHeicToPng(UPLOADS_FOLDER_USERS), isValidUser, updateProfile);
module.exports = router;