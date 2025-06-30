const passport = require("passport");
const tokenGenerator = require("../../helpers/tokenGenerator");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { addUser, login, getUserByEmail } = require("./auth.service");
const {
  sendOTP,
  verifyOTP,
  deleteOTP,
  checkOTPByEmail,
} = require("../Otp/otp.service");
const {
  addToken,
  verifyToken,
  deleteToken,
} = require("../Token/token.service");
const crypto = require("crypto");
const {
  setSuccessDataAndRedirect,
  setErrorDataAndRedirect,
} = require("../../helpers/setRedirectData");
const generateCustomID = require("../../helpers/generateCustomId");
const jwt = require("jsonwebtoken");

const failureRedirect = process.env.FAILURE_URL_WEB;

const localAuth = catchAsync(async (req, res) => {
  //Get email password from req.body
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json(
        response({
          statusCode: "200",
          message: req.t("login-credentials-required"),
          status: "OK",
        })
      );
  }
  const user = await login(email, password, "signIn");
  if (user && !user?.isBlocked) {
    const token = await tokenGenerator(user);
    return res
      .status(200)
      .json(
        response({
          statusCode: "200",
          message: req.t("login-success"),
          status: "OK",
          type: "user",
          data: user,
          accessToken: token,
        })
      );
  }
  return res
    .status(404)
    .json(
      response({
        statusCode: "400",
        message: req.t("login-failed"),
        status: "OK",
      })
    );
});

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: failureRedirect },
    async (err, user, info) => {
      if (err || !user) {
        return await setErrorDataAndRedirect(res, err, user);
      }
      const token = await tokenGenerator(user);
      await setSuccessDataAndRedirect(res, user, token);
    }
  )(req, res, next);
};

const facebookAuth = passport.authenticate("facebook");

const facebookCallback = (req, res, next) => {
  passport.authenticate(
    "facebook",
    { failureRedirect: failureRedirect },
    async (err, user, info) => {
      if (err || !user) {
        return await setErrorDataAndRedirect(res, err, user);
      }
      const token = await tokenGenerator(user);
      await setSuccessDataAndRedirect(res, user, token);
    }
  )(req, res, next);
};

const signUp = catchAsync(async (req, res) => {
  var otpPurpose = "email-verification";
  var { fullName, email, password, role } = req.body;
  const existingOTP = await checkOTPByEmail(email);
  var message = req.t("otp-sent");
  if (existingOTP) {
    message = req.t("otp-exists");
  } else {
    const otpData = await sendOTP(fullName, email, "email", otpPurpose);
    if (otpData) {
      message = req.t("otp-sent");
    }
  }

  const signUpData = {
    fullName,
    email,
    password,
    role,
  };

  const signUpToken = jwt.sign(signUpData, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: "1h",
  });

  return res
    .status(201)
    .json(
      response({
        status: "OK",
        statusCode: "201",
        type: "user",
        message: message,
        signUpToken: signUpToken,
      })
    );
});

const validateEmail = catchAsync(async (req, res) => {
  var otpPurpose = "email-verification";
  const { otp } = req.body;
  const otpData = await verifyOTP(req.User?.email, "email", otpPurpose, otp);
  req.User.userId = await generateCustomID();
  const registeredUser = await addUser(req.User);

  const accessToken = await tokenGenerator(registeredUser);

  await deleteOTP(otpData._id);

  return res
    .status(201)
    .json(
      response({
        status: "OK",
        statusCode: "201",
        type: "user",
        message: req.t("user-verified"),
        data: registeredUser,
        accessToken: accessToken,
      })
    );
});

const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json(
      response({
        status: "Error",
        statusCode: "404",
        type: "user",
        message: req.t("user-not-exists"),
      })
    );
  }
  const otpData = await sendOTP(
    user.fullName,
    email,
    "email",
    "forget-password"
  );
  if (otpData) {
    return res.status(200).json(
      response({
        status: "OK",
        statusCode: "200",
        type: "user",
        message: req.t("forget-password-sent"),
      })
    );
  }
  return res.status(400).json(
    response({
      status: "Error",
      statusCode: "400",
      type: "user",
      message: req.t("forget-password-error"),
    })
  );
});

const verifyForgetPasswordOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json(
      response({
        status: "Error",
        statusCode: "404",
        type: "user",
        message: req.t("user-not-exists"),
      })
    );
  }
  const otpVerified = await verifyOTP(email, "email", "forget-password", otp);
  if (!otpVerified) {
    return res.status(400).json(
      response({
        status: "Error",
        statusCode: "400",
        type: "user",
        message: req.t("invalid-otp"),
      })
    );
  }
  const token = crypto.randomBytes(32).toString("hex");
  const data = {
    token: token,
    userId: user._id,
    purpose: "forget-password",
  };
  await addToken(data);
  return res.status(200).json(
    response({
      status: "OK",
      statusCode: "200",
      type: "user",
      message: req.t("otp-verified"),
      forgetPasswordToken: token,
    })
  );
});

const resetPassword = catchAsync(async (req, res) => {
  var forgetPasswordToken;
  if (
    req.headers["forget-password"] &&
    req.headers["forget-password"].startsWith("Forget-password ")
  ) {
    forgetPasswordToken = req.headers["forget-password"].split(" ")[1];
  }
  if (!forgetPasswordToken) {
    return res.status(401).json(
      response({
        status: "Error",
        statusCode: "400",
        type: "user",
        message: req.t("unauthorised"),
      })
    );
  }

  const tokenData = await verifyToken(forgetPasswordToken, "forget-password");
  if (!tokenData) {
    return res.status(400).json(
      response({
        status: "Error",
        statusCode: "400",
        type: "user",
        message: req.t("invalid-token"),
      })
    );
  }
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json(
      response({
        status: "Error",
        statusCode: "404",
        type: "user",
        message: req.t("user-not-exists"),
      })
    );
  }
  user.password = password;
  await user.save();
  await deleteToken(tokenData._id);
  return res.status(200).json(
    response({
      status: "OK",
      statusCode: "200",
      type: "user",
      message: req.t("password-reset-success"),
    })
  );
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const verifyUser = await login(req.body.userEmail, oldPassword, "changePass");
  if (!verifyUser) {
    return res.status(400).json(
      response({
        status: "Error",
        statusCode: "400",
        type: "user",
        message: req.t("password-invalid"),
      })
    );
  }
  verifyUser.password = newPassword;
  await verifyUser.save();
  return res.status(200).json(
    response({
      status: "OK",
      statusCode: "200",
      type: "user",
      message: req.t("password-changed"),
      data: verifyUser,
    })
  );
});

module.exports = {
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
};
