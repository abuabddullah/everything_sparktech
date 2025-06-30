const { decode } = require("jsonwebtoken");
const User = require("./user.model");
const Equipment = require("../Equipment/equipment.model");
const { default: mongoose } = require("mongoose");
const httpStatus = require("http-status");
const ApiError = require("../../helpers/ApiError");
const Truck = require("../TruckDetails/truckDetails.model");
const MySubscription = require("../MySubscription/mySubscription.model");
const { equipmentUtils } = require("../Equipment/equipment.utils");
const { addNotification } = require("../Notification/notification.service");
const Notification = require("../Notification/notification.model");

const getUserById = async (id) => {
  return await User.findById(id);
};

const getSpecificDetails = async (id, select) => {
  return await User.findById(id).select(select);
};

const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};
const getUserByfilter = async (filter) => {
  return await User.findOne(filter);
};

// const deleteAccount = async (userId) => {
//   const userData = await User.findById(userId);
//   if (userData) {
//     userData.email = userData.email + " (Account is deleted), Joining Time: " + userData.createdAt;
//     userData.fullName = "Dialogi User"
//     userData.image = `/uploads/users/deletedAccount.png`
//     userData.isDeleted = true;
//     userData.save();
//   }
//   return
// }

const deleteAccount = async (user) => {
  return await User.findByIdAndDelete(user._id);
};

const updateUser = async (userId, userbody) => {
  let result;

  if (
    (userbody && userbody.isDeleted === "true") ||
    userbody.isDeleted === true
  ) {
    result = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );
  } else {
    result = await User.findByIdAndUpdate(userId, userbody, { new: true });
  }

  return result;
};

const addMoreUserFeild = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  Object.assign(user, data);
  const updatedUser = await user.save();

  const findAdmin = await User.findOne({ role: "admin" });

  if (!findAdmin) {
    throw new Error("Admin not found");
  }

  console.log({ findAdmin });

  if (updatedUser.isComplete === true) {
    const notificationData = {
      message: `${user.fullName} has completed their profile please access it`,
      type: "admin",
      role: user.role,
      linkId: user._id,
      sender: user._id,
      receiver: findAdmin._id,
    };

    const notification = new Notification(notificationData);
    return notification.save();
    // await addNotification(notificationData);
  }

  return updatedUser;
};

const getUsers = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const userList = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const totalResults = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { totalResults, totalPages, currentPage: page, limit };
  return { userList, pagination };
};

// const getMonthlyUserootmsRatio = async (year) => {
//   const startDate = new Date(`${year}-01-01`);
//   const endDate = new Date(`${year}-12-31T23:59:59`);

//   const months = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];

//   const result = await User.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lte: endDate },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           month: { $month: "$createdAt" },
//           role: "$role",
//         },
//         count: { $sum: 1 },
//       },
//     },
//     {
//       $group: {
//         _id: "$_id.month",
//         roles: {
//           $push: {
//             role: "$_id.role",
//             count: "$count",
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         month: "$_id",
//         userCount: {
//           $cond: {
//             if: {
//               $gt: [
//                 {
//                   $size: {
//                     $filter: {
//                       input: "$roles",
//                       as: "role",
//                       cond: { $eq: ["$$role.role", "user"] },
//                     },
//                   },
//                 },
//                 0,
//               ],
//             },
//             then: {
//               $arrayElemAt: [
//                 {
//                   $filter: {
//                     input: "$roles",
//                     as: "role",
//                     cond: { $eq: ["$$role.role", "user"] },
//                   },
//                 },
//                 0,
//               ],
//             },
//             else: { role: "user", count: 0 },
//           },
//         },
//         ootmsCount: {
//           $cond: {
//             if: {
//               $gt: [
//                 {
//                   $size: {
//                     $filter: {
//                       input: "$roles",
//                       as: "role",
//                       cond: { $eq: ["$$role.role", "ootms"] },
//                     },
//                   },
//                 },
//                 0,
//               ],
//             },
//             then: {
//               $arrayElemAt: [
//                 {
//                   $filter: {
//                     input: "$roles",
//                     as: "role",
//                     cond: { $eq: ["$$role.role", "ootms"] },
//                   },
//                 },
//                 0,
//               ],
//             },
//             else: { role: "ootms", count: 0 },
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         month: 1,
//         user: "$userCount.count",
//         ootms: "$ootmsCount.count",
//       },
//     },
//     {
//       $sort: { month: 1 },
//     },
//   ]);

