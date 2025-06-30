const httpStatus = require('http-status');
const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { findLoadRequests } = require('../LoadRequest/loadRequest.service');


const pendingShipment = catchAsync(async (req, res) => {
  const query = {
    status: 'Pending',
    user: req.User._id
  };
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  };
  const populateOptions = {
    drivermodelfields: 'fullName email phoneNumber address image',
    loadmodelfields: 'loadType palletSpace Hazmat shippingAddress shipperPhoneNumber shipperEmail receivingAddress receiverEmail receiverPhoneNumber',
    truckmodelfields: 'truckNumber trailerSize',
    populateDriver: true,
    populateLoad: true,
    populateTruck: true
  };

  const { results: loadRequests, pagination } = await findLoadRequests(query, populateOptions, options);
  return res.status(httpStatus.OK).json(response({ status: 'OK', statusCode: httpStatus.OK, type: 'load Request', message: "Load requests fetched successfully.", data: { loadRequests, pagination } }));
});


const currrentShipment = catchAsync(async (req, res) => {
  const query = {
    status: 'Accepted',
    user: req.User._id
  };
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  };
  const populateOptions = {
    drivermodelfields: 'fullName email phoneNumber address image',
    loadmodelfields: 'loadType palletSpace Hazmat shippingAddress shipperPhoneNumber shipperEmail receivingAddress receiverEmail receiverPhoneNumber',
    truckmodelfields: 'truckNumber trailerSize',
    populateDriver: true,
    populateLoad: true,
    populateTruck: true
  };

  const { results: loadRequests, pagination } = await findLoadRequests(query, populateOptions, options);
  return res.status(httpStatus.OK).json(response({ status: 'OK', statusCode: httpStatus.OK, type: 'load Request', message: "Load requests fetched successfully.", data: { loadRequests, pagination } }));
});


const shippingHistory = catchAsync(async (req, res) => {
  const query = {
    status: 'Delivered',
    user: req.User._id
  };
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  };
  const populateOptions = {
    drivermodelfields: 'fullName email phoneNumber address image',
    loadmodelfields: 'loadType palletSpace Hazmat shippingAddress shipperPhoneNumber shipperEmail receivingAddress receiverEmail receiverPhoneNumber',
    truckmodelfields: 'truckNumber trailerSize',
    populateDriver: true,
    populateLoad: true,
    populateTruck: true
  };

  const { results: loadRequests, pagination } = await findLoadRequests(query, populateOptions, options);
  return res.status(httpStatus.OK).json(response({ status: 'OK', statusCode: httpStatus.OK, type: 'load Request', message: "Load requests fetched successfully.", data: { loadRequests, pagination } }));
});

module.exports = { pendingShipment, currrentShipment, shippingHistory };