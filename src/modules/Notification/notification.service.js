const { default: mongoose } = require("mongoose");
const Notification = require("./notification.model");
const Load = require("../Load/load.model");
const User = require("../User/user.model");
const { getMessaging } = require("firebase-admin/messaging");
const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("../../../googleFirebaseAdmin.json"); // Adjust the path accordingly
const { sendMailToWebUser } = require("./notificationUtils");
const ApiError = require("../../helpers/ApiError");
const admin = require("firebase-admin");
const Receiver = require("../Receiver/receiver.model");
// Initialize Firebase Admin SDK with a service account key
// initializeApp({
//   credential: cert(serviceAccount),
// });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const addNotification = async (notificationBody, req, res) => {
  let sentTo = "";
  let receiverName = "";
  const findUser = await User.findOne({
    _id: notificationBody.receiver,
  });

  if (findUser) {
    sentTo = findUser.email;
    receiverName = findUser.fullName;
  }

  if (!findUser) {
    const receiverId = await Receiver.findOne({
      _id: notificationBody.receiver,
    });
    sentTo = receiverId.email;
    receiverName = receiverId.name;
  }

  if (findUser && findUser.fcmToken && findUser.fcmToken.trim() !== "") {
    const receivedToken = findUser.fcmToken;

    const message = {
      notification: {
        title: notificationBody.message,
        body: notificationBody.message,
      },
      token: receivedToken,
    };

    getMessaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
        console.log(response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  }

  const notification = new Notification(notificationBody);
  const emailBody = {
    subject: notificationBody.message,
    // sentTo: findUser.email,
    sentTo,
    description: notificationBody.message,
    // receiverName: findUser.fullName,
    receiverName,
    receiverType: "email",
  };
  await sendMailToWebUser(emailBody);
  return notification.save();
};

const addMultipleNofiications = async (data) => {
  return await Notification.insertMany(data);
};

const getNotificationById = async (id) => {
  return await Notification.findById(id);
};

const makeUnread = async (id) => {
  return await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
};

const getNotifications = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const notificationList = await Notification.find({ ...filter })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const totalResults = await Notification.countDocuments({ ...filter });
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { totalResults, totalPages, currentPage: page, limit };
  return { notificationList, pagination };
};

const getNotificationDetailsService = async (id) => {
  const findLoad = await Notification.findById(id).select("linkId type");
  const type = {
    loadRequest: "load-request",
    feedback: "feedback",
    load: "load",
    nearByLoad: "nearby-load",
    admin: "admin",
  };

  const data = await Notification.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(String(id)),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },

    {
      $unwind: "$sender",
    },

    {
      $lookup: {
        from: "users",
        localField: "receiver",
        foreignField: "_id",
        as: "receiver",
      },
    },

    {
      $unwind: "$receiver",
    },

    // {
    //   $lookup: {
    //     // from: type.loadRequest ? "loadrequests" :
    //     //   type.feedback ? "feedbacks" :
    //     //     type.load ? "loads" :
    //     //       type.nearByLoad ? "nearbyloads" : "loadrequests",
    //     // // type.admin ? "admin" : "loadrequests",
    //     from: "load",
    //     localField: 'linkId',
    //     foreignField: '_id',
    //     as: 'linkedData'
    //   }
    // },

    // {
    //   $unwind: "$linkedData"
    // },

    {
      $project: {
        sender: "$sender",
        receiver: "$receiver",
      },
    },
  ]);

  const result = await Load.findOne({
    _id: new mongoose.Types.ObjectId(String(findLoad.linkId)),
  });

  // const
  return result;
};

const getAllMyNotificationsService = async (user, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // Define mapping of type to Mongoose models
  const typeToModelMap = {
    "load-request": "LoadRequest",
    "technical-issue": "LoadRequest",
    load: "Load",
    "nearby-load": "Load", // Both 'load' and 'nearby-load' use the same model
    feedback: "Feedback",
    admin: "User",
    message: "Message",
  };

  // Fetch notifications
  const notifications = await Notification.find({
    receiver: new mongoose.Types.ObjectId(String(user._id)),
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("sender", "fullName email phoneNumber image role ");

  // Enrich notifications with linked data
  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification) => {
      const modelName = typeToModelMap[notification.type];
      if (!modelName) {
        // If no associated model (e.g., 'feedback'), return notification as is
        return { ...notification.toObject(), linkedData: null };
      }

      // Dynamically fetch the model based on the type
      const Model = mongoose.model(modelName);

      // Retrieve linked data using `linkId`
      const linkedData = await Model.findById(notification.linkId);
      return { ...notification.toObject(), linkedData };
    })
  );

  // Count total results for pagination
  const totalResults = await Notification.countDocuments({
    receiver: user._id,
  });
  const totalPages = Math.ceil(totalResults / limit);

  return {
    notificationList: enrichedNotifications,
    pagination: { totalResults, totalPages, currentPage: page, limit },
  };
};

module.exports = {
  addNotification,
  addMultipleNofiications,
  getNotificationById,
  getNotifications,
  makeUnread,
  getNotificationDetailsService,
  getAllMyNotificationsService,
};
