const httpStatus = require("http-status");
const ApiError = require("../../helpers/ApiError");
const PreferredDriver = require("./preferredDriver.model");
const { default: mongoose } = require("mongoose");
const User = require("../User/user.model");
const Truck = require("../TruckDetails/truckDetails.model");

// const addPreferredDriver = async (preferredDriverBody) => {
//   let existingPreferredDriver = await findPreferredDriver(preferredDriverBody);
//   if (existingPreferredDriver) {
//     throw {
//       statusCode: httpStatus.ALREADY_REPORTED,
//       message: 'Preferred Driver already exists',
//       type: 'Preferred Driver',
//     };
//   }
//   existingPreferredDriver = new PreferredDriver(preferredDriverBody);
//   const lastId = await existingPreferredDriver.save();
//   const pipeline = [
//     {
//       $match: {
//         _id: new mongoose.Types.ObjectId(String(lastId._id))
//       }
//     },

//     {
//       $lookup: {
//         from: 'users',
//         localField: 'driver',
//         foreignField: '_id',
//         as: 'driverInfo',
//       },
//     },
//     { $unwind: '$driverInfo' },
//     // ...(searchQuery
//     //   ? [
//     //     {
//     //       $match: {
//     //         'driverInfo.phoneNumber': { $regex: searchQuery, $options: 'i' },
//     //       },
//     //     },
//     //   ]
//     //   : []),

//     {
//       $project: {
//         _id: 1,
//         user: 1,
//         driverInfo: 1,
//       },
//     },
//   ];

//   const result = await PreferredDriver.aggregate(pipeline);
//   return result
// };

const addPreferredDriver = async (preferredDriverBody) => {
  const session = await mongoose.startSession(); // Start a new session for the transaction
  session.startTransaction();

  try {
    // Check if the preferred driver already exists
    let existingPreferredDriver = await PreferredDriver.findOne({
      user: preferredDriverBody.user,
      driver: preferredDriverBody.driver,
    }).session(session); // Use session explicitly

    if (existingPreferredDriver) {
      throw {
        statusCode: httpStatus.ALREADY_REPORTED,
        message: "Preferred Driver already exists",
        type: "Preferred Driver",
      };
    }

    // Create a new preferred driver document
    const newPreferredDriver = new PreferredDriver(preferredDriverBody);
    const savedPreferredDriver = await newPreferredDriver.save({ session }); // Save within the transaction

    // Aggregation pipeline to fetch related driver info
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(savedPreferredDriver._id)),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "driver",
          foreignField: "_id",
          as: "driverInfo",
        },
      },
      { $unwind: "$driverInfo" },
      {
        $project: {
          _id: 1,
          user: 1,
          driverInfo: 1,
        },
      },
    ];

    const result = await PreferredDriver.aggregate(pipeline).session(session);

    // Commit the transaction if all operations succeed
    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    throw error; // Re-throw the error to propagate it
  }
};

const findPreferredDriver = async (preferredDriverBody) => {
  return await PreferredDriver.findOne({
    user: preferredDriverBody.user,
    driver: preferredDriverBody.driver,
  });
};

const getAllPreferredDrivers = async (searchQuery = "", options = {}, user) => {
  const page = options.page;
  const limit = options.limit;
  const skip = (page - 1) * limit;

  const searchableFields = ["phoneNumber", "email", "fullName", "address"];

  let filter = {};
  filter = {
    $and: [{ role: "driver" }, { isComplete: true }, { validDriver: true }],
  };

  if (searchQuery) {
    filter = {
      ...filter,
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchQuery, $options: "i" },
      })),
    };
  }

  // Build the aggregation pipeline
  const pipeline = [
    {
      // $match: {
      //   $and: [{ role: "driver" }, { isComplete: true }],
      // },
      $match: {
        ...filter,
      },
    },
    // ...(searchQuery
    //   ? [
    //       {
    //         $match: {
    //           phoneNumber: { $regex: searchQuery, $options: "i" },
    //         },
    //       },
    //     ]
    //   : []),
    {
      $project: {
        __v: 0,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ];

  // Execute the pipeline
  const result = await User.aggregate(pipeline);
  const totalCountPipeline = [
    {
      // $match: {
      //   $and: [{ role: "driver" }, { isComplete: true }],
      // },
      $match: {
        ...filter,
      },
    },
    // ...(searchQuery
    //   ? [
    //       {
    //         $match: {
    //           phoneNumber: { $regex: searchQuery, $options: "i" },
    //         },
    //       },
    //     ]
    //   : []),
  ];

  const resultWithTruck = await Promise.all(
    result.map(async (item) => {
      const truck = await Truck.findOne({ driver: item._id });
      return { ...item, truck };
    })
  );

  const totalResults = await User.aggregate(totalCountPipeline).count("count");

  const totalPages = Math.ceil((totalResults[0]?.count || 0) / limit);

  return {
    results: resultWithTruck,
    pagination: {
      totalResults: totalResults[0]?.count || 0,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};

const getALlMyPreferredDrivers = async (
  searchQuery = "",
  options = {},
  user
) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const pipeline = [
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
        as: "driverInfo",
      },
    },
    { $unwind: "$driverInfo" },
    ...(searchQuery
      ? [
          {
            $match: {
              "driverInfo.phoneNumber": { $regex: searchQuery, $options: "i" },
            },
          },
        ]
      : []),

    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        user: 1,
        driverInfo: 1,
      },
    },
  ];

  const result = await PreferredDriver.aggregate(pipeline);
  const totalPages = Math.ceil(result?.length / limit);
  return {
    results: result,
    pagination: {
      totalResults: result?.length,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};

module.exports = {
  addPreferredDriver,
  getAllPreferredDrivers,
  getALlMyPreferredDrivers,
};
