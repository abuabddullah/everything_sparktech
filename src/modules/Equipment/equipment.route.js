const express = require("express");
const router = express.Router();

const { isValidUser } = require("../../middlewares/auth");
const {
  addNewEquipment,
  myEquipment,
  addTruckDetails,
  deleteEquipment,
  updateEquipment,
} = require("./equipment.controller");

router.get("/", isValidUser, myEquipment);
router.post("/", isValidUser, addNewEquipment);
router.post("/add_truck_details", isValidUser, addTruckDetails);
router.delete("/delete_equipment", isValidUser, deleteEquipment);
router.patch("/:equipmentId", isValidUser, updateEquipment)

module.exports = router;
