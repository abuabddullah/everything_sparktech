const TruckDetail = require("./truckDetails.model");
const User = require("../User/user.model");

const addManyTruckDetails = async (truckDetails) => {
  return await TruckDetail.insertMany(truckDetails);
};

const getTransport = async (truckDetails) => {
  return await TruckDetail.find(truckDetails);
};

const allAvailableTruck = async (query) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  // Get the total count of matching documents
  // const totalCount = await TruckDetail.aggregate([
  //   {
  //     $match: {
  //       $and: [{ trailerSize: { $gt: 0 } }, { palletSpace: { $gt: 0 } }],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "driver",
  //       foreignField: "_id",
  //       as: "driver",
  //     },
  //   },
  //   {
  //     $unwind: "$driver",
  //   },
  //   {
  //     $match: {
  //       $and: [{ "driver.isOnDuty": true }, { "driver.validDriver": true }],
  //     },
  //   },
  //   {
  //     $count: "total",
  //   },
  // ]);
  const totalCount = await TruckDetail.aggregate([
    {
      $match: {
        $and: [{ isOnDuty: true }, { validDriver: true }],
      },
    },

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
          { "truck.trailerSize": { $gt: 0 } },
          { "truck.availablePalletSpace": { $gt: 0 } },
        ],
      },
    },
    {
      $count: "total",
    },
  ]);

  console.log({ totalCount });

  // Extract total count
  const total = totalCount.length > 0 ? totalCount[0].total : 0;

  // Get paginated data
  // const truckDetails = await TruckDetail.aggregate([
  //   {
  //     $match: {
  //       $and: [{ trailerSize: { $gt: 0 } }, { palletSpace: { $gt: 0 } }],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "driver",
  //       foreignField: "_id",
  //       as: "driver",
  //     },
  //   },
  //   {
  //     $unwind: "$driver",
  //   },
  //   {
  //     $match: {
  //       $and: [{ "driver.isOnDuty": true }, { "driver.validDriver": true }],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "trucks",
  //       localField: "driver.truckOnDuty",
  //       foreignField: "_id",
  //       as: "truckOnDuty",
  //     },
  //   },
  //   {
  //     $unwind: "$truckOnDuty",
  //   },

  //   {
  //     $project: {
  //       _id: 0,
  //       driverInfo: {
  //         driverName: "$driver.fullName", // Adjust this to the actual name field
  //         driverId: "$driver._id",
  //         image: "$driver.image",
  //       },
  //       // truckOnDuty: 1,
  //       weight: "$truckOnDuty.weight",
  //       location: "$truckOnDuty.location",
  //       cdlNumber: "$truckOnDuty.cdlNumber",
  //       truckNumber: "$truckOnDuty.truckNumber",
  //       trailerSize: "$truckOnDuty.trailerSize",
  //       palletSpace: "$truckOnDuty.palletSpace",
  //       availablePalletSpace: "$truckOnDuty.availablePalletSpace",
  //       // driverName: '$driver.fullName', // Adjust this to the actual name field
  //       // driverId: '$driver._id', // Adjust this to the actual name field
  //       // weight: 1,
  //       // location: 1,
  //       // cdlNumber: 1,
  //       // truckNumber: 1,
  //       // trailerSize: 1,
  //       // palletSpace: 1,
  //       // availablePalletSpace: 1,
  //     },
  //   },
  //   {
  //     $skip: Number(skip), // Skip the specified number of documents
  //   },
  //   {
  //     $limit: Number(limit), // Limit the number of documents returned
  //   },
  // ]);

  const truckDetails = await User.aggregate([
    {
      $match: {
        $and: [{ isOnDuty: true }, { validDriver: true }],
      },
    },

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
          { "truck.trailerSize": { $gt: 0 } },
          { "truck.availablePalletSpace": { $gt: 0 } },
        ],
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id from result if not needed
        driverInfo: {
          driverName: "$fullName", // Correct field reference
          driverId: "$_id",
          image: "$image",
        },
        weight: "$truck.weight",
        location: "$truck.location",
        cdlNumber: "$truck.cdlNumber",
        truckNumber: "$truck.truckNumber",
        trailerSize: "$truck.trailerSize",
        palletSpace: "$truck.palletSpace",
        availablePalletSpace: "$truck.availablePalletSpace",
      },
    },

    {
      $skip: Number(skip), // Skip the specified number of documents
    },
    {
      $limit: Number(limit), // Limit the number of documents returned
    },
  ]);

  // Return both data and pagination info
  return {
    data: truckDetails,
    pagination: {
      totalResults: Number(total), // Total number of matching documents
      currentPage: Number(page), // Current page
      limit: Number(limit), // Number of documents per page
      totalPages: Math.ceil(total / limit), // Total number of pages
    },
  };
};

const deleteTruckById = async (id) => {
  return await TruckDetail.findByIdAndDelete(id);
};

// const updateTruck = async (userId, userBody) => {
//   const truck = await TruckDetail.findOne({ driver: userId });
//   if (truck) {
//     return await TruckDetail.findByIdAndUpdate(truck._id, userBody, { new: true });
//   }else{
//     return null;
//   }
// };

module.exports = {
  addManyTruckDetails,
  allAvailableTruck,
  getTransport,
  deleteTruckById,
};
