const express = require("express");
const {
  requestForLoad,
  requestActionHandler,
  loadRequestHandler,
  loadRequestDetails,
  reassign,
  technicalIssue,
} = require("./loadRequest.controller");
const router = express.Router();

const { isValidUser } = require("../../middlewares/auth");

router.post("/", isValidUser, requestForLoad);
router.post("/technical_issue", isValidUser, technicalIssue);
router.post("/:reqId", isValidUser, reassign);
router.get("/", isValidUser, loadRequestHandler);
router.get("/:id", isValidUser, loadRequestDetails);

router.patch("/action", isValidUser, requestActionHandler);
module.exports = router;
