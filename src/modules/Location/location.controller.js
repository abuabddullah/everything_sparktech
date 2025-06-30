const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { addManyLoadRequests } = require('./location.service');

const addNewLoadRequests = catchAsync(async (req, res) => {
  const data = JSON.parse(req.body.data || '[]');
  if(data.length === 0) {
    return res.status(400).json(response({ status: 'Error', statusCode: '400', type: 'truck-details', message: req.t('truck-details-required') }));
  }
  const loadRequests = await addManyLoadRequests(data);
  return res.status(201).json(response({ status: 'OK', statusCode: '201', type: 'truck-details', message: req.t('truck-details-added'), data: loadRequests }));
});

module.exports = { addNewLoadRequests }