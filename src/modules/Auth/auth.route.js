const express = require("express");
const {
  localAuth,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
  signUp,
  validateEmail,
  forgetPassword,
  verifyForgetPasswordOTP,
  resetPassword,
  changePassword,
} = require("./auth.controller");
const { isValidUser, tokenCheck } = require("../../middlewares/auth");

const router = express.Router();

router.post("/local", localAuth);
router.post("/sign-up", signUp);
router.post("/verify-email", tokenCheck, validateEmail);
router.post("/forget-password", forgetPassword);
router.post("/verify-otp", verifyForgetPasswordOTP);
router.post("/reset-password", resetPassword);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/facebook", facebookAuth);
router.get("/facebook/callback", facebookCallback);
router.patch("/change-password", isValidUser, changePassword);

module.exports = router;
