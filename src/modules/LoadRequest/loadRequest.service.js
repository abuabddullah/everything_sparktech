const { default: mongoose } = require("mongoose");
const User = require("../User/user.model");
const LoadRequest = require("./loadRequest.model");
const { getLoadById } = require("../Load/load.service");
const generateUniqeId = require("../../helpers/generateUniqeId");
const { addNotification } = require("../Notification/notification.service");
const { getTransport } = require("../TruckDetails/truckDetails.service");
const { getUserById } = require("../User/user.service");
const Truck = require("../TruckDetails/truckDetails.model");
const ApiError = require("../../helpers/ApiError");
const httpStatus = require("http-status");
const Load = require("../Load/load.model");
const { findLoadRequestsByIds, findLoadByIds } = require("./loadRequestUtils");

const processLoadRequests = async (user, body, role) => {
  const { _id } = user;
  const allDriverId = body.map((item) => item.driver);

  const driver = await Truck.find({
    $and: [
      {
        driver: { $in: role === "user" ? allDriverId : _id },
      },
      {
        $and: [
          { trailerSize: { $gt: 0 } },
          { availablePalletSpace: { $gt: 0 } },
        ],
      },
    ],
  });

  const truckNumber = driver[0];

  if (!truckNumber) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No Truck found for this driver please assign another driver"
    );
  }

  if (role === "user") {
    await Promise.all(
      allDriverId?.map(async (id) => {
        const user = await getUserById(id);

        if (!user.validDriver) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `${user?.fullName} is not valid driver`
          );
        }
        if (!user.isOnDuty) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `${user?.fullName} is not on duty right now`
          );
        }
        return { user };
      })
    );
  }

  const loadIds = Array.isArray(body)
    ? body.map((item) => item.load)
    : body.load
    ? [body.load]
    : [];

  if (!loadIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No load IDs provided.");
  }

  let load;
  // Validate load IDs
  const validLoadIds = await Promise.all(
    loadIds.map(async (id) => {
      load = await getLoadById(id);

      if (!load) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Valid Load ID required load  not found"
        );
      }

      if (
        load?.palletSpace > truckNumber.availablePalletSpace
        // ||
        // // load.trailerSize > truckNumber.trailerSize
        // load.trailerSize > truckNumber.trailerSize
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Truck does not have enough space for this load"
        );
      }

      // const loadDate = new Date(load.pickupDate).toISOString();
      // const today = new Date().toISOString();

      // let message = "Load is expired, please update your pickup date";
      // if (loadDate < today) {
      //   throw new ApiError(
      //     httpStatus.BAD_REQUEST,
      //     role === "user" ? message : "Load has been expired"
      //   );
      // }

      load.isAssigned = true;
      // await load.save();

      if (!load) {
        //throw new Error(`Valid Load ID required`);
        throw new ApiError(httpStatus.BAD_REQUEST, "Valid Load ID required");
      }
      return id;
    })
  );

  // return ;

  // Truck validation
  if (role === "driver") {
    await Promise.all(
      body.map(async (item) => {
        const truckData = await getTransport({ _id: item.truck });

        const findLoadRequests = await LoadRequest.findOne({
          $and: [
            { load: item.load },
            { driver: user._id },
            { status: { $in: ["Pending", "Accepted"] } },
          ],
        });

        if (findLoadRequests) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "You already have a load request for this load"
          );
        }

        if (!truckData || truckData.length == 0) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Valid Truck ID required");
        }
      })
    );
  }

  const data = Array.isArray(body)
    ? await Promise.all(
        body
          .filter((item) => validLoadIds.includes(item.load))
          .map(async (item) => {
            const loads = await findLoadByIds(item.load);
            return {
              load: item.load,
              truck: role === "driver" ? item.truck : truckNumber?._id,
              driver: role === "user" ? item.driver : _id,
              status: "Pending",
              user: role === "driver" ? loads[0]?.user : user?._id, // Assigning a single user ID here
              sender: _id,
              shippingId: generateUniqeId(),
            };
          })
      )
    : {
        load: body.load,
        truck: role === "driver" ? body.truck : truckNumber?._id,
        driver: role === "user" ? body.driver : _id,
        status: "Pending",
        user: role === "user" ? _id : body.driver,
        sender: _id,
        shippingId: generateUniqeId(),
      };

  // Validate drivers if the user is a requester
  if (role === "user") {
    await Promise.all(
      body.map(async (item) => {
        const driverData = await getUserById(item.driver);
        if (!driverData) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Valid Driver ID Required"
          );
        }

        const findLoadRequests = await LoadRequest.findOne({
          $and: [
            { load: item.load },
            { driver: item.driver },
            { status: { $in: ["Pending", "Accepted"] } },
          ],
        });

        if (findLoadRequests) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "already requested this load to this driver"
          );
        }
        // await load.save();
      })
    );
  }

  // Create load requests
  const loadRequests = await createLoadReq(data);

  // Fetch associated load users
  const loadUsers = await Promise.all(
    loadRequests.map(async (request) => {
      const user = await getLoadById(request.load);
      return { load: request.load, user, loadReqId: request._id };
    })
  );

  // Prepare notifications
  const driverIds = loadRequests.map((driver) => ({ driver: driver?.driver }));
  const notifications = loadUsers.map((request) => ({
    message: "You have received a new load request",
    type: "load-request",
    role: role,
    linkId: request.loadReqId,
    sender: role === "user" ? loadRequests[0]?.sender : driverIds?.[0].driver,
    receiver: role === "user" ? loadRequests[0]?.driver : request?.user?.user,
  }));

  // Send notifications
  await Promise.all(
    notifications.map((notification) => addNotification(notification))
  );

  await load.save();
  return loadRequests;
};

