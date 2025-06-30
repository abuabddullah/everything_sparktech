const httpStatus = require("http-status");
const ApiError = require("../../helpers/ApiError");
const User = require("../User/user.model");
const bcrypt = require("bcryptjs");

const addUser = async (userBody) => {
  const user = new User(userBody);
  return await user.save();
};

const login = async (email, password, purpose) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with this email");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }
  return user;
};

const getUserByGoogleId = async (googleId) => {
  return await User.findOne({ googleId });
};

const getUserByFacebookId = async (facebookId) => {
  return await User.findOne({ facebookId });
};

const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const socialLoginService = async (payload) => {
  const { email } = payload;
  const user = await User.findOne({ email });
  if (!user) {
    return await User.create({ ...payload, isSocialLogin: true });
  } else {
    return user;
  }
};

module.exports = {
  login,
  addUser,
  getUserByGoogleId,
  getUserByFacebookId,
  getUserByEmail,
  socialLoginService,
};
