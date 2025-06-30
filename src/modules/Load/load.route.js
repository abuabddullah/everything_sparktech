const express = require("express");
const {
  addNewLoadDetails,
  loadDetails,
  usersAllLoad,
  nearestLoads,
  findByBolNumber,
  findNearestDriver,
  pendingShipment,
  findNearestDriverForUser,
  findLoadBySourceDestination,
  addLoadWithXlxs,
  practice,
  findDriverByRecentDriverLocation,
  updateLoadDetails,
  deletePendingLoad,
} = require("./load.controller");
const { memoryStorage } = require("multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { isValidUser } = require("../../middlewares/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../../public/uploads");

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/", isValidUser, addNewLoadDetails);
router.post(
  "/load_add_with_xlxs",
  upload.single("xlxs"),
  isValidUser,
  addLoadWithXlxs
);

router.get("/", isValidUser, usersAllLoad);
router.get("/find_by_billOfLading", isValidUser, findByBolNumber);
router.get("/pending_shipment", isValidUser, pendingShipment);
router.get("/get_nearest_driver", isValidUser, findNearestDriver);

router.get(
  "/find_driver_by_recent_driver_location",
  isValidUser,
  findDriverByRecentDriverLocation
);

router.post("/nearest_driver_for_user", isValidUser, findNearestDriverForUser);
router.post("/nearest_loads", isValidUser, nearestLoads);
router.post(
  "/find_load_by_source_destination",
  isValidUser,
  findLoadBySourceDestination
);

router.get("/:id", isValidUser, loadDetails);
router.patch("/update_load/:loadId", isValidUser, updateLoadDetails);
router.delete("/delete_pending_load/:loadId", isValidUser, deletePendingLoad);

module.exports = router;
