const express = require("express");
const {
  userDetails,
  updateProfile,
  allUsers,
  userRatio,
  completeAccount,
  acceptDriver,
  deleteUserAccount,
  activeOnDuty,
  allDriverRequest,
  blockUser,
  deleteDriver,
} = require("./user.controller");
const router = express.Router();
const userFileUploadMiddleware = require("../../middlewares/fileUpload");

const UPLOADS_FOLDER_USERS = "./public/uploads/users";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

const { isValidUser, tokenCheck, noCheck } = require("../../middlewares/auth");
const convertHeicToPng = require("../../middlewares/converter");
const ensureUploadFolderExists = require("../../helpers/fileExists");

ensureUploadFolderExists(UPLOADS_FOLDER_USERS);

//Sign-up user
router.get("/user-details", isValidUser, userDetails);
router.get("/", isValidUser, allUsers);
router.get("/drivers/requests", isValidUser, allDriverRequest);

router.post(
  "/complete",
  uploadUsers.fields([
    { name: "identityImage", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
    { name: "certificateImage", maxCount: 1 },
    { name: "cdlNumberVerificationImage", maxCount: 1 },
  ]),
  convertHeicToPng(UPLOADS_FOLDER_USERS),
  isValidUser,
  completeAccount
);

router.post("/ratio", isValidUser, userRatio);

router.put(
  "/",
  uploadUsers.fields([
    { name: "identityImage", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
    { name: "certificateImage", maxCount: 1 },
  ]),
  convertHeicToPng(UPLOADS_FOLDER_USERS),
  isValidUser,
  updateProfile
);

router.patch("/verify_and_change_status", isValidUser, acceptDriver);
router.patch("/switch_on_duty", isValidUser, activeOnDuty);
router.patch("/block_user", isValidUser, blockUser);
router.delete("/delete_user", isValidUser, deleteUserAccount);
router.delete("/delete_driver/:id", isValidUser, deleteDriver);

module.exports = router;
