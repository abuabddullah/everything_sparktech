const TruckDetail = require('./truckDetails.model');

const addManyTruckDetails = async (truckDetails) => {
  return await TruckDetail.insertMany(truckDetails);
}


const getTransport = async (truckDetails) => {
  return await TruckDetail.find(truckDetails);
}

module.exports = {
  addManyTruckDetails,
  getTransport
}
