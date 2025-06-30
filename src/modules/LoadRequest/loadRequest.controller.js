const httpStatus = require('http-status');
const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { getLoadById } = require('../Load/load.service');
const { getUserById } = require('../User/user.service');
const { findLoadRequests, createLoadReq, deleteOtherLoadReq, findSpecificloadRequest } = require('./loadRequest.service');


// Request for Load
const requestForLoad = catchAsync(async (req, res) => {
  const { _id, role } = req.User;
  var { driver, load, truck } = req.body;
  let loadIds = [];
  if (Array.isArray(req.body)) {
    loadIds = req.body.map((item) => item.load);
  } else if (load) {
    loadIds = [load];
  }

  // Validate load IDs
  const validLoadIds = await Promise.all(
    loadIds.map(async (id) => {
      const load = await getLoadById(id);
      if (!load) {
        throw new Error(`Load ID ${id} not valid`);
      }
      return id;
    })
  ).catch((error) => {
    return res.status(httpStatus.NOT_FOUND).json(
      response({ status: 'Not Found', statusCode: httpStatus.NOT_FOUND, type: 'load', message: error.message })
    );
  });


  // Prepare data for insertion
  let data = Array.isArray(req.body) ? req.body.filter((item) => validLoadIds.includes(item.load)).map((item) => ({
    load: item.load,
    truck: role === 'driver' ? item.truck : undefined,
    driver: role === 'user' ? item.driver : _id,
    status: 'Pending',
    user: req.User._id,
    sender: _id
  })) : {
    load,
    status: 'Pending',
    user: req.User._id,
    truck: role === 'driver' ? truck : undefined,
    driver: role === 'user' ? driver : _id,
    sender: _id
  };

  if (role === 'user') {
    try {
      await Promise.all(
        req.body.map(async (item) => {
          const driverData = await getUserById(item.driver);
          if (!driverData) {
            throw new Error(`No user found with this driver ID: ${item.driver}`);
          }
        })
      );
    } catch (error) {
      return res.status(httpStatus.NOT_FOUND).json(
        response({ status: 'Not Found', statusCode: httpStatus.NOT_FOUND, type: 'user', message: error.message })
      );
    }
  }

  const loadreq = await createLoadReq(data);
  return res.status(httpStatus.CREATED).json(response({ message: "New Load Request Created Successfully", status: "Created", statusCode: httpStatus.CREATED, data: loadreq }));
});

// Load Requests created by me with pagination
const loadRequestHandler = catchAsync(async (req, res) => {
  const isMyRequests = req.query.myRequests !== 'false';//by default MyLoad Requests
  const query = {
    status: 'Pending',
    sender: isMyRequests ? req.User._id : { $ne: req.User._id }
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
  if (!loadRequests || loadRequests.length === 0) {
    return res.status(httpStatus.NOT_FOUND).json(response({ status: 'Not-found', statusCode: httpStatus.NOT_FOUND, type: 'load Request', message: "No load requests found for you." }));
  }
  return res.status(httpStatus.OK).json(response({ status: 'OK', statusCode: httpStatus.OK, type: 'load Request', message: "Load requests fetched successfully.", data: { loadRequests, pagination } }));
});

// Accept/Reject/Deliver Load Request
const requestActionHandler = catchAsync(async (req, res) => {
  const { loadReqId, action } = req.body;
  const query = {
    _id: loadReqId,
    status: action === 'delivered' ? 'Accepted' : 'Pending'
  };
  const loadReq = await findSpecificloadRequest(query);
  console.log("Load Request:", loadReq);
  if (!loadReq || loadReq.length === 0) {
    return res.status(httpStatus.NOT_FOUND).json(response({ status: 'Fail', statusCode: httpStatus.NOT_FOUND, type: 'load Request', message: "no load request found" }));
  }

  if (action === 'accept') {
    var filter = { _id: loadReq.load };
    const load = await getLoadById(filter);
    load.driver = loadReq.driver;
    await load.save();
    loadReq.status = 'Accepted';
    await loadReq.save();
    var searchData = {
      driver: { $ne: load.driver },
      load: loadReq.load
    }
    console.log("Search Data:", searchData);
    await deleteOtherLoadReq(searchData);
  } else if (action === 'reject') {
    loadReq.status = 'Rejected';
    await loadReq.save();
  } else if (action === 'delivered') {
    loadReq.status = 'Delivered';
    await loadReq.save();
  }
  return res.status(200).json(response({ status: 'Ok', statusCode: '200', type: 'load', message: `load request ${action} successfully` }));
})



module.exports = {
  loadRequestHandler,
  requestActionHandler,
  requestForLoad
}