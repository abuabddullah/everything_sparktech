const Load = require("./load.model");
const User = require("../User/user.model");
const { addNotification } = require("../Notification/notification.service");
const ApiError = require("../../helpers/ApiError");
const httpStatus = require("http-status");
const { default: mongoose } = require("mongoose");
const Truck = require("../TruckDetails/truckDetails.model");
const LoadRequest = require("../LoadRequest/loadRequest.model");


const addManyLoadDetails = async (loadDetails, user, res) => {
  const load = loadDetails.map((load) => {
    return {
      receiverLocation: load.receiverLocation,
      shipperLocation: load.shipperLocation,
    };
  });
 

  load.forEach((load) => {
    if (!load.receiverLocation) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "receiverLocation not found please add location"
      );
    }
    if (
      load.receiverLocation &&
      Array.isArray(load.receiverLocation.coordinates) &&
      load.receiverLocation.coordinates.length === 0
    ) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "receiverLocation location or coordinates not found please add location and coordinates"
      );
    }

    if (!load.shipperLocation) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "shipperLocation not found please add location"
      );
    }
    if (
      load.shipperLocation &&
      Array.isArray(load.shipperLocation.coordinates) &&
      load.shipperLocation.coordinates.length === 0
    ) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        " shipperLocation location or shipperLocation coordinates not found please add location and coordinates"
      );
    }
  });

  // return;

  let loadCreatedResult;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const loadByBol = await Load.find({
      $and: [
        { billOfLading: { $in: loadDetails.map((load) => load.billOfLading) } },
        { user: user._id },
      ],
    }).session(session);

    if (loadByBol?.length > 0) {
      throw new ApiError(
        422,
        "Load already exists with this bill of lading number"
      );
    }

    loadCreatedResult = await Load.insertMany(loadDetails, { session });

    if (loadCreatedResult) {
      try {
        const location = loadDetails?.[0]?.shipperLocation?.coordinates;
        if (!location || !Array.isArray(location) || location.length !== 2) {
          throw new Error("Invalid location coordinates.");
        }

        const [longitude, latitude] = location;

        if (longitude === null || latitude === null) {
          throw new Error("Invalid location coordinates.");
        }

        const RADIUS_IN_KM = process.env.RADIUS_IN_KM;
        const RADIUS_IN_METERS = RADIUS_IN_KM * 1000;

        // finding driver for sending notification
        const result = await User.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [longitude, latitude] },
              key: "location",
              distanceField: "distance",
              maxDistance: RADIUS_IN_METERS,
              spherical: true,
            },
          },
          { $match: { $and: [{ isOnDuty: true }, { isDeleted: false }] } },
          {
            $project: {
              fullName: 1,
              _id: 1,
              email: 1,
              phoneNumber: 1,
              distance: 1,
            },
          },
        ]);


        if (loadCreatedResult.length > 0) {
          const notifications = result.map((driver) => {
            return {
              message: "A load created near you",
              type: "nearby-load",
              role: user.role,
              linkId: loadCreatedResult[0]?._id,
              sender: user._id,
              receiver: driver?._id,
            };
          });
          // Send notifications in parallel
          await Promise.all(
            notifications.map((notification) => addNotification(notification))
          );
        } else {
          console.log("No nearby drivers found.");
        }
      } catch (error) {
        console.error("Error in getNearestLoads:", error);
        throw error;
      }

      // const findMySubscriptions = await MySubscription.findOne({
      //   user: user._id,
      // });

      // const remainingDispatch = findMySubscriptions?.remainingDispatch ?? 0;

      // if (
      //   typeof remainingDispatch !== "number" ||
      //   remainingDispatch < loadCreatedResult.length
      // ) {
      //   throw new ApiError(
      //     httpStatus.BAD_REQUEST,
      //     "You have not enough dispatch remaining please buy subscription"
      //   );
      // }

      // await MySubscription.findOneAndUpdate(
      //   {
      //     user: user._id,
      //   },
      //   {
      //     $set: {
      //       remainingDispatch:
      //         findMySubscriptions?.remainingDispatch - loadCreatedResult.length,
      //     },
      //   },
      //   {
      //     new: true,
      //   }
      // );
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  return loadCreatedResult;
};

