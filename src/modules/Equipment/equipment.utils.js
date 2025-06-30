const Equipment = require("./equipment.model");
const Truck = require("../TruckDetails/truckDetails.model");
const User = require("../User/user.model");

const equipmentUtils = async (truckId, trailerId, user) => {
  const [truck, trailer] = await Promise.all([
    Equipment.findOne({ _id: truckId, driver: user._id }),
    Equipment.findOne({
      _id: trailerId,
      driver: user._id,
      trailerSize: { $gt: 0 },
      palletSpace: { $gt: 0 },
    }),
  ]);

  if (!truck || !trailer) {
    return { findTruck: null }; // Return early if no truck or trailer is found
  }

  // Define truck data
  const truckData = {
    driver: user._id,
    cdlNumber: truck.cdlNumber,
    truckNumber: truck.truckNumber,
    trailerSize: trailer.trailerSize,
    palletSpace: trailer.palletSpace,
    availablePalletSpace: trailer.palletSpace,
    weight: trailer.weight,
  };

  // Use upsert to avoid checking if the truck exists
  const truckUpdatedResult = await Truck.findOneAndUpdate(
    {
      driver: user._id,
      cdlNumber: truck.cdlNumber,
      truckNumber: truck.truckNumber,
    },
    { $set: truckData },
    { new: true, upsert: true } // Creates the truck if not found
  );

  const userData = await User.findById(user._id);

  return { findTruck: truckUpdatedResult, result: userData };
};

module.exports = { equipmentUtils };
