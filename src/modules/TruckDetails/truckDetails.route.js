const express = require("express");
const {
  addNewTruckDetails,
  myEquipment,
  deleteTruck,
  availableTruck,
} = require("./truckDetails.controller");
const router = express.Router();

const { isValidUser } = require("../../middlewares/auth");

//router.get('/', isValidUser, myEquipment);
router.get("/available_truck", isValidUser, availableTruck);
// router.post('/', isValidUser, addNewTruckDetails);
router.post("/", isValidUser, addNewTruckDetails);
router.delete("/:id", deleteTruck);

module.exports = router;
