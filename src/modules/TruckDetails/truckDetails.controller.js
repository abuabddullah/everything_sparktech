const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { addManyTruckDetails, getTransport } = require('./truckDetails.service');

const addNewTruckDetails = catchAsync(async (req, res) => {
  const data = JSON.parse(req.body.data || '[]');
  const driver = req.User._id;
  if (data.length === 0) {
    return res.status(400).json(response({ status: 'Error', statusCode: '400', type: 'truck-details', message: req.t('truck-details-required') }));
  }
  // Add `driver` field to each truck detail
  const truckData = data.map((detail) => ({...detail,driver,}));
  const truckDetails = await addManyTruckDetails(truckData);
  return res.status(201).json(response({ status: 'OK', statusCode: '201', type: 'truck-details', message: req.t('truck-details-added'), data: truckDetails }));
});


const myEquipment = catchAsync(async (req, res) => {
  const driver = req.User._id;
  const truckDetails = await getTransport({driver});
  return res.status(201).json(response({ status: 'OK', statusCode: '201', type: 'truck-details', message: req.t('truck-details-added'), data: truckDetails }));
});



module.exports = { addNewTruckDetails, myEquipment }