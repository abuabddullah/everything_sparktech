const response = require("../../helpers/response");
const { addStaticContent, getStaticContent } = require('./staticContent.service');
const catchAsync = require('../../helpers/catchAsync');

const upgradeStaticContent = catchAsync(async (req, res) => {
  if (req.User.role !== 'admin') {
    return res.status(400).json(response({ status: 'Error', statusCode: '400', type: 'staticContent', message: req.t('unauthorised') }));
  }
  const staticContent = await addStaticContent(req.body);
  return res.status(201).json(response({ status: 'Success', statusCode: '201', type: 'staticContent', message: req.t('staticContent-added'), data: staticContent }));
})

const getAllStaticContent = catchAsync(async (req, res) => {
  const type = req.query.type || 'privacy-policy';
  const staticContents = await getStaticContent(type);
  return res.status(200).json(response({ status: 'Success', statusCode: '200', message: req.t('staticContents'), data: staticContents }));
})

module.exports = { upgradeStaticContent, getAllStaticContent }