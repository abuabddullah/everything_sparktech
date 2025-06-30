const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const {
  addSubscription,
  updateSubscriptionById,
  getSubscriptionList,
  getSubscriptionForDriver,
  getSubscriptionForUser,
  deleteSubscriptionById
} = require("./subscription.service");

const addNewSubscription = catchAsync(async (req, res) => {
  if (req.User.role !== "admin") {
    return res.status(403).json(
      response({
        statusCode: "401",
        message: req.t("unauthorized"),
        status: "ERROR",
      })
    );
  }
  const newSubscription = await addSubscription(req.body);
  return res.status(201).json(
    response({
      statusCode: "201",
      message: req.t("Subscription created successfull"),
      data: newSubscription,
      status: "OK",
    })
  );
});

const updateSubscription = catchAsync(async (req, res) => {
  if (req.User.role !== "admin") {
    return res.status(403).json(
      response({
        statusCode: "401",
        message: req.t("unauthorized"),
        status: "ERROR",
      })
    );
  }

  const { subId } = req.params;
  const { id, ...rest } = req.body;
  const newSubscription = await updateSubscriptionById(subId, rest);

  console.log({newSubscription})

  return res.status(200).json(
    response({
      statusCode: "200",
      message: req.t("Subscription updated successfull"),
      data: newSubscription,
      status: "OK",
    })
  )
});

const getAllSubscription = catchAsync(async (req, res) => {
  const subsList = await getSubscriptionList();
  return res.status(200).json(
    response({
      statusCode: "200",
      message: req.t("subscription-fetched"),
      data: subsList,
      status: "OK",
    })
  );
});

const getSubscriptionForUserController = catchAsync(async (req, res) => {
  const subsList = await getSubscriptionForUser();

  return res.status(200).json(
    response({
      statusCode: "200",
      message: req.t("subscription-fetched"),
      data: subsList,
      status: "OK",
    })
  );
});

const getSubscriptionForDriverController = catchAsync(async (req, res) => {
  const subsList = await getSubscriptionForDriver();
  return res.status(200).json(
    response({
      statusCode: "200",
      message: req.t("Subscription fetched successfully of driver..."),
      data: subsList,
      status: "OK",
    })
  );
});

const deleteSubscription = catchAsync(async (req, res) => {
  if (req.User.role !== "admin") {
    return res.status(403).json(
      response({
        statusCode: "401",
        message: req.t("unauthorized"),
        status: "ERROR",
      })
    );
  }
  
  const {subId} = req.params;
  const deletedSubscription = await deleteSubscriptionById(subId);
  return res.status(200).json(
    response({
      statusCode: "200",
      message: req.t("Subscription deleted successfully"),
      data: deletedSubscription,
      status: "OK",
    })
  );
});

module.exports = {
  addNewSubscription,
  updateSubscription,
  getAllSubscription,
  getSubscriptionForUserController,
  getSubscriptionForDriverController,
  deleteSubscription
};