const httpStatus = require("http-status");
const {
  addManyEquipmentDetails,
  getEquipment,
  addTruckDetailsService,
  deleteEquipmentService,
  updateEquipmentService,
} = require("./equipment.service");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");

const addNewEquipment = catchAsync(async (req, res) => {
  const data = req.body;
  const driver = req.User._id;
  if (req.User.role == "driver") {
    const truckData = data.map((detail) => ({ ...detail, driver }));
    const truckDetails = await addManyEquipmentDetails(truckData);
    return res.status(201).json(
      response({
        status: "OK",
        statusCode: "201",
        type: "Equipments",
        message: req.t("Equipments-added"),
        data: truckDetails,
      })
    );
  } else {
    return res.status(httpStatus.UNAUTHORIZED).json(
      response({
        status: "UNAUTHORIZED",
        statusCode: httpStatus.UNAUTHORIZED,
        type: "Equipments",
        message: req.t("plese log in as a driver"),
      })
    );
  }
});

const myEquipment = catchAsync(async (req, res) => {
  const driver = req.User._id;
  const type = req.query.type;
  const query = { driver, type };

  const equipment = await getEquipment(query);

  return res.status(200).json(
    response({
      status: "OK",
      statusCode: "200",
      type: "truck-details",
      message: req.t("fetched"),
      data: equipment,
    })
  );
});

const addTruckDetails = catchAsync(async (req, res) => {
  const data = req.body;
  if (req.User.role == "driver") {
    const truckDetails = await addTruckDetailsService(req.User, data);

    return res.status(201).json(
      response({
        status: "OK",
        statusCode: "201",
        type: "Equipments",
        message: req.t("Equipments-added"),
        data: truckDetails,
      })
    );
  } else {
    return res.status(httpStatus.UNAUTHORIZED).json(
      response({
        status: "UNAUTHORIZED",
        statusCode: httpStatus.UNAUTHORIZED,
        type: "Equipments",
        message: req.t("please log in as a driver"),
      })
    );
  }
});

const deleteEquipment = catchAsync(async (req, res) => {
  const equipment = await deleteEquipmentService(req);
  if (equipment) {
    return res.status(200).json(
      response({
        status: "OK",
        statusCode: httpStatus.OK,
        type: "truck-details",
        message: req.t("deleted successfully"),
        data: equipment,
      })
    );
  } else {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        status: "NOT_FOUND",
        statusCode: httpStatus.NOT_FOUND,
        type: "truck-details",
        message: req.t("not-found"),
      })
    );
  }
});

const updateEquipment = catchAsync(async (req, res) => {
  const equipment = await updateEquipmentService(req.params.equipmentId, req.body);
  return res.status(200).json(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      type: "truck-details",
      message: req.t("Equipment update successfully"),
      data: equipment,
    })
  );
});

module.exports = {
  addNewEquipment,
  myEquipment,
  addTruckDetails,
  deleteEquipment,
  updateEquipment,
};