const getLoadById = async (id) => {
  return await Load.findById(id);
};

const getLoads = async (user, options) => {
  const { page, limit, searchTerm } = options;
  const skip = (page - 1) * limit;
  const searchableFields = [
    "shipperName",
    "receiverName",
    "shippingAddress",
    "receivingAddress",
    "loadType",
  ];

  let filter = {};
  filter = {
    $and: [{ user: user?._id }, { driver: { $exists: false } }],
  };

  if (searchTerm) {
    filter = {
      ...filter,
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };
  }

  // Fetch paginated loads
  const results = await Load.find(filter)
    .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
    .skip(skip)
    .limit(limit)
    .exec();

  // Calculate total results and pages
  const totalResults = await Load.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results, // Paginated data
    pagination: {
      totalResults,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};

const findLoadDetails = async (query, populateOptions, options) => {
  const { userFields, driverFields, loadFields, populateUser, populateDriver } =
    populateOptions;

  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  let queryBuilder = Load.find(query)
    .select(loadFields)
    .skip(skip)
    .limit(limit);

  if (populateUser && userFields)
    queryBuilder = queryBuilder.populate("user", userFields);
  if (populateDriver && driverFields)
    queryBuilder = queryBuilder.populate("driver", driverFields);

  const results = await queryBuilder.exec();
  const totalResults = await Load.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = {
    totalResults,
    totalPages,
    currentPage: page,
    limit,
  };

  return { results, pagination };
};

const getNearestLoads = async (payload) => {
  try {
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Query object is required.");
    }

    const {
      truckNumber,
      trailerSize,
      palletSpace,
      shipperLocation,
    } = payload;
    const longitude = parseFloat(shipperLocation?.[0]) || null;
    const latitude = parseFloat(shipperLocation?.[1]) || null;

    // const matchStage = {
    //   ...(trailerSize && { trailerSize: { $lte: trailerSize } }),
    //   ...(palletSpace && { palletSpace: { $lte: palletSpace } }),
    // };

    const pipeline = [];

    if (latitude !== null && longitude !== null) {
      const RADIUS_IN_KM = process.env.RADIUS_IN_KM || 4;
      const RADIUS_IN_METERS = RADIUS_IN_KM * 1000;

      pipeline.push(
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            key: "shipperLocation",
            distanceField: "distance",
            // maxDistance: RADIUS_IN_METERS,
            spherical: true,
          },
        },

        {
          $match: {
            isAssigned: false,
          },
        }
      );
    }

    // if (Object.keys(matchStage).length > 0) {
    //   pipeline.push({ $match: matchStage });
    // }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      }
    );

    // Update the $project stage to include only required fields
    pipeline.push({
      $project: {
        user: {
          userImage: "$user.image",
          userId: "$user._id",
          userName: "$user.fullName",
          userEmail: "$user.email",
        },
        shipperName: 1,
        shipperPhoneNumber: 1,
        shipperEmail: 1,
        shippingAddress: 1,
        shippingCity: 1,
        shippingState: 1,
        shippingZip: 1,
        palletSpace: 1,
        weight: 1,
        loadType: 1,
        trailerSize: 1,
        productType: 1,
        Hazmat: 1,
        description: 1,
        shipmentPayment: 1,
        receiverName: 1,
        receiverPhoneNumber: 1,
        receiverEmail: 1,
        receivingAddress: 1,
        receiverCity: 1,
        receiverState: 1,
        receiverZip: 1,
        pickupDate: 1,
        deliveryDate: 1,
        billOfLading: 1,
        deliveryInstruction: 1,
        shipperLocation: 1,
        receiverLocation: 1,
        isAssigned: 1,
        distance: 1, // Keep the distance field
      },
    });

    const truckInfo = await Truck.find({
      $and: [
        { truckNumber },
        {
          $and: [
            { trailerSize: { $gte: trailerSize } },
            { palletSpace: { $gte: palletSpace } },
          ],
        },
      ],
    });

    if (truckInfo.length <= 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No Truck found for in this pallet space and trailer size"
      );
    }

    const result = await Load.aggregate(pipeline);

    // const modifyResult = result.filter((item) => {
    //   const pickupDate = new Date(item.pickupDate);
    //   return pickupDate > new Date();
    // });

    return {
      // result: modifyResult || [],
      result,
      truckInfo,
    };
    // return { result, truckInfo };
  } catch (error) {
    console.error("Error in getNearestLoads:", error.message);
    throw error;
  }
};

