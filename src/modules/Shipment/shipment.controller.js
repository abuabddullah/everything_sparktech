const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const { findShipments } = require("./shipment.service");

//pendingShipment controller
const pendingShipment = catchAsync(async (req, res) => {
  const status = [
    {
      status: "Pending",
    },
  ];
  const result = await findShipments(req, status);
  return res.status(httpStatus.OK).json({
    status: "OK",
    statusCode: httpStatus.OK,
    message: "Pending Shipment fetched successfully.",
    data: {
      type: "Shipment",
      ...result,
    },
  });
});

//currrentShipment controller
const currrentShipment = catchAsync(async (req, res) => {
  const status = [
    { status: "Accepted" },
    { status: "Picked" },
    { status: "Delivery-Pending" },
  ];
  const result = await findShipments(req, status);

  return res.status(httpStatus.OK).json({
    status: "OK",
    statusCode: httpStatus.OK,
    message: "Current Shipment fetched successfully.",
    data: {
      type: "Shipment",
      ...result,
    },
  });
});

//shippingHistory mcurrrentShipment
const shippingHistory = catchAsync(async (req, res) => {
  const status = [{ status: "Delivered" }];

  const result = await findShipments(req, status);
  return res.status(httpStatus.OK).json({
    status: "OK",
    statusCode: httpStatus.OK,
    message: "Shipment history fetched successfully.",
    data: {
      type: "Shipment",
      ...result,
    },
  });
});

module.exports = { pendingShipment, currrentShipment, shippingHistory };
