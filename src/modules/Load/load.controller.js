const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const {
  getLoad,
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
} = require("./load.service");
const { getTransport } = require("../TruckDetails/truckDetails.service");
const User = require("../User/user.model");
const Receiver = require("../Receiver/receiver.model");
const Load = require("./load.model");
const fs = require("fs");
const xlsx = require("xlsx");
const axios = require("axios");
const { generateReceiverId } = require("./load.utils");

const addLoadWithXlxs = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded" });
  }

  const filePath = req.file.path; // Dynamic file path for the uploaded file

  // Function to parse the uploaded Excel file
  // function parseExcelToJSON(filePath) {
  //   try {
  //     const fileBuffer = fs.readFileSync(filePath);

  //     const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  //     const sheetName = workbook.SheetNames[0];

  //     // Read sheet as an array of arrays
  //     const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
  //       header: 1,
  //       raw: true,
  //     });

  //     const [headerRow, ...rows] = rawData;

  //     // Split headers properly
  //     const headers = headerRow.map((header) => header.trim());

  //     // Parse rows into structured objects
  //     const parsedData = rows.map((row) => {
  //       const rowObj = headers.reduce((obj, header, index) => {
  //         let fieldValue = row[index] || "";

  //         // Ensure fieldValue is a string before processing
  //         fieldValue = fieldValue?.toString().trim();

  //         // Handle escaped quotation marks and newlines
  //         if (typeof fieldValue === "string") {
  //           if (fieldValue.startsWith('"') && fieldValue.endsWith('"')) {
  //             fieldValue = fieldValue.slice(1, -1).replace(/""/g, '"'); // Unescape double quotes
  //           }
  //         }

  //         // Convert comma-separated fields into arrays
  //         obj[header] = fieldValue.includes(",")
  //           ? fieldValue.split(",").map((item) => item.trim())
  //           : fieldValue;

  //         return obj;
  //       }, {});

  //       // Add Google Maps location formatting
  //       if (
  //         rowObj.receiver_latitude &&
  //         rowObj.receiver_longitude &&
  //         rowObj.shipper_latitude &&
  //         rowObj.shipper_longitude
  //       ) {
  //         rowObj.receiverLocation = {
  //           coordinates: [
  //             parseFloat(rowObj.receiver_longitude),
  //             parseFloat(rowObj.receiver_latitude),
  //           ],
  //         };
  //         rowObj.shipperLocation = {
  //           coordinates: [
  //             parseFloat(rowObj.shipper_longitude),
  //             parseFloat(rowObj.shipper_latitude),
  //           ],
  //         };

  //         // Remove original latitude and longitude fields if needed
  //         delete rowObj.receiver_latitude;
  //         delete rowObj.receiver_longitude;
  //         delete rowObj.shipper_latitude;
  //         delete rowObj.shipper_longitude;
  //       }

  //       return rowObj;
  //     });

  //     return parsedData;
  //   } catch (error) {
  //     console.error("Error processing the Excel file:", error);
  //     throw new Error("Error processing the Excel file");
  //   }
  // }

  function parseExcelToJSON(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);

      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];

      // Read sheet as an array of arrays
      const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        raw: true,
      });

      const [headerRow, ...rows] = rawData;

      // Split headers properly
      const headers = headerRow.map((header) => header.trim());

      // Fields that should remain as strings
      const stringFields = ["pickupDate", "deliveryDate"];

      // Parse rows into structured objects
      const parsedData = rows.map((row) => {
        const rowObj = headers.reduce((obj, header, index) => {
          let fieldValue = row[index] || "";

          // Ensure fieldValue is a string before processing
          fieldValue = fieldValue?.toString().trim();

          // Handle escaped quotation marks and newlines
          if (typeof fieldValue === "string") {
            if (fieldValue.startsWith('"') && fieldValue.endsWith('"')) {
              fieldValue = fieldValue.slice(1, -1).replace(/""/g, '"'); // Unescape double quotes
            }
          }

          // Handle string fields separately
          obj[header] = stringFields.includes(header)
            ? fieldValue // Keep these fields as strings
            : fieldValue.includes(",")
            ? fieldValue.split(",").map((item) => item.trim())
            : fieldValue;

          return obj;
        }, {});

        // Add Google Maps location formatting
        if (
          rowObj.receiver_latitude &&
          rowObj.receiver_longitude &&
          rowObj.shipper_latitude &&
          rowObj.shipper_longitude
        ) {
          rowObj.receiverLocation = {
            coordinates: [
              parseFloat(rowObj.receiver_longitude),
              parseFloat(rowObj.receiver_latitude),
            ],
          };
          rowObj.shipperLocation = {
            coordinates: [
              parseFloat(rowObj.shipper_longitude),
              parseFloat(rowObj.shipper_latitude),
            ],
          };

          // Remove original latitude and longitude fields if needed
          delete rowObj.receiver_latitude;
          delete rowObj.receiver_longitude;
          delete rowObj.shipper_latitude;
          delete rowObj.shipper_longitude;
        }

        return rowObj;
      });

      return parsedData;
    } catch (error) {
      console.error("Error processing the Excel file:", error);
      throw new Error("Error processing the Excel file");
    }
  }

  try {
    const parsedData = parseExcelToJSON(filePath);

    const enrichedData = parsedData.map((item) => ({
      ...item,
      user: req.User._id,
    }));

    const loadDetails = await addManyLoadDetails(enrichedData, req.User, res);

    await generateReceiverId(loadDetails);

    return res.status(201).json(
      response({
        status: "OK",
        statusCode: httpStatus.CREATED,
        type: "load-details",
        message: req.t("load-details-added"),
        data: loadDetails,
      })
    );
  } catch (error) {
    return res.status(httpStatus.FORBIDDEN).json(
      response({
        status: "Forbidden",
        statusCode: httpStatus.FORBIDDEN,
        message: req.t(error.message || "Error processing the Excel file"),
      })
    );
  }
});

