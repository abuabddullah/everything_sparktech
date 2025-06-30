const httpStatus = require('http-status');
const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
//defining unlinking image function 
const unlinkImage = require('../../helpers/unlinkImage')
const { getUserById, getUsers, updateUser, getMonthlyUserootmsRatio, addMoreUserFeild } = require('./user.service');
const { addManyTruckDetails } = require('../TruckDetails/truckDetails.service');



//Get user details
const userDetails = catchAsync(async (req, res) => {
  const userDetails = await getUserById(req.User._id);
  return res.status(httpStatus.OK).json(response({ statusCode: httpStatus.OK, message: req.t('user-details'), data: userDetails, status: "OK" }));
})

//Update user profile
// const updateProfile = catchAsync(async (req, res) => {
//   const user = await getUserById(req.User._id);
//   if (!user) {
//     return res.status(httpStatus.NOT_FOUND).json(response({ status: 'Error', statusCode: httpStatus.NOT_FOUND, type: 'user', message: req.t('user-not-exists') }));
//   }
//   console.log( req.body )
//   Object.assign(user, req.body);
//   console.log({ user })
//   console.log( req.body )
//   if (req.files) {
//     const { profileImage } = req.files;
//     if (profileImage && profileImage.length > 0) {
//       const defaultPath1 = '/uploads/users/user.png';
//       const defaultPath2 = '/uploads/users/user.jpg';
//       if (user.image !== defaultPath1 && user.image !== defaultPath2) {
//         unlinkImage(user.image);
//       }
//       user.image = `/uploads/users/${profileImage[0].filename}`
//     }
//   }
//   const updatedUser = await updateUser(user);
//   return res.status(httpStatus.OK).json(response({ status: 'OK', statusCode: httpStatus.OK, type: 'user', message: req.t('user-updated'), data: updatedUser }));
// })
const updateProfile = catchAsync(async (req, res) => {
  const user = await getUserById(req.User._id);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json(response({ 
      status: 'Error', 
      statusCode: httpStatus.NOT_FOUND, 
      type: 'user', 
      message: req.t('user-not-exists') 
    }));
  }

  if (req.files) {
    const { profileImage } = req.files;
    if (profileImage && profileImage.length > 0) {
      const defaultPath1 = '/uploads/users/user.png';
      const defaultPath2 = '/uploads/users/user.jpg';
      if (user.image !== defaultPath1 && user.image !== defaultPath2) {
        unlinkImage(user.image);
      }
      req.body.image = `/uploads/users/${profileImage[0].filename}`;
    }
  }

  const updatedUser = await updateUser(user._id, req.body);
  if (!updatedUser) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(response({ 
      status: 'Error', 
      statusCode: httpStatus.INTERNAL_SERVER_ERROR, 
      type: 'user', 
      message: req.t('update-failed') 
    }));
  }

  return res.status(httpStatus.OK).json(response({ 
    status: 'OK', 
    statusCode: httpStatus.OK, 
    type: 'user', 
    message: req.t('user-updated'), 
    data: updatedUser 
  }));
});


//Get all users
const allUsers = catchAsync(async (req, res) => {
  let filters = {};
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  }

  const role = req.query.role;
  if (role && role !== null && role !== 'null' && role !== '' && role !== undefined && role !== 'undefined') {
    filters.role = role;
  }

  const search = req.query.search;
  if (search && search !== 'null' && search !== '' && search !== undefined && search !== 'undefined') {
    const searchRegExp = new RegExp('.*' + search + '.*', 'i');
    filters = {
      ...filters,
      $or: [
        { fullName: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phoneNumber: { $regex: searchRegExp } }
      ],
    };
  }
  const users = await getUsers(filters, options);
  return res.status(httpStatus.OK).json(response({ statusCode: httpStatus.OK, message: req.t('users-list'), data: users, status: 'OK' }));
})


//Get user to rooms ratio
const userRatio = catchAsync(async (req, res) => {
  console.log(req.User.role);
  if (req.User.role == 'admin') {
    const ratio = await getMonthlyUserootmsRatio(req.body.year);
    return res.status(httpStatus.OK).json(response({ statusCode: httpStatus.OK, message: req.t('user-ratio'), data: ratio, status: 'ok' }));
  } else {
    return res.status(httpStatus.UNAUTHORIZED).json(response({ status: 'Error', statusCode: '403', type: 'user', message: req.t('unauthorized') }));
  }
})


//Complete account
const completeAccount = catchAsync(async (req, res) => {
  if (req.User.role === 'user') {
    var { phoneNumber, taxid, address } = req.body;
    const userId = req.User._id;
    const userInfo = { phoneNumber, taxid, address };
    const user = await addMoreUserFeild(userId, userInfo);
    return res.status(httpStatus.CREATED).json(response({ status: 'OK', statusCode: httpStatus.CREATED, type: 'user', message: " Account completed Successfully", data: user }));
  } else if (req.User.role === 'driver') {
    const { phoneNumber, address, truckNumber, trailerSize, palletSpace, cdlNumber } = req.body;
    const driver = req.User._id;
    const truckInfo = { driver, truckNumber, trailerSize, palletSpace, cdlNumber };
    const userInfo = { address, phoneNumber };
    const truck = await addManyTruckDetails(truckInfo);
    const newProfile = await addMoreUserFeild(driver, userInfo);
    return res.status(httpStatus.CREATED).json( response({ status: 'OK', statusCode: httpStatus.CREATED, message: 'Account completed successfully', data: { type: 'user', attributes: { truck, newProfile }, }, errors: [],})
    );
  }
});




module.exports = { userDetails, updateProfile, allUsers, userRatio, completeAccount }