const findByBolNumberService = async (bolNumber, user) => {
  const result = await LoadRequest.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(String(user._id)),
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
    {
      $unwind: "$driver",
    },
    {
      $lookup: {
        from: "loads",
        localField: "load",
        foreignField: "_id",
        as: "load",
      },
    },
    {
      $unwind: "$load",
    },
    {
      $match: {
        "load.billOfLading": bolNumber,
      },
    },
    {
      $project: {
        driver: 1,
        user: 1,
        load: 1,
        status: 1,
      },
    },
  ]);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Load not found");
  }

  return result;
};

// have to add truck info in here
const findNearestDriverService = async (loadId) => {
  const load = await Load.findById({
    _id: new mongoose.Types.ObjectId(String(loadId)),
  }).select("shipperLocation palletSpace trailerSize");

  const longitude = load.shipperLocation.coordinates[0];
  const latitude = load.shipperLocation.coordinates[1];

  let result;

  if (latitude !== null && longitude !== null) {
    const RADIUS_IN_KM = process.env.RADIUS_IN_KM || 4;
    const RADIUS_IN_METERS = RADIUS_IN_KM * 1000;

    result = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          key: "location",
          distanceField: "distance",
          maxDistance: RADIUS_IN_METERS,
          spherical: true,
        },
      },
      {
        $match: {
          $and: [{ isOnDuty: true }, { isDeleted: false }],
        },
      },
      // {
      //   $lookup: {
      //     from: "trucks",
      //     localField: "_id",
      //     foreignField: "driver",
      //     as: "truck",
      //   },
      // },
      {
        $lookup: {
          from: "trucks",
          localField: "truckOnDuty",
          foreignField: "_id",
          as: "truck",
        },
      },

      {
        $unwind: "$truck",
      },

      {
        $match: {
          $and: [
            { "truck.availablePalletSpace": { $gte: load.palletSpace } },
            { "truck.trailerSize": { $gte: load.trailerSize } },
          ],
        },
      },

      {
        $project: {
          password: 0,
          "truck.__v": 0,
          __v: 0,
        },
      },
    ]);
  }

  return {
    driverInfo: result,
    shipperLocation: load.shipperLocation,
  };
};

const getPendingShipmentsService = async (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { searchTerm } = req.query;

  const searchableFields = [
    "shipperName",
    "receiverName",
    "shippingAddress",
    "receivingAddress",
    "loadType",
    "billOfLading",
  ];

  let filter = {};
  filter = {
    $and: [
      { user: req.User._id },
      { driver: { $exists: false } },
      { isAssigned: false },
    ],
  };

  if (searchTerm) {
    filter = {
      ...filter,
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };
  }

  const result = await Load.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();

  const totalCount = await Load.countDocuments({
    $and: [
      { user: req.User._id },
      { driver: { $exists: false } },
      { isAssigned: false },
    ],
  });

  return {
    results: result,
    pagination: {
      totalResults: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit: limit,
    },
  };
};