const addNewLoadDetails = catchAsync(async (req, res) => {
  const { role, _id: userId } = req.User;

  if (role === "user") {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json(
        response({
          status: "Error",
          statusCode: "400",
          type: "load-details",
          message: req.t("load-details-required"),
        })
      );
    }
    const enrichedData = req.body.map((item) => ({
      ...item,
      user: userId,
    }));

    const loadDetails = await addManyLoadDetails(enrichedData, req.User, res);

    await generateReceiverId(loadDetails);

    return res.status(201).json(
      response({
        status: "OK",
        statusCode: "201",
        type: "load-details",
        message: req.t("load-details-added"),
        data: loadDetails,
      })
    );
  } else {
    return res.status(httpStatus.FORBIDDEN).json(
      response({
        status: "Forbidden",
        statusCode: httpStatus.FORBIDDEN,
        message: req.t("unauthorized-action"),
      })
    );
  }
});

const loadDetails = catchAsync(async (req, res) => {
  const query = { _id: req.params.id };

  // Populate options
  const populateOptions = {
    userFields: "fullName email image phoneNumber address",
    driverFields: "fullName email image licenseNumber phoneNumber",
    loadFields: `
      shipperName trailerSize productType palletSpace shipperEmail shipperPhoneNumber shippingAddress 
      receiverPhoneNumber receiverEmail receiverName receivingAddress deliveryDate pickupDate loadType 
      weight Hazmat description shippingCity shippingState shippingZip receiverCity receiverState 
      receiverZip receiverpostalCode billOfLading deliveryInstruction
    `,
    populateUser: true,
    populateDriver: true,
  };

  const options = { page: 1, limit: 1 };

  try {
    const { results, pagination } = await findLoadDetails(
      query,
      populateOptions,
      options
    );

    if (!results || results.length === 0) {
      return res.status(404).json(
        response({
          status: "ERROR",
          statusCode: "404",
          message: "Load not found",
        })
      );
    }

    const driverId = results[0].driver._id;
    const TruckData = await getTransport({ driver: driverId });
    return res.status(200).json(
      response({
        status: "OK",
        statusCode: "200",
        message: "Load fetched successfully",
        data: {
          loadDetails: results[0],
          truckDetails: TruckData,
        },
        pagination,
      })
    );
  } catch (error) {
    return res.status(500).json(
      response({
        status: "ERROR",
        statusCode: "500",
        message: "Failed to fetch load details",
        error: error.message,
      })
    );
  }
});

//get all loads
const usersAllLoad = catchAsync(async (req, res) => {
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    searchTerm: req.query.searchTerm || "",
  };
  const data = await getLoads(req.User, options);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const nearestLoads = catchAsync(async (req, res) => {
  const data = await getNearestLoads(req?.body);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const findByBolNumber = catchAsync(async (req, res) => {
  const bolNumber = req.query.bolNumber;
  const data = await findByBolNumberService(bolNumber, req.User);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const findNearestDriver = catchAsync(async (req, res) => {
  const { lastLoadId } = req.query;
  const data = await findNearestDriverService(lastLoadId);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const pendingShipment = catchAsync(async (req, res) => {
  const data = await getPendingShipmentsService(req);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const findNearestDriverForUser = catchAsync(async (req, res) => {
  const { userLocation } = req.body;
  const data = await findNearestDriverForUserService(userLocation, req.User);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const findLoadBySourceDestination = catchAsync(async (req, res) => {
  const data = await findLoadBySourceDestinationService(req.body);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const findDriverByRecentDriverLocation = catchAsync(async (req, res) => {
  const data = await findDriverByRecentDriverLocationService(req.query);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "driver fetched successfully",
    data: data,
  });
});

const updateLoadDetails = catchAsync(async (req, res) => {
  console.log("request ====>", req);
  console.log("user ====>", req.User);
  console.log("data ====>", req.body);
  const data = await updateLoadDetailsService(req);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load updated successfully",
    data: data,
  });
});

const deletePendingLoad = catchAsync(async (req, res) => {
  const data = await deletePendingLoadService(req);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load deleted successfully",
    data: data,
  });
});

module.exports = {
  addNewLoadDetails,
  addLoadWithXlxs,
  loadDetails,
  usersAllLoad,
  nearestLoads,
  findByBolNumber,
  findNearestDriver,
  pendingShipment,
  findNearestDriverForUser,
  findLoadBySourceDestination,
  findDriverByRecentDriverLocation,
  updateLoadDetails,
  deletePendingLoad
};
