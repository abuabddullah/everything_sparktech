const response = require("../../helpers/response");
const {
  getLocationNameSuggestions,
  getLocationPoints,
  getDistanceBetweenTwoLocations,
} = require("./map.service");
const catchAsync = require("../../helpers/catchAsync");
const httpStatus = require("http-status");

const getLocationSuggestions = catchAsync(async (req, res) => {
  const { input } = req.query;
  const data = await getLocationNameSuggestions(input);
  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Messages",
        status: "OK",
        statusCode: httpStatus.OK,
        data,
      })
    );
});

const getLocationCoordinates = catchAsync(async (req, res) => {
  const { placeId } = req.query;
  const data = await getLocationPoints(placeId);
  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Messages",
        status: "OK",
        statusCode: httpStatus.OK,
        data,
      })
    );
});

const getDistance = catchAsync(async (req, res) => {
  const { origin, destination } = req.query;
  const data = await getDistanceBetweenTwoLocations(origin, destination);
  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Messages",
        status: "OK",
        statusCode: httpStatus.OK,
        data,
      })
    );
});

module.exports = {
  getLocationSuggestions,
  getLocationCoordinates,
  getDistance,
};
