const { default: mongoose } = require("mongoose");
const LoadRequest = require("../LoadRequest/loadRequest.model");

const findShipments = async (req, status) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const role = req.User.role;
  const { searchTerm, id } = req.query;

  const searchableFields = [
    "load.billOfLading",
    "load.shipperName",
    "load.receiverName",
    "driver.fullName",
  ];

  const roleField = role === "driver" ? "driver" : "user";
  const matchConditions = {
    [roleField]: new mongoose.Types.ObjectId(String(req.User._id)),
    $or: [...status],
  };

  if (id && typeof id === "string") {
    matchConditions._id = new mongoose.Types.ObjectId(String(id)); // Fix incorrect push
  }

  if (searchTerm && typeof searchTerm === "string") {
    matchConditions.$or.push({
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    });
  }

  const aggregationPipeline = [
    { $match: matchConditions },
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
  ];

  if (searchTerm && typeof searchTerm === "string") {
    aggregationPipeline.push({
      $match: {
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: "i" },
        })), // Case-insensitive regex match
      },
    });
  }

  // Pagination and metadata
  aggregationPipeline.push(
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
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
          hasNextPage: {
            $gt: ["$metadata.total", { $multiply: [page, limit] }],
          },
          hasPreviousPage: { $gt: [page, 1] },
        },
      },
    }
  );

  const result = await LoadRequest.aggregate(aggregationPipeline);
  const formattedResponse = {
    attributes: {
      loadRequests:
        result[0]?.data.map((item) => ({
          _id: item._id,
          status: item.status,
          user: {
            _id: item.user._id,
            fullName: item.user.fullName,
            image: item.user.image,
            ratings: item.user.ratings,
          },
          driver: {
            _id: item.driver._id,
            fullName: item.driver.fullName,
            email: item.driver.email,
            image: item.driver.image,
            address: item.driver.address,
            phoneNumber: item.driver.phoneNumber,
            location: item.driver.location,
            ratings: item.user.ratings,
          },
          sender: String(item.user._id),
          load: item.load,
          truck: {
            _id: item.truck._id,
            truckNumber: item.truck.truckNumber,
            trailerSize: item.truck.trailerSize,
          },
          shippingId: item.shippingId || "",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })) || [],
      pagination: result[0]?.pagination || {
        currentPage: page,
        totalPages: 0,
        totalResults: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    errors: [],
  };

  return formattedResponse;
};

module.exports = {
  findShipments,
};
