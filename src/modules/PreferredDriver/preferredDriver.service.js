const httpStatus = require("http-status");
const ApiError = require("../../helpers/ApiError");
const PreferredDriver = require("./preferredDriver.model");

const addPreferredDriver = async (preferredDriverBody) => {
  let existingPreferredDriver = await findPreferredDriver(preferredDriverBody);
  if (existingPreferredDriver) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Driver already in preferred list');
  }
  existingPreferredDriver = new PreferredDriver(preferredDriverBody);
  return await existingPreferredDriver.save();
};

const findPreferredDriver = async (preferredDriverBody) => {
  return await PreferredDriver.findOne({ user: preferredDriverBody.user, driver: preferredDriverBody.driver });
}

const getAllPreferredDrivers = async (filters, options) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;
  const preferredDrivers = await PreferredDriver.find(filters).skip(skip).limit(limit).populate('driver', 'fullName image').populate('driver');
  const totalResults = await PreferredDriver.countDocuments(filters);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { totalResults, totalPages, page, limit };
  return { preferredDrivers, pagination };
}

module.exports = {
  addPreferredDriver,
  getAllPreferredDrivers
};