//   // Initialize the result array with all months and counts set to 0
//   const formattedResult = months.map((month, index) => {
//     const data = result.find((r) => r.month === index + 1) || {
//       month: index + 1,
//       user: 0,
//       ootms: 0,
//     };
//     return {
//       month: month,
//       user: data.user,
//       ootms: data.ootms,
//     };
//   });

//   return formattedResult;
// };

const getMonthlyUserootmsRatio = async (year) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59`);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const result = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter by date range
        role: { $in: ["driver", "user"] }, // Include only "driver" and "user" roles
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" }, // Group by month
          role: "$role", // Group by role
        },
        count: { $sum: 1 }, // Count the number of users per role per month
      },
    },
    {
      $group: {
        _id: "$_id.month", // Group by month only
        roles: {
          $push: {
            role: "$_id.role", // Include the role
            count: "$count", // Include the count
          },
        },
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field
        month: "$_id", // Include the month
        driverCount: {
          $let: {
            vars: {
              driver: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$roles",
                      as: "role",
                      cond: { $eq: ["$$role.role", "driver"] },
                    },
                  },
                  0,
                ],
              },
            },
            in: { $ifNull: ["$$driver.count", 0] }, // Default to 0 if no drivers
          },
        },
        userCount: {
          $let: {
            vars: {
              user: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$roles",
                      as: "role",
                      cond: { $eq: ["$$role.role", "user"] },
                    },
                  },
                  0,
                ],
              },
            },
            in: { $ifNull: ["$$user.count", 0] }, // Default to 0 if no users
          },
        },
      },
    },
    {
      $sort: { month: 1 }, // Sort by month in ascending order
    },
  ]);

  // Formatting the result to match the required structure
  const formattedResult = months.map((month, index) => {
    const data = result.find((r) => r.month === index + 1) || {
      month: index + 1,
      user: 0,
      driver: 0,
      ootms: 0,
    };
    return {
      month: month,
      user: data.userCount || 0,
      driver: data.driverCount || 0,
      ootms: data.ootms || 0, // Assuming ootms data is from somewhere else if needed
    };
  });

  return formattedResult;
};

const checkForUserWithGroup = async (searchQuery) => {
  try {
    const regex = new RegExp(".*" + searchQuery + ".*", "i");

    // Perform aggregation
    const result = await User.aggregate([
      // Step 1: Match the user in the User collection
      {
        $match: {
          $or: [{ fullName: { $regex: regex } }, { email: { $regex: regex } }],
        },
      },
      {
        $limit: 3, // Limit to three users match
      },
      // Step 2: Lookup to check group membership
      {
        $lookup: {
          from: "groups", // Collection name for Group
          localField: "_id",
          foreignField: "participants",
          as: "userGroups",
        },
      },
      // Step 3: Unwind userGroups to handle empty or null arrays
      {
        $unwind: {
          path: "$userGroups",
          preserveNullAndEmptyArrays: true, // Allow users with no groups
        },
      },
      // Step 4: Add a field for group membership status
      {
        $addFields: {
          isInGroup: {
            $cond: {
              if: { $ifNull: ["$userGroups", false] },
              then: true,
              else: false,
            },
          },
        },
      },
      // Step 5: Project the required fields
      {
        $project: {
          _id: 1,
          fullName: 1,
          image: 1,
          isInGroup: 1,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return { message: "User not found", data: null }; // Return when no user is matched
    }

    return { message: "Users found", data: result }; // Return matched users' details
  } catch (error) {
    console.error("Error in checkForUserWithGroup:", error);
    return { message: "An error occurred", data: null };
  }
};

const acceptDriverVerification = async (token, payload) => {
  const { userId, validDriver, isOnDuty } = payload;
  const decodedToken = decode(token, process.env.SECRET_KEY);

  if (decodedToken.role !== "admin") {
    throw new Error("You are not authorized to perform this action");
  }

  const driver = await User.findById(userId);
  if (!driver) {
    throw new Error("Driver not found");
  }

  const result = await User.findByIdAndUpdate(
    userId,
    { $set: { validDriver: validDriver } },
    { new: true }
  );
  return result;
};

// const activeOnDutyStatus = async (userId, payload) => {
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new Error("User not found");
//   }

//   if (user.role !== "driver") {
//     throw new Error("You are not authorized to perform this action");
//   }

//   const truckId = payload?.truckId;
//   const trailerId = payload?.trailerId;

//   let result;
//   let findTruck;
//   let truckUpdatedResult;

//   if (payload.isOnDuty) {
//     // const [findTruckFromEquipment, findTrailerIdFromEquipment] =
//     //   await Promise.all([
//     //     Equipment.findOne({ _id: truckId, driver: userId }),
//     //     Equipment.findOne({
//     //       _id: trailerId,
//     //       driver: userId,
//     //       trailerSize: { $gt: 0 },
//     //       palletSpace: { $gt: 0 },
//     //     }),
//     //   ]);

//     truckUpdatedResult = await equipmentUtils(truckId, trailerId, user);

//     // if (!findTruckFromEquipment) {
//     //   throw new ApiError(httpStatus.NOT_FOUND, "No Truck found");
//     // }

//     // if (!findTrailerIdFromEquipment) {
//     //   throw new ApiError(
//     //     httpStatus.NOT_FOUND,
//     //     "You have no trailer and pallet space"
//     //   );
//     // }

//     const mySubscription = await MySubscription.findOne({ user: userId });
//     if (!mySubscription) {
//       throw new ApiError(httpStatus.NOT_FOUND, "You have no subscription");
//     }

//     if (mySubscription.expiryDate < new Date()) {
//       throw new ApiError(httpStatus.NOT_FOUND, "Your subscription has expired");
//     }
//     console.log(truckUpdatedResult._id);

//     result = await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: {
//           location: payload.location,
//           isOnDuty: payload.isOnDuty,
//           truckOnDuty: truckUpdatedResult?.findTruck?._id,
//         },
//       },
//       { new: true }
//     );

//     // const addTruckData = {
//     //   driver: userId,
//     //   cdlNumber: findTruckFromEquipment?.cdlNumber,
//     //   truckNumber: findTruckFromEquipment.truckNumber,
//     //   trailerSize: findTrailerIdFromEquipment.trailerSize,
//     //   palletSpace: findTrailerIdFromEquipment.palletSpace,
//     //   weight: findTrailerIdFromEquipment.weight,
//     //   availablePalletSpace: findTrailerIdFromEquipment.palletSpace,
//     // };

//     // findTruck = await Truck.findOne({
//     //   driver: userId,
//     //   cdlNumber: findTruckFromEquipment?.cdlNumber,
//     //   truckNumber: findTruckFromEquipment.truckNumber,
//     // });

//     // if (findTruck) {
//     //   await Truck.findByIdAndUpdate(
//     //     findTruck._id,
//     //     {
//     //       $set: {
//     //         palletSpace: findTrailerIdFromEquipment.palletSpace,
//     //         trailerSize: findTrailerIdFromEquipment.trailerSize,
//     //         availablePalletSpace: findTrailerIdFromEquipment.palletSpace,
//     //         weight: findTrailerIdFromEquipment.weight,
//     //       },
//     //     },
//     //     { new: true }
//     //   );
//     // }
//     // if (!findTruck) {
//     //   await Truck.create(addTruckData);
//     // }

//     // truckUpdatedResult = await Truck.findOne({
//     //   driver: userId,
//     //   cdlNumber: findTruckFromEquipment.cdlNumber,
//     //   truckNumber: findTruckFromEquipment.truckNumber,
//     // });
//   }

//   result = await User.findByIdAndUpdate(
//     userId,
//     {
//       $set: { isOnDuty: payload.isOnDuty },
//     },
//     { new: true }
//   );

//   return { result, findTruck: truckUpdatedResult?.findTruck };
// };

const activeOnDutyStatus = async (userId, payload) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "driver") {
    throw new Error("You are not authorized to perform this action");
  }

  if (!user.validDriver) {
    throw new Error(
      "You are not valid driver , please try again when admin will approve "
    );
  }

  const truckId = payload?.truckId;
  const trailerId = payload?.trailerId;

  let result;
  let findTruck;
  let truckUpdatedResult;

  if (payload.isOnDuty) {
    const [findTruckFromEquipment, findTrailerIdFromEquipment] =
      await Promise.all([
        Equipment.findOne({ _id: truckId, driver: userId }),
        Equipment.findOne({
          _id: trailerId,
          driver: userId,
          trailerSize: { $gt: 0 },
          palletSpace: { $gt: 0 },
        }),
      ]);

    if (!findTruckFromEquipment) {
      throw new ApiError(httpStatus.NOT_FOUND, "No Truck found");
    }

    if (!findTrailerIdFromEquipment) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "You have no trailer and pallet space"
      );
    }

    // const mySubscription = await MySubscription.findOne({ user: userId });
    // if (!mySubscription) {
    //   throw new ApiError(httpStatus.NOT_FOUND, "You have no subscription");
    // }

    // if (mySubscription.expiryDate < new Date()) {
    //   throw new ApiError(httpStatus.NOT_FOUND, "Your subscription has expired");
    // }

    const addTruckData = {
      driver: userId,
      cdlNumber: findTruckFromEquipment?.cdlNumber,
      truckNumber: findTruckFromEquipment.truckNumber,
      trailerSize: findTrailerIdFromEquipment.trailerSize,
      palletSpace: findTrailerIdFromEquipment.palletSpace,
      weight: findTrailerIdFromEquipment.weight,
      availablePalletSpace: findTrailerIdFromEquipment.palletSpace,
    };

    findTruck = await Truck.findOne({
      driver: userId,
      cdlNumber: findTruckFromEquipment?.cdlNumber,
      truckNumber: findTruckFromEquipment.truckNumber,
    });

    let truckResult;
    if (findTruck) {
      truckResult = await Truck.findByIdAndUpdate(
        findTruck._id,
        {
          $set: {
            palletSpace: findTrailerIdFromEquipment.palletSpace,
            trailerSize: findTrailerIdFromEquipment.trailerSize,
            availablePalletSpace: findTrailerIdFromEquipment.palletSpace,
            weight: findTrailerIdFromEquipment.weight,
          },
        },
        { new: true }
      );
    }

    if (!findTruck) {
      truckResult = await Truck.create(addTruckData);
    }

    result = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          location: payload.location,
          isOnDuty: payload.isOnDuty,
          truckOnDuty: truckResult._id,
        },
      },
      { new: true }
    );

    truckUpdatedResult = await Truck.findOne({
      driver: userId,
      cdlNumber: findTruckFromEquipment.cdlNumber,
      truckNumber: findTruckFromEquipment.truckNumber,
    });
  }

  result = await User.findByIdAndUpdate(
    userId,
    {
      $set: { isOnDuty: payload.isOnDuty },
    },
    { new: true }
  );

  return { result, findTruck: truckUpdatedResult };
};
const allDriverRequestQuery = async (query) => {
  const page = query.page || 1;
  const limit = query.limit || 10;

  const skip = (Number(page) - 1) * Number(limit);

  const result = await User.aggregate([
    { $match: { role: "driver" } },
    {
      $match: {
        $and: [{ validDriver: false }, { isComplete: true }],
      },
    },

    {
      $lookup: {
        from: "equipment",
        foreignField: "driver",
        localField: "_id",
        as: "truck",
      },
    },

    {
      $unwind: "$truck",
    },

    {
      $match: {
        "truck.type": "truck", // Only select documents where the truck type is "truck"
      },
    },

    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  // Optionally, include total count for pagination meta info
  const totalResults = await User.countDocuments({
    role: "driver",
    validDriver: false,
    isComplete: true,
  });
  const totalPages = Math.ceil(totalResults / Number(limit));

  return {
    data: result,
    pagination: {
      page,
      limit,
      totalPages,
      totalResults,
    },
  };
};

const deleteDriverService = async (req) => {
  if (req.User.role !== "admin") {
    throw new Error("You are not authorized to perform this action");
  }
  const { id } = req.params;
  const result = await User.findByIdAndDelete(id);
  return result;
};

module.exports = {
  getUserById,
  updateUser,
  getUserByEmail,
  deleteAccount,
  getUsers,
  getSpecificDetails,
  getMonthlyUserootmsRatio,
  checkForUserWithGroup,
  addMoreUserFeild,
  getUserByfilter,
  acceptDriverVerification,
  activeOnDutyStatus,
  allDriverRequestQuery,
  deleteDriverService,
};
