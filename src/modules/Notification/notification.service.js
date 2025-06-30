const Notification = require('./notification.model');

const addNotification = async (notificationBody) => {
  const notification = new Notification(notificationBody);
  return notification.save();
}

const addMultipleNofiications = async (data) => {
  return await Notification.insertMany(data);
}

const getNotificationById = async (id) => {
  return await Notification.findById(id);
}

const getNotifications = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const notificationList = await Notification.find({ ...filter }).skip(skip).limit(limit).sort({ createdAt: -1 });
  const totalResults = await Notification.countDocuments({ ...filter });
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { totalResults, totalPages, currentPage: page, limit };
  return { notificationList, pagination };
}

module.exports = {
  addNotification,
  addMultipleNofiications,
  getNotificationById,
  getNotifications
}
