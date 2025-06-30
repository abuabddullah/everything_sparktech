const httpStatus = require("http-status");
const ApiError = require("../../helpers/ApiError");
const Equipment = require("./equipment.model");
const Truck = require("../TruckDetails/truckDetails.model");
const User = require("../User/user.model");
const { equipmentUtils } = require("./equipment.utils");
const { default: mongoose } = require("mongoose");

const addManyEquipmentDetails = async (truckDetails) => {
  const truckNumbers = truckDetails.map((truck) => truck.truckNumber);

  if (truckDetails[0]?.truckNumber) {
    const existingTruck = await Equipment.findOne({
      truckNumber: truckDetails[0]?.truckNumber,
    });

    if (existingTruck) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `The following truck already exists with this truck number`
      );
    }
  }

  if (truckDetails[0]?.cdlNumber) {
    const existingTruck = await Equipment.findOne({
      cdlNumber: truckDetails[0]?.cdlNumber,
    });

    if (existingTruck) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `The following truck already exists with this cdl number`
      );
    }
  }

  const existingTrucks = await getEquipment({
    truckNumber: { $in: truckNumbers },
  });
  if (existingTrucks.length > 0) {
    existingTrucks.map((truck) => truck.truckNumber).join(", ");
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `The following trucks already exist`
    );
  }
  return await Equipment.insertMany(truckDetails);
};

const getEquipment = async (query) => {
  const driver = query.driver;

  const data = await Equipment.find({
    driver: driver,
  });

  const truck = data.filter((item) => item.type === "truck");
  const trailer = data.filter((item) => item.type === "trailer");
  return { truck, trailer };
};

const addTruckDetailsService = async (user, payload) => {
  const { truckId, trailerId } = payload;

  const result = await equipmentUtils(truckId, trailerId, user);

  return result;
};

const deleteEquipmentService = async (req) => {
  const user = req.User;
  const { equipmentId } = req.body;

  const findEquipment = await Equipment.findOne({ _id: equipmentId });

  if (!findEquipment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Equipment not found");
  }
  console.log(findEquipment.driver);

  if (user._id.toString() !== findEquipment.driver.toString()) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to perform this action"
    );
  }

  const result = await Equipment.findOneAndDelete(
    { _id: equipmentId },
    {
      new: true,
    }
  );
  return result;
};

const updateEquipmentService = async (equipmentId, payload) => {
  const findEquipment = await Equipment.findOne({
    _id: equipmentId,
  });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const updateEquipment = await Equipment.findByIdAndUpdate(
      equipmentId,
      { ...payload },
      { new: true, session }
    );

    if (!updateEquipment) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Equipment not updated");
    }

    const truckUpdateData = {
      truckNumber: payload.truckNumber || findEquipment.truckNumber,
      cdlNumber: payload.cdlNumber || findEquipment.cdlNumber,
    };

    const updateTruck = await Truck.findOneAndUpdate(
      {
        cdlNumber: findEquipment.cdlNumber,
      },
      truckUpdateData,
      { new: true, session }
    );

    if (!updateTruck) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Equipment not updated");
    }

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

module.exports = {
  addManyEquipmentDetails,
  getEquipment,
  addTruckDetailsService,
  deleteEquipmentService,
  updateEquipmentService,
};
