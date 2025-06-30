const LoadRequest = require("./location.model");

const addManyLoadRequests = async (loadRequests) => {
  return await LoadRequest.insertMany(loadRequests);
};

module.exports = {
  addManyLoadRequests,
};
