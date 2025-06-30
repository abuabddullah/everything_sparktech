const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
//defining unlinking image function
const unlinkImage = require("../../helpers/unlinkImage");
const {
  getUserById,
  getUsers,
  updateUser,
  getMonthlyUserootmsRatio,
  addMoreUserFeild,
  acceptDriverVerification,
  deleteAccount,
  activeOnDutyStatus,
  allDriverRequestQuery,
  deleteDriverService,
} = require("./user.service");
const {
  addManyTruckDetails,
  getTransport,
} = require("../TruckDetails/truckDetails.service");
const { addManyEquipmentDetails } = require("../Equipment/equipment.service");
const { error } = require("winston");
const User = require("./user.model");

//Get user details
const userDetails = catchAsync(async (req, res) => {
  const userDetails = await getUserById(req.User._id);
  const truckDetails = (await getTransport?.({ driver: req.User._id })) || null;
  return res.status(httpStatus.OK).json(
    response({
      statusCode: httpStatus.OK,
      message: req.t("user-details"),
      data: { userDetails, truckDetails },
      status: "OK",
    })
  );
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await getUserById(req.User._id);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        type: "user",
        message: req.t("user-not-exists"),
      })
    );
  }

  if (req.files) {
    const { profileImage } = req.files;
    if (profileImage && profileImage.length > 0) {
      const defaultPath1 = "/uploads/users/user.png";
      const defaultPath2 = "/uploads/users/user.jpg";
      if (user.image !== defaultPath1 && user.image !== defaultPath2) {
        unlinkImage(user.image);
      }
      req.body.image = `/uploads/users/${profileImage[0].filename}`;
    }
  }

  const updatedUser = await updateUser(user._id, req.body);
  // const updatedTruck = await updateTruck(user._id, req.body);
  if (!updatedUser) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
      response({
        status: "Error",
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        type: "user",
        message: req.t("update-failed"),
      })
    );
  }

  return res.status(httpStatus.OK).json(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      type: "user",
      message: req.t("user-updated"),
      data: updatedUser,
      // data: []
    })
  );
});

//Get all users
const allUsers = catchAsync(async (req, res) => {
  let filters = {};
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };

  const role = req.query.role;
  if (
    role &&
    role !== null &&
    role !== "null" &&
    role !== "" &&
    role !== undefined &&
    role !== "undefined"
  ) {
    filters.role = role;
  }

  const search = req.query.search;
  if (
    search &&
    search !== "null" &&
    search !== "" &&
    search !== undefined &&
    search !== "undefined"
  ) {
    const searchRegExp = new RegExp(".*" + search + ".*", "i");
    filters = {
      ...filters,
      $or: [
        { fullName: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phoneNumber: { $regex: searchRegExp } },
      ],
    };
  }
  const users = await getUsers(filters, options);
  return res.status(httpStatus.OK).json(
    response({
      statusCode: httpStatus.OK,
      message: req.t("users-list"),
      data: users,
      status: "OK",
    })
  );
});

//Get user to rooms ratio
const userRatio = catchAsync(async (req, res) => {
  if (req.User.role == "admin") {
    const ratio = await getMonthlyUserootmsRatio(req.body.year);
    return res.status(httpStatus.OK).json(
      response({
        statusCode: httpStatus.OK,
        message: req.t("user-ratio"),
        data: ratio,
        status: "ok",
      })
    );
  } else {
    return res.status(httpStatus.UNAUTHORIZED).json(
      response({
        status: "Error",
        statusCode: "403",
        type: "user",
        message: req.t("unauthorized"),
      })
    );
  }
});

