const express = require("express");
const {
  localAuth,
  signUp,
  validateEmail,
  forgetPassword,
  verifyForgetPasswordOTP,
  resetPassword,
  changePassword,
  resendOTP,
  socialLogin,
  storeFcmToken,
} = require("./auth.controller");
const { isValidUser, tokenCheck } = require("../../middlewares/auth");

const router = express.Router();

router.post("/local", localAuth);
router.post("/sign-up", signUp);
router.post("/resend-otp", tokenCheck, resendOTP);

router.post("/verify-email", tokenCheck, validateEmail);
router.post("/forget-password", forgetPassword);
router.post("/verify-otp", tokenCheck, verifyForgetPasswordOTP);
router.post("/reset-password", resetPassword);

// router.get("/google", googleAuth);
// router.get("/google/callback", googleCallback);

// router.get("/facebook", facebookAuth);
// router.get("/facebook/callback", facebookCallback);

router.post("/social_login", socialLogin);
router.post("/store_fcmToken", isValidUser, storeFcmToken);

router.patch("/change-password", isValidUser, changePassword);

module.exports = router;
