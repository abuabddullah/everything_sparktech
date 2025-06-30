const httpStatus = require('http-status');
const ApiError = require('../../helpers/ApiError');
const User = require('../User/user.model');
const bcrypt = require('bcryptjs');

const addUser = async (userBody) => {
  const user = new User(userBody);
  return await user.save();
}

const login = async (email, password, purpose) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }
  return user;
}

const getUserByGoogleId = async (googleId) => {
  return await User.findOne({ googleId });
}

const getUserByFacebookId = async (facebookId) => {
  return await User.findOne({ facebookId });
}

const getUserByEmail = async (email) => {
  return await User.findOne({ email });
}

module.exports = {
  login,
  addUser,
  getUserByGoogleId,
  getUserByFacebookId,
  getUserByEmail
};
