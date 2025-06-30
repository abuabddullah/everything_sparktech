const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const {
  addPreferredDriver,
  getAllPreferredDrivers,
  getALlMyPreferredDrivers,
} = require("./preferredDriver.service");

const addMyPreferredDriver = catchAsync(async (req, res) => {
  req.body.user = req.User._id;
  const preferredDriver = await addPreferredDriver(req.body);
  return res.status(httpStatus.CREATED).json(
    response({
      message: "Preferred Driver added successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: {
        results: preferredDriver,
      },
    })
  );
});

const getPreferredDrivers = catchAsync(async (req, res) => {
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };

  const result = await getAllPreferredDrivers(
    req.query.searchQuery,
    options,
    req.User
  );
  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Successfully retrieved data",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

const getAllMyPreferredDrivers = catchAsync(async (req, res) => {
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };

  const result = await getALlMyPreferredDrivers(
    req.query.searchQuery,
    options,
    req.User
  );
  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Messages",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

module.exports = {
  addMyPreferredDriver,
  getPreferredDrivers,
  getAllMyPreferredDrivers,
};
