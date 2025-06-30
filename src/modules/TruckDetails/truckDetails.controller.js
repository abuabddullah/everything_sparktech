const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const {
  addManyTruckDetails,
  getTransport,
  deleteTruckById,
  allAvailableTruck,
} = require("./truckDetails.service");
const userModel = require("../User/user.model");
const { findById } = require("./truckDetails.model");
const truckDetailsModel = require("./truckDetails.model");
const { getEquipment } = require("../Equipment/equipment.service");

const addNewTruckDetails = catchAsync(async (req, res) => {
  const data = req.body;

  const driver = req.User._id;

  if (req.User.role !== "driver") {
    return res.status(httpStatus.UNAUTHORIZED).json(
      response({
        status: "UNAUTHORIZED",
        statusCode: httpStatus.UNAUTHORIZED,
        type: "truck-details",
        message: req.t("Please log in as a driver"),
      })
    );
  }

  const truck = await getEquipment({
    driver,
    truckNumber: data.truck,
    type: "truck",
  });

  if (!truck) {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        status: "NOT_FOUND",
        statusCode: httpStatus.NOT_FOUND,
        type: "truck",
        message: req.t("Please provide a valid truck number"),
      })
    );
  }

  const trailerDetails = await getEquipment({
    _id: data.trailer,
    type: "trailer",
  });

  if (!trailerDetails) {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        status: "NOT_FOUND",
        statusCode: httpStatus.NOT_FOUND,
        type: "trailer",
        message: req.t("Trailer details not found"),
      })
    );
  }

  // Merge data and save
  const truckData = {
    driver,
    cdlNumber: truck[0].cdlNumber,
    truckNumber: truck[0].truckNumber,
    trailerSize: trailerDetails[0].trailerSize,
    palletSpace: trailerDetails[0].palletSpace,
    weight: trailerDetails[0].weight,
  };

  const truckDetails = await truckDetailsModel.create(truckData);

  return res.status(201).json(
    response({
      status: "OK",
      statusCode: "201",
      type: "truck-details",
      message: req.t("Truck details added successfully"),
      data: truckDetails,
    })
  );
});

const availableTruck = catchAsync(async (req, res) => {
  const query = req.query;
  const truckDetails = await allAvailableTruck(query);
  return res
    .status(200)
    .json(
      response({
        status: "OK",
        statusCode: "200",
        type: "truck-details",
        message: req.t("truck-details-added"),
        data: truckDetails,
      })
    );
});

//get
const myEquipment = catchAsync(async (req, res) => {
  const driver = req.User._id;

  const type = req.query.type;

  const query = { driver, type };

  const truckDetails = await getTransport(query);

  return res.status(200).json(
    response({
      status: "OK",
      statusCode: "200",
      type: "truck-details",
      message: req.t("fetched"),
      data: truckDetails,
    })
  );
});

//delete
const deleteTruck = catchAsync(async (req, res) => {
  const { id } = req.params;
  const truck = await truckDetailsModel.findById(id).populate("driver");
  await truckDetailsModel.findByIdAndDelete(id);
  const user = truck.driver;
  if (user) {
    user.isComplete = false;
    await user.save();
  }
  return res.status(httpStatus.OK).json(
    response({
      status: "Success",
      statusCode: httpStatus.OK,
      type: "truck",
      message: req.t("truck-deleted-success"),
    })
  );
});

module.exports = {
  addNewTruckDetails,
  myEquipment,
  deleteTruck,
  availableTruck,
};