const findNearestDriverForUserService = async (userLocation, user) => {
  const longitude = userLocation[0];
  const latitude = userLocation[1];

  const RADIUS_IN_KM = process.env.RADIUS_IN_KM || 4; // Default radius of 4 KM if not set
  const RADIUS_IN_METERS = RADIUS_IN_KM * 1000;

  const drivers = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        key: "location",
        distanceField: "distance",
        maxDistance: RADIUS_IN_METERS,
        spherical: true,
      },
    },
    {
      $match: {
        $and: [{ isOnDuty: true }, { isBlocked: false }],
      },
    },

    {
      $lookup: {
        from: "trucks",
        localField: "_id",
        foreignField: "driver",
        as: "truck",
      },
    },
    {
      $unwind: "$truck",
    },
    {
      $project: {
        password: 0,
        "truck.__v": 0,
        __v: 0,
      },
    },
  ]);

  return drivers;
};

// const findLoadBySourceDestinationService = async (payload) => {
//   const { source, destination, distance } = payload;

//   const RADIUS_IN_METERS = distance * 1000;

//   const loads = await Load.aggregate([
//     {
//       $geoNear: {
//         near: {
//           type: "Point",
//           coordinates: source.coordinates,
//         },
//         key: "shipperLocation",
//         distanceField: "sourceDistance",
//         maxDistance: RADIUS_IN_METERS,
//         spherical: true,
//       },
//     },
//     {
//       $match: {
//         "receiverLocation.coordinates": {
//           $geoWithin: {
//             $centerSphere: [destination.coordinates, distance / 6378.1],
//           },
//         },
//       },
//     },
//     {
//       $match: {
//         isAssigned: false,
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "user",
//         foreignField: "_id",
//         as: "userDetails",
//       },
//     },
//     {
//       $unwind: {
//         path: "$userDetails",
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $project: {
//         sourceDistance: 1,
//         destinationDistance: {
//           $let: {
//             vars: {
//               lat1: { $arrayElemAt: ["$receiverLocation.coordinates", 1] },
//               lon1: { $arrayElemAt: ["$receiverLocation.coordinates", 0] },
//               lat2: { $literal: destination.coordinates[1] },
//               lon2: { $literal: destination.coordinates[0] },
//             },
//             in: {
//               $multiply: [
//                 6371,
//                 {
//                   $acos: {
//                     $add: [
//                       {
//                         $multiply: [
//                           { $sin: { $degreesToRadians: "$$lat1" } },
//                           { $sin: { $degreesToRadians: "$$lat2" } },
//                         ],
//                       },
//                       {
//                         $multiply: [
//                           { $cos: { $degreesToRadians: "$$lat1" } },
//                           { $cos: { $degreesToRadians: "$$lat2" } },
//                           {
//                             $cos: {
//                               $subtract: [
//                                 { $degreesToRadians: "$$lon2" },
//                                 { $degreesToRadians: "$$lon1" },
//                               ],
//                             },
//                           },
//                         ],
//                       },
//                     ],
//                   },
//                 },
//               ],
//             },
//           },
//         },
//         source: 1,
//         destination: 1,
//         distance: 1,
//         shipperName: 1,
//         shipperPhoneNumber: 1,
//         shipperEmail: 1,
//         shippingAddress: 1,
//         shippingCity: 1,
//         shippingState: 1,
//         shippingZip: 1,
//         receiverName: 1,
//         receiverPhoneNumber: 1,
//         receiverEmail: 1,
//         receivingAddress: 1,
//         receiverCity: 1,
//         receiverState: 1,
//         receiverZip: 1,
//         productType: 1,
//         palletSpace: 1,
//         weight: 1,
//         loadType: 1,
//         trailerSize: 1,
//         Hazmat: 1,
//         description: 1,
//         shipmentPayment: 1,
//         pickupDate: 1,
//         deliveryDate: 1,
//         billOfLading: 1,
//         deliveryInstruction: 1,
//         receiverLocation: 1,
//         shipperLocation: 1,
//         isAssigned: 1,
//         user: {
//           fullName: "$userDetails.fullName",
//           email: "$userDetails.email",
//           phoneNumber: "$userDetails.phoneNumber",
//           image: "$userDetails.image",
//           role: "$userDetails.role",
//           address: "$userDetails.address",
//         },
//       },
//     },
//   ]);

//   return loads;
// };

const findLoadBySourceDestinationService = async (payload) => {
  const { source, destination, distance } = payload;
  const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format
  const RADIUS_IN_METERS = distance * 1000;

  const loads = await Load.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: source.coordinates,
        },
        key: "shipperLocation",
        distanceField: "sourceDistance",
        maxDistance: RADIUS_IN_METERS,
        spherical: true,
      },
    },
    {
      $match: {
        "receiverLocation.coordinates": {
          $geoWithin: {
            $centerSphere: [destination.coordinates, distance / 6378.1],
          },
        },
      },
    },
    {
      $match: {
        isAssigned: false,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    // 🔹 Add Pickup Date Conversion
    {
      $addFields: {
        pickupDateConverted: {
          $switch: {
            branches: [
              {
                case: {
                  $regexMatch: {
                    input: "$pickupDate",
                    regex: "^(\\d{2}-\\d{2}-\\d{4})",
                  },
                }, // MM-DD-YYYY
                then: {
                  $dateFromString: {
                    dateString: { $substr: ["$pickupDate", 0, 10] },
                    format: "%m-%d-%Y",
                  },
                },
              },
              {
                case: {
                  $regexMatch: {
                    input: "$pickupDate",
                    regex: "^(\\d{4}-\\d{2}-\\d{2})",
                  },
                }, // YYYY-MM-DD
                then: {
                  $dateFromString: {
                    dateString: { $substr: ["$pickupDate", 0, 10] },
                    format: "%Y-%m-%d",
                  },
                },
              },
            ],
            default: null, // If no format matches, set to null
          },
        },
      },
    },
    // 🔹 Filter: Only include loads where pickupDate is greater than today
    {
      $match: {
        pickupDateConverted: { $gte: new Date(today) },
      },
    },
    {
      $project: {
        sourceDistance: 1,
        destinationDistance: {
          $let: {
            vars: {
              lat1: { $arrayElemAt: ["$receiverLocation.coordinates", 1] },
              lon1: { $arrayElemAt: ["$receiverLocation.coordinates", 0] },
              lat2: { $literal: destination.coordinates[1] },
              lon2: { $literal: destination.coordinates[0] },
            },
            in: {
              $multiply: [
                6371,
                {
                  $acos: {
                    $add: [
                      {
                        $multiply: [
                          { $sin: { $degreesToRadians: "$$lat1" } },
                          { $sin: { $degreesToRadians: "$$lat2" } },
                        ],
                      },
                      {
                        $multiply: [
                          { $cos: { $degreesToRadians: "$$lat1" } },
                          { $cos: { $degreesToRadians: "$$lat2" } },
                          {
                            $cos: {
                              $subtract: [
                                { $degreesToRadians: "$$lon2" },
                                { $degreesToRadians: "$$lon1" },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
        source: 1,
        destination: 1,
        distance: 1,
        shipperName: 1,
        shipperPhoneNumber: 1,
        shipperEmail: 1,
        shippingAddress: 1,
        shippingCity: 1,
        shippingState: 1,
        shippingZip: 1,
        receiverName: 1,
        receiverPhoneNumber: 1,
        receiverEmail: 1,
        receivingAddress: 1,
        receiverCity: 1,
        receiverState: 1,
        receiverZip: 1,
        productType: 1,
        palletSpace: 1,
        weight: 1,
        loadType: 1,
        trailerSize: 1,
        Hazmat: 1,
        description: 1,
        shipmentPayment: 1,
        pickupDate: 1,
        deliveryDate: 1,
        billOfLading: 1,
        deliveryInstruction: 1,
        receiverLocation: 1,
        shipperLocation: 1,
        isAssigned: 1,
        user: {
          fullName: "$userDetails.fullName",
          email: "$userDetails.email",
          phoneNumber: "$userDetails.phoneNumber",
          image: "$userDetails.image",
          role: "$userDetails.role",
          address: "$userDetails.address",
        },
      },
    },
  ]);

  return loads;
};

const findDriverByRecentDriverLocationService = async (query) => {
  const { location, searchTerm } = query;
  const [lon, lat] = location.split(",");
  const longitude = Number(lon);
  const latitude = Number(lat);

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchableFields = ["phoneNumber", "email", "fullName"];

  let filter = {};
  filter = {
    $and: [{ role: "driver" }, { isOnDuty: true }, { isBlocked: false }],
  };

  if (searchTerm) {
    filter = {
      ...filter,
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };
  }

  const RADIUS_IN_METERS = process.env.RADIUS_IN_KM * 1000;

  // First aggregate for the total count
  const totalCount = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        key: "location",
        distanceField: "distance",
        maxDistance: RADIUS_IN_METERS,
        spherical: true,
      },
    },
    {
      $match: {
        ...filter,
      },
    },

    {
      $count: "total",
    },
  ]);

  // Aggregate for actual data retrieval
  const findDriver = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        key: "location",
        distanceField: "distance",
        maxDistance: RADIUS_IN_METERS,
        spherical: true,
      },
    },
    {
      $match: {
        ...filter,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },

    {
      $lookup: {
        from: "trucks",
        localField: "truckOnDuty",
        foreignField: "_id",
        as: "truck",
      },
    },

    // // i think got error
    {
      $unwind: "$truck",
    },
    // {
    //   $unwind: {
    //     path: "$load",
    //     preserveNullAndEmptyArrays: true, // Prevents dropping users without loads
    //   },
    // },

    // {
    //   $lookup: {
    //     from: "loads",
    //     localField: "_id",
    //     foreignField: "driver",
    //     as: "load",
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$load",
    //     preserveNullAndEmptyArrays: true, // Prevents dropping users without loads
    //   },
    // },
    {
      $project: {
        password: 0,
        "truck.__v": 0,
        __v: 0,

        // _id: 1, // Include _id
        // name: 1, // Include necessary fields
        // email: 1,
        // location: 1,
        // distance: 1,
        // truck: 1, // Keep truck details
        // load: 1, // Keep load details
      },
    },
  ]);

  // Calculate total pages
  const totalResults = totalCount.length > 0 ? totalCount[0].total : 0;
  const totalPages = Math.ceil(totalResults / limit);

  // Return the result with pagination details
  return {
    data: findDriver,
    pagination: {
      currentPage: page,
      limit,
      totalResults,
      totalPages,
    },
  };
};

const updateLoadDetailsService = async (req) => {
  const { loadId } = req.params;
  const data = req.body;

  console.log("data ====>", data);

  const findLoad = await Load.findById(loadId);
  if (!findLoad) {
    throw new ApiError(httpStatus.NOT_FOUND, "Load not found");
  }

  if (findLoad.user.toString() !== req.User._id.toString()) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this load"
    );
  }

  return await Load.findByIdAndUpdate(loadId, data, { new: true });
};

const deletePendingLoadService = async (req) => {
  const { loadId } = req.params;
  const findLoad = await Load.findById(loadId);
  if (!findLoad) {
    throw new ApiError(httpStatus.NOT_FOUND, "Load not found");
  }

  if (findLoad.isAssigned) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Load is already assigned");
  }

  if (findLoad.user.toString() !== req.User._id.toString()) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this load"
    );
  }

  return await Load.findByIdAndDelete(loadId);
};

module.exports = {
  //getLoad,
  getLoadById,
  addManyLoadDetails,
  getLoads,
  findLoadDetails,
  getNearestLoads,
  findByBolNumberService,
  findNearestDriverService,
  getPendingShipmentsService,
  findNearestDriverForUserService,
  findLoadBySourceDestinationService,
  findDriverByRecentDriverLocationService,
  updateLoadDetailsService,
  deletePendingLoadService,
};
