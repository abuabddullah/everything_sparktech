const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { getLoadById } = require("../Load/load.service");
const { getUserById } = require("../User/user.service");
const {
  findLoadRequests,
  createLoadReq,
  deleteOtherLoadReq,
  findSpecificloadRequest,
  processLoadRequests,
  findSpecificLoadRequestByLoadId,
} = require("./loadRequest.service");
const { addNotification } = require("../Notification/notification.service");
const loadRequest = require("./loadRequest.model");
const Load = require("../Load/load.model");
const { default: mongoose } = require("mongoose");
const User = require("../User/user.model");
const generateUniqeId = require("../../helpers/generateUniqeId");
const {
  deductSubscriptionBalance,
} = require("../MySubscription/mySubscription.controller");
const ApiError = require("../../helpers/ApiError");
const httpStatus = require("http-status");
const Chat = require("../Chat/chat.model");
const TruckDetails = require("../TruckDetails/truckDetails.model");
const LoadRequest = require("./loadRequest.model");
const { sendMailToReceiver, baseUrl } = require("./loadRequestUtils");
const jwt = require("jsonwebtoken");

//assign load
const requestForLoad = catchAsync(async (req, res) => {
  try {
    // Check for duplicates in the database
    if (req.User.role === "user") {
      for (const item of req.body) {
        const existingRequest = await findSpecificloadRequest({
          load: item.load,
          sender: req.User._id,
        });

        if (existingRequest) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Load request for load ID ${item.load} by sender already exists.`
          );
        }
      }
    }

    const loadRequests = await processLoadRequests(
      req?.User,
      req.body,
      req.User.role
    );
    return res.status(httpStatus.CREATED).json(
      response({
        message: "New Load Request Created Successfully",
        status: "Created",
        statusCode: httpStatus.CREATED,
        data: loadRequests,
      })
    );
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json(
      response({
        status: "Bad Request",
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message,
      })
    );
  }
});

//reassign driver controller
// const reassign = catchAsync(async (req, res) => {
//   try {
//     const driver = await getUserById(req.body[0].driver);

//     if (!driver) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Driver not found");
//     }

//     // await deleteOtherLoadReq({ _id: req.params.reqId });
//     await LoadRequest.findOneAndDelete({ _id: req.params.reqId });

//     const loadRequests = await processLoadRequests(
//       req.User,
//       req.body,
//       req.User.role
//     );

//     return res.status(httpStatus.CREATED).json(
//       response({
//         message: "Reassigned Load Request Created Successfully",
//         status: "Created",
//         statusCode: httpStatus.CREATED,
//         data: loadRequests,
//       })
//     );
//   } catch (error) {
//     return res.status(httpStatus.BAD_REQUEST).json(
//       response({
//         status: "Bad Request",
//         statusCode: httpStatus.BAD_REQUEST,
//         message: error.message,
//       })
//     );
//   }
// });

const reassign = catchAsync(async (req, res) => {
  const session = await mongoose.startSession(); // Start a new session

  try {
    session.startTransaction(); // Start the transaction
    const driver = await getUserById(req.body[0].driver);

    if (!driver) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Driver not found");
    }

    // Delete the existing Load Request
    const deletedLoadRequest = await LoadRequest.findOneAndDelete({
      _id: req.params.reqId,
    }).session(session);

    // const deletedLoadRequest = await LoadRequest.findOneAndDelete(
    //   {
    //     _id: new mongoose.Types.ObjectId(String(req.params.reqId)),
    //   },
    //   { new: true }
    // ).session(session);

    console.log({ deletedLoadRequest }, "deletedLoadRequest");

    // if (deletedLoadRequest) {

    // }
    const loadRequests = await processLoadRequests(
      req.User,
      req.body,
      req.User.role,
      session // Pass session if needed inside `processLoadRequests`
    );

    // return

    // return

    // Process new Load Requests

    // Commit the transaction if everything succeeds
    await session.commitTransaction();
    session.endSession();

    return res.status(httpStatus.CREATED).json(
      response({
        message: "Reassigned Load Request Created Successfully",
        status: "Created",
        statusCode: httpStatus.CREATED,
        data: loadRequests,
      })
    );
  } catch (error) {
    await session.abortTransaction(); // Rollback on failure
    session.endSession();

    return res.status(httpStatus.BAD_REQUEST).json(
      response({
        status: "Bad Request",
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message,
      })
    );
  }
});

//by specific load request id controller
const loadRequestDetails = catchAsync(async (req, res) => {
  const loadId = req.params.id;

  const result = await findSpecificLoadRequestByLoadId(loadId, req);

  return res.status(httpStatus.OK).json(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      type: "load Request",
      message: "Load requests fetched successfully.",
      data: result,
    })
  );
});

//loadRequestHandler controller
const loadRequestHandler = catchAsync(async (req, res) => {
  const result = await findLoadRequests(req);
  return res.status(httpStatus.OK).json({
    status: "OK",
    statusCode: httpStatus.OK,
    message: "Load requests fetched successfully.",
    data: {
      type: "load Request",
      attributes: result.attributes,
    },
  });
});

// Accept/Reject/Deliver Load Request controller
const requestActionHandler = catchAsync(async (req, res) => {
  const { _id, role } = req.User;
  const { loadReqId, action } = req.body;

  console.log(action, "action");
  const allowedStatuses = [
    "Pending",
    "Accepted",
    "Picked",
    "Delivered",
    "Delivery-Pending",
  ];

  // Build the query dynamically
  const query = {
    _id: new mongoose.Types.ObjectId(String(loadReqId)),
    status: {
      $in: allowedStatuses.filter((status) =>
        action === "Delivered" ? status !== "Pending" : status !== "Rejected"
      ),
    },
  };

  const loadReq = await findSpecificloadRequest(query);
  var filter = { _id: loadReq.load };
  const load = await getLoadById(filter);

  console.log({ load });
  // let filter = {};
  // let load

  if (action === "accept") {
    if (action === "accept" && role === "driver") {
      if (loadReq.driver.toString() !== _id.toString()) {
        throw new Error("You are not authorized to perform this action");
      }
    }

    if (action === "accept" && role === "user") {
      if (loadReq.user.toString() !== _id.toString()) {
        throw new Error("You are not authorized to perform this action");
      }
    }

    const session = await mongoose.startSession(); // Start a session
    session.startTransaction(); // Start the transaction

    try {
      // Step 1: Update the load with driver information
      const load = await Load.findById(loadReq.load).session(session);

      if (!load) {
        throw new Error("Load not found");
      }
      load.driver = loadReq.driver;
      load.isAssigned = true;
      // Step 2: Update the load request status
      loadReq.status = "Accepted";

      // Step 3: Update the truck's available pallet space
      const findTruck = await TruckDetails.findById(loadReq.truck).session(
        session
      );
      if (!findTruck) {
        throw new Error("Truck not found");
      }

      if (findTruck.availablePalletSpace < load.palletSpace) {
        throw new Error("Truck does not have enough space to carry this load");
      }
      findTruck.availablePalletSpace -= load.palletSpace;
      //when driver accept load then create two chat for shipperToReceiver and shipperToDriver
      const newChatReceiver = new Chat({
        loadId: load._id,
        chatType: "shipper-receiver",
      });
      await newChatReceiver.save({ session });

      // Create the chat for shipper to driver
      const newChatDriver = new Chat({
        loadId: load._id,
        chatType: "shipper-driver",
      });
      await newChatDriver.save({ session });

      // Create the chat for driver to receiver
      const newChatDriverToReceiver = new Chat({
        loadId: load._id,
        chatType: "driver-receiver",
      });
      await newChatDriverToReceiver.save({ session });

      // Assign the chat IDs to the load object
      load.shipperToReceiverChatId = newChatReceiver._id;
      load.shipperToDriverChatId = newChatDriver._id;
      load.driverToReceiverChatId = newChatDriverToReceiver._id;

      // Step 4: Delete other load requests matching the search criteria
      const searchData = {
        driver: { $ne: load.driver },
        load: loadReq.load,
      };

      // Step 5: Add notification
      const notificationData = {
        message: "Your load request has been accepted",
        type: "load-request",
        role: role,
        linkId: loadReq._id,
        sender: role === "user" ? loadReq.user : loadReq.driver,
        receiver: role === "user" ? loadReq.driver : loadReq.user,
      };

      const tokenBody = {
        receiverEmail: load.receiverEmail,
        receiverName: load.receiverName,
        receiverAddress: load.receivingAddress,
        _id: load.receiverId,
      };
      const receiverToken = jwt.sign(tokenBody, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: "7d",
      });

      const emailBody = {
        name: load.shipperName,
        sentTo: load.receiverEmail,
        receiverType: "email",
        receiverName: load.receiverName,
        navigateTo: `https://ootms.com/receiver/${loadReqId}?token=${receiverToken}`,
      };

      await load.save({ session });
      await loadReq.save({ session });
      await findTruck.save({ session });
      await sendMailToReceiver(emailBody);
      await deleteOtherLoadReq(searchData, session);
      await addNotification(notificationData, session);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status("200").json(
        response({
          status: "Ok",
          statusCode: "200",
          type: "load",
          message: `load request ${action} successfully`,
        })
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } else if (action === "reject") {
    let findTruck = await TruckDetails.findOne({
      _id: new mongoose.Types.ObjectId(String(loadReq.truck)),
    });

    if (loadReq.status === "Accepted" || loadReq.status === "Picked") {
      findTruck.availablePalletSpace =
        findTruck.availablePalletSpace + load?.palletSpace;

      load.driver = "";
    }
    load.isAssigned = false;
    const notificationData = {
      message: "load request has been rejected",
      // type: "load-request",
      type: "load",
      role: role,
      linkId: loadReq.load,
      sender: role === "user" ? loadReq.user : loadReq.driver,
      receiver: role === "user" ? loadReq.driver : loadReq.user,
    };

    loadReq.status = "Rejected";
    await load.save();
    await loadReq.save();
    await addNotification(notificationData);
    await deleteOtherLoadReq(loadReq?._id);
    await findTruck.save();
  } else if (action === "picked" && role === "driver") {
    loadReq.status = "Picked";

    const notificationData = {
      message: "Your load request has been Picked",
      type: "load-request",
      role: role,
      linkId: loadReq._id,
      sender: loadReq.driver,
      receiver: loadReq.user,
      // sender: role === "user" ? loadReq.sender : loadReq.driver,
      // receiver: role === "user" ? loadReq.driver : loadReq.user,
    };
    await loadReq.save();
    await addNotification(notificationData);
  }

  if (action === "delivered" && role !== "driver") {
    throw new Error("You are not authorized to perform this action");
  } else if (action === "delivered" && role === "driver") {
    let findTruck = await TruckDetails.findOne({
      _id: new mongoose.Types.ObjectId(String(loadReq.truck)),
    });

    findTruck.availablePalletSpace =
      findTruck.availablePalletSpace + load?.palletSpace;

    loadReq.status = "Delivered";

    const notificationData = {
      message: "Your load has been delivered",
      type: "load-request",
      role: role,
      linkId: loadReq._id,
      sender: loadReq.driver,
      receiver: loadReq.user,
      // sender: role === "user" ? loadReq.sender : loadReq.driver,
      // receiver: role === "user" ? loadReq.driver : loadReq.sender,
    };

    await loadReq.save();
    await findTruck.save();
    await addNotification(notificationData);
  }
  //  else if (action === "confirm" && role === "user") {
  //   loadReq.status = "Delivered";
  //   await loadReq.save();

  //   const user = await getUserById(loadReq.sender);
  //   const notificationData = {
  //     message: `${user.fullName} has been confirmed your delivery`,
  //     type: "load-request",
  //     role: role,
  //     linkId: loadReq._id,
  //     sender: role === "user" ? loadReq.sender : loadReq.driver,
  //     receiver: role === "user" ? loadReq.driver : loadReq.sender,
  //   };

  //   await addNotification(notificationData);
  // }

  return res.status("200").json(
    response({
      status: "Ok",
      statusCode: "200",
      type: "load",
      message: `load request ${action} successfully`,
    })
  );
});

const technicalIssue = catchAsync(async (req, res) => {
  const { _id, role } = req.User;
  const { loadId, loadRequestId } = req.body;
  const findLoad = await Load.findById(loadId);
  if (!findLoad) {
    throw new ApiError(httpStatus.NOT_FOUND, "Load not found");
  }

  // findLoad.isAssigned = false;
  // findLoad.driver = "";
  await findLoad.save();
  const loadReq = await LoadRequest.findById(loadRequestId);
  if (!loadReq) {
    throw new ApiError(httpStatus.NOT_FOUND, "Load request not found");
  }

  let findTruck = await TruckDetails.findOne({
    _id: new mongoose.Types.ObjectId(String(loadReq.truck)),
  });

  findTruck.availablePalletSpace =
    findTruck.availablePalletSpace + findLoad?.palletSpace;

  await findTruck.save();
  const notificationData = {
    message:
      "A technical issue has been reported, please contact me as soon as possible",
    type: "technical-issue",
    role: role,
    linkId: loadReq._id,
    sender: _id,
    receiver: findLoad.user,
  };

  await addNotification(notificationData);
  return res.status(httpStatus.OK).json({
    status: "OK",
    statusCode: httpStatus.OK,
    message: "Technical issue reported successfully.",
  });
});

module.exports = {
  loadRequestHandler,
  requestActionHandler,
  requestForLoad,
  loadRequestDetails,
  reassign,
  technicalIssue,
};
