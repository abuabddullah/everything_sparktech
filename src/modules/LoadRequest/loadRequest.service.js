const LoadRequest = require('./loadRequest.model');

// Create Load Request
const createLoadReq = async (data) => {
  if (Array.isArray(data)) {
    return await LoadRequest.insertMany(data);
  }
  const loadRequest = new LoadRequest(data);
  return await loadRequest.save();
};



const findSpecificloadRequest = async (query) => {
  return await LoadRequest.findOne(query);
};



// Find Load Requests using specific query with pagination
const findLoadRequests = async (query, populateOptions, options) => {
  const { drivermodelfields, loadmodelfields, truckmodelfields, populateDriver, populateLoad, populateTruck } = populateOptions;
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // Build query
  let queryBuilder = LoadRequest.find(query).skip(skip).limit(limit);
  
  // Populate fields conditionally
  if (populateDriver && drivermodelfields) queryBuilder = queryBuilder.populate('driver', drivermodelfields);
  if (populateLoad && loadmodelfields) queryBuilder = queryBuilder.populate('load', loadmodelfields);
  if (populateTruck && truckmodelfields) queryBuilder = queryBuilder.populate('truck', truckmodelfields);

  // Execute query
  const results = await queryBuilder.exec();

  const totalResults = await LoadRequest.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = {
      totalResults,
      totalPages,
      currentPage: page,
      limit
  };

  return { results, pagination };
};


const deleteOtherLoadReq = async (searchData) => {
  return await LoadRequest.deleteMany(searchData);
};


module.exports = {
  //addManyLoadRequests,
  findLoadRequests,
  createLoadReq,
  deleteOtherLoadReq,
  findSpecificloadRequest
}
