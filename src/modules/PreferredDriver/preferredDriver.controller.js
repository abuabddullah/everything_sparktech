const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { addPreferredDriver, getAllPreferredDrivers } = require("./preferredDriver.service");

const addMyPreferredDriver = catchAsync(async (req, res) => {
  req.body.user = req.User._id;
  const preferredDriver = await addPreferredDriver(req.body);
  return res.status(httpStatus.CREATED).json(response({ message: "Preferred Driver added successfully", status: "OK", statusCode: httpStatus.CREATED, data: preferredDriver }));
});

const getMyPreferredDrivers = catchAsync(async (req, res) => {
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  }
  let filters = {
    user: req.User._id
  };
  const result = await getAllPreferredDrivers(filters, options);
  return res.status(httpStatus.OK).json(response({ message: "Messages", status: "OK", statusCode: httpStatus.OK, data: result }));
});

module.exports = {
  addMyPreferredDriver,
  getMyPreferredDrivers
};