const completeAccount = catchAsync(async (req, res) => {
  const user = await getUserById(req.User?._id);

  console.log(user, "user");

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        type: "user",
        message: req.t("user-not-exists"),
      })
    );
  }

  if (req.files) {
    const { profileImage, certificateImage, cdlNumberVerificationImage } =
      req.files;

    if (profileImage?.[0]) {
      const defaultPath1 = "/uploads/users/user.png";
      const defaultPath2 = "/uploads/users/user.jpg";
      if (user.image !== defaultPath1 && user.image !== defaultPath2) {
        unlinkImage(user.image);
      }
      req.body.image = `/uploads/users/${profileImage[0].filename}`;
    }

    // if (certificateImage?.[0]) {
    //   req.body.document = `/uploads/users/${certificateImage[0].filename}`;
    // }

    if (cdlNumberVerificationImage?.[0]) {
      req.body.cdlNumberImage = `/uploads/users/${cdlNumberVerificationImage[0]?.filename}`;
    }
  }

  if (user.isComplete === false) {
    if (req.User.role === "user") {
      const { phoneNumber, taxid, address, image, document } = req.body;
      const userId = req.User?._id;
      const userInfo = {
        phoneNumber,
        image,
        document,
        taxid,
        address,
        isComplete: true,
      };
      const updatedUser = await addMoreUserFeild(userId, userInfo);
      return res.status(httpStatus.CREATED).json(
        response({
          status: "OK",
          statusCode: httpStatus.CREATED,
          type: "user",
          message: "Account completed successfully",
          data: updatedUser,
        })
      );
    } else if (req.User.role === "driver") {
      const {
        phoneNumber,
        address,
        image,
        cdlNumberImage,
        weight,
        truckNumber,
        trailerSize,
        palletSpace,
        cdlNumber,
      } = req.body;
      const driver = req.User?._id;
      const trailerInfo = {
        driver,
        type: "trailer",
        trailerSize,
        palletSpace,
        weight,
      };
      const truckInfo = { driver, type: "truck", truckNumber, cdlNumber };
      const userInfo = {
        address,
        image,
        phoneNumber,
        isComplete: true,
        cdlNumberImage: cdlNumberImage ? cdlNumberImage : " ",
      };
      const equipmentDetails = await addManyEquipmentDetails([
        trailerInfo,
        truckInfo,
      ]);
      const newProfile = await addMoreUserFeild(driver, userInfo);
      return res.status(httpStatus.CREATED).json(
        response({
          status: "OK",
          statusCode: httpStatus.CREATED,
          message: "Account completed successfully",
          data: {
            type: "user",
            attributes: { equipmentDetails, newProfile },
          },
        })
      );
    }
  } else {
    return res.status(httpStatus.BAD_REQUEST).json(
      response({
        status: "BAD_REQUEST",
        statusCode: httpStatus.BAD_REQUEST,
        message: "Failed to complete account",
      })
    );
  }
});

//driverRequest
const driverRequest = catchAsync(async (req, res) => {
  const filter = { user: req.User._id };
  const data = await getUsers();
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const acceptDriver = catchAsync(async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const data = await acceptDriverVerification(token, req.body);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const deleteUserAccount = catchAsync(async (req, res) => {
  const data = await deleteAccount(req.User);
  return res.status(200).json({
    status: "OK",
    statusCode: 204,
    message: "Account Delete successfully",
    data: data,
  });
});

const activeOnDuty = catchAsync(async (req, res) => {
  const user = await getUserById(req.User._id);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        type: "user",
        message: req.t("user-not-exists"),
      })
    );
  }
  const { result, findTruck } = await activeOnDutyStatus(user._id, req.body);
  return res.status(httpStatus.OK).json(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      type: "user",
      message: req.t("user-updated"),
      data: {
        result,
        findTruck,
      },
    })
  );
});

const allDriverRequest = catchAsync(async (req, res) => {
  const data = await allDriverRequestQuery(req.query);
  return res.status(200).json({
    status: "OK",
    statusCode: 200,
    message: "Load fetched successfully",
    data: data,
  });
});

const blockUser = catchAsync(async (req, res) => {
  const user = await getUserById(req.body.userId);

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        type: "user",
        message: req.t("user-not-exists"),
      })
    );
  }
  const { result } = await User.findByIdAndUpdate(user._id, {
    isBlocked: true,
  });
  return res.status(httpStatus.OK).json(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      type: "user",
      message: req.t("user-updated"),
      data: {
        result,
      },
    })
  );
});

const deleteDriver = catchAsync(async (req, res) => {
  const result = await deleteDriverService(req);

  if (!result) {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        type: "user",
        message: req.t("user-not-exists"),
      })
    );
  }

  return res.status(httpStatus.OK).json(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      type: "user",
      message: req.t("user-updated"),
      data: {
        result,
      },
    })
  );
});

module.exports = {
  userDetails,
  blockUser,
  updateProfile,
  allUsers,
  userRatio,
  completeAccount,
  driverRequest,
  acceptDriver,
  deleteUserAccount,
  activeOnDuty,
  allDriverRequest,
  deleteDriver,
};
