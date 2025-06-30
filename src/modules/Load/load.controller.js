const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { getLoad, addManyLoadDetails } = require('./load.service');

const addNewLoadDetails = catchAsync(async (req, res) => {
  const data = JSON.parse(req.body.data || '[]');
  data.user = req.User._id;
  const userId = req.User._id; 
    const enrichedData = data.map((item) => ({
      ...item,
      user: userId,
    }));
  if (data.length === 0) {
    return res.status(400).json(response({ status: 'Error', statusCode: '400', type: 'load-details', message: req.t('load-details-required') }));
  }
  const loadDetails = await addManyLoadDetails(enrichedData);
  return res.status(201).json(response({ status: 'OK', statusCode: '201', type: 'load-details', message: req.t('load-details-added'), data: loadDetails }));
});

//load Details
const loadDetails = catchAsync(async (req, res) => {
  const filter = { _id: req.params.id };
  const find = 'trailerType productType palletSpace shipperEmail shipperPhoneNumber shippingAddress receiverPhoneNumber receiverEmail receivingAddress';
  const data = await getLoad(filter, find, 'image');
  return res.status(200).json(response({ status: 'OK', statusCode: '200', type: 'load', message: "Load fetched successfully", data: data }));
});


module.exports = { addNewLoadDetails, loadDetails }