const createLoadReq = async (data) => {
  if (Array.isArray(data)) {
    return await LoadRequest.insertMany(data);
  }

  const loadRequest = new LoadRequest(data);
  return await loadRequest.save();
};

const findSpecificloadRequest = async (query) => {
  return await LoadRequest.findOne(query);
};

// Find Load Requests using specific query with pagination
const findLoadRequests = async (req) => {
  const isMyRequests = req.query.myRequests === "true"; // By default, MyLoad Requests
  // const isMyRequests = req.query.myRequests === 'false'; // By default, MyLoad Requests
  //
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  // Ensure User ID exists
  if (!req.User || !req.User._id) {
    throw new Error("User ID is required");
  }

  let senderCondition;
  // Determine sender condition
  // const senderCondition = isMyRequests
  //   ? { sender: new mongoose.Types.ObjectId(String(req.User._id)) }
  //   : {
  //     sender: { $ne: new mongoose.Types.ObjectId(String(req.User._id)) },
  //     user: new mongoose.Types.ObjectId(String(req.User._id))
  //   };

  //2nd
  if (req.User.role === "user") {
    senderCondition = isMyRequests
      ? { sender: new mongoose.Types.ObjectId(String(req.User._id)) }
      : {
          sender: { $ne: new mongoose.Types.ObjectId(String(req.User._id)) },
          user: new mongoose.Types.ObjectId(String(req.User._id)),
        };
  } else if (req.User.role === "driver") {
    senderCondition = isMyRequests
      ? { sender: new mongoose.Types.ObjectId(String(req.User._id)) }
      : {
          sender: { $ne: new mongoose.Types.ObjectId(String(req.User._id)) },
          driver: new mongoose.Types.ObjectId(String(req.User._id)),
        };
  }

  const result = await LoadRequest.aggregate([
    {
      $match: {
        $and: [{ ...senderCondition }, { status: "Pending" }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "driver",
        foreignField: "_id",
        as: "driver",
      },
    },
    { $unwind: "$driver" },

    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    {
      $lookup: {
        from: "loads",
        localField: "load",
        foreignField: "_id",
        as: "load",
      },
    },
    { $unwind: "$load" },
    {
      $lookup: {
        from: "trucks",
        localField: "truck",
        foreignField: "_id",
        as: "truck",
      },
    },
    { $unwind: "$truck" },

    {
      $facet: {
        metadata: [{ $count: "total" }], // Count total documents
        data: [{ $skip: skip }, { $limit: limit }], // Paginate results
      },
    },
    { $unwind: "$metadata" },
    {
      $project: {
        data: 1,
        pagination: {
          currentPage: page,
          totalPages: { $ceil: { $divide: ["$metadata.total", limit] } },
          totalResults: "$metadata.total",
          itemsPerPage: limit,
        },
      },
    },
  ]);

  const formattedResponse = {
    attributes: {
      loadRequests:
        result[0]?.data?.map((item) => ({
          id: item._id,
          status: item.status,
          user: item.user,
          driver: item.driver,
          load: item.load,
          truck: item.truck,
          // availablePalletSpace: item.truck.palletSpace - item.load.palletSpace,
          availablePalletSpace: item.truck.availablePalletSpace,
        })) || [],
      pagination: result[0]?.pagination || {
        currentPage: page,
        totalPages: 0,
        totalResults: 0,
        itemsPerPage: limit,
      },
    },
    errors: [],
  };

  return formattedResponse;
};

const deleteOtherLoadReq = async (searchData) => {
  return await LoadRequest.deleteMany(searchData);
};

const findSpecificLoadRequestByLoadId = async (loadId) => {
  const result = await LoadRequest.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(String(loadId)),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "driver",
        foreignField: "_id",
        as: "driver",
      },
    },
    { $unwind: "$driver" },

    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    {
      $lookup: {
        from: "loads",
        localField: "load",
        foreignField: "_id",
        as: "load",
      },
    },
    { $unwind: "$load" },
    {
      $lookup: {
        from: "trucks",
        localField: "truck",
        foreignField: "_id",
        as: "truck",
      },
    },
    { $unwind: "$truck" },

    {
      $project: {
        load: 1,
        driver: 1,
        user: 1,
        truck: 1,
      },
    },
  ]);

  return result;
};

module.exports = {
  //addManyLoadRequests,
  findLoadRequests,
  createLoadReq,
  deleteOtherLoadReq,
  findSpecificloadRequest,
  processLoadRequests,
  findSpecificLoadRequestByLoadId,
};
