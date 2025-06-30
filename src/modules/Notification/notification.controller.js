const response = require("../../helpers/response");
const {
  getNotifications,
  makeUnread,
  getNotificationDetailsService,
  getAllMyNotificationsService,
  addNotification,
} = require("./notification.service");
const catchAsync = require("../../helpers/catchAsync");
const httpStatus = require("http-status");

const getAllNotifications = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const options = {
    page,
    limit,
  };

  const { notificationList, pagination } = await getNotifications(
    req.User,
    options
  );
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      message: req.t("notification-list"),
      data: { notificationList, pagination },
    })
  );
});

const getAllMyNotifications = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const options = {
    page,
    limit,
  };

  const { notificationList, pagination } = await getAllMyNotificationsService(
    req.User,
    options
  );
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      message: req.t("notification-list"),
      data: { notificationList, pagination },
    })
  );
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  const updatedNotification = await makeUnread(id);

  if (!updatedNotification) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Notification not found.",
      status: "Not Found",
      statusCode: httpStatus.NOT_FOUND,
    });
  }

  return res.status(httpStatus.OK).json({
    message: "Notification marked as read.",
    data: updatedNotification,
  });
});

const getNotificationDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const notification = await getNotificationDetailsService(id);
  if (!notification) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Notification not found.",
      status: "Not Found",
      statusCode: httpStatus.NOT_FOUND,
    });
  }
  return res.status(httpStatus.OK).json({
    message: "Notification details fetched successfully.",
    data: notification,
  });
});

const createNotification = catchAsync(async (req, res) => {
  // const notificationData = {
  //   message: `has been confirmed your delivery`,
  //   type: "load-request",
  //   role: req.User.role,
  //   linkId: req.User._id,
  //   sender: req.User._id,
  //   receiver: req.User._id,
  //   // sender: role === "user" ? loadReq.sender : loadReq.driver,
  //   // receiver: role === "user" ? loadReq.driver : loadReq.sender,
  // };
  // const notification = await addNotification(notificationData);
  // if (!notification) {
  //   return res.status(httpStatus.NOT_FOUND).json({
  //     message: "Notification not found.",
  //     status: "Not Found",
  //     statusCode: httpStatus.NOT_FOUND,
  //   });
  // }
  // return res.status(httpStatus.OK).json({
  //   message: "Notification added successfully.",
  //   data: notification,
  // });
});
module.exports = {
  getAllNotifications,
  markNotificationAsRead,
  getNotificationDetails,
  getAllMyNotifications,
  createNotification,
};
