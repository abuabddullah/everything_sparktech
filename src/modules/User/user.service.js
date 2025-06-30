const User = require('./user.model');

const getUserById = async (id) => {
  return await User.findById(id);
}

const getSpecificDetails = async (id, select) => {
  return await User.findById(id).select(select);
}

const getUserByEmail = async (email) => {
  return await User.findOne({ email });
}

const deleteAccount = async (userId) => {
  const userData = await User.findById(userId);
  if (userData) {
    userData.email = userData.email + " (Account is deleted), Joining Time: " + userData.createdAt;
    userData.fullName = "Dialogi User"
    userData.image = `/uploads/users/deletedAccount.png`
    userData.isDeleted = true;
    userData.save();
  }
  return
}

const updateUser = async (userId, userbody) => {
  return await User.findByIdAndUpdate(userId, userbody, { new: true });
}

const addMoreUserFeild = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  console.log('Before update:', user);
  Object.assign(user, data);
  const updatedUser = await user.save();
  console.log('After update:', updatedUser);
  return updatedUser;
};


const getUsers = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const userList = await User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
  const totalResults = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { totalResults, totalPages, currentPage: page, limit };
  return { userList, pagination };
}

const getMonthlyUserootmsRatio = async (year) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59`);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const result = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          role: "$role"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.month",
        roles: {
          $push: {
            role: "$_id.role",
            count: "$count"
          }
        }
      }
    },
    {
      $project: {
        month: "$_id",
        userCount: {
          $cond: {
            if: { $gt: [{ $size: { $filter: { input: "$roles", as: "role", cond: { $eq: ["$$role.role", "user"] } } } }, 0] },
            then: { $arrayElemAt: [{ $filter: { input: "$roles", as: "role", cond: { $eq: ["$$role.role", "user"] } } }, 0] },
            else: { role: "user", count: 0 }
          }
        },
        ootmsCount: {
          $cond: {
            if: { $gt: [{ $size: { $filter: { input: "$roles", as: "role", cond: { $eq: ["$$role.role", "ootms"] } } } }, 0] },
            then: { $arrayElemAt: [{ $filter: { input: "$roles", as: "role", cond: { $eq: ["$$role.role", "ootms"] } } }, 0] },
            else: { role: "ootms", count: 0 }
          }
        }
      }
    },
    {
      $project: {
        month: 1,
        user: "$userCount.count",
        ootms: "$ootmsCount.count"
      }
    },
    {
      $sort: { month: 1 }
    }
  ]);

  // Initialize the result array with all months and counts set to 0
  const formattedResult = months.map((month, index) => {
    const data = result.find(r => r.month === index + 1) || { month: index + 1, user: 0, ootms: 0 };
    return {
      month: month,
      user: data.user,
      ootms: data.ootms
    };
  });

  return formattedResult;
};

const checkForUserWithGroup = async (searchQuery) => {
  try {
    const regex = new RegExp('.*' + searchQuery + '.*', 'i');

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
          from: 'groups', // Collection name for Group
          localField: '_id',
          foreignField: 'participants',
          as: 'userGroups',
        },
      },
      // Step 3: Unwind userGroups to handle empty or null arrays
      {
        $unwind: {
          path: '$userGroups',
          preserveNullAndEmptyArrays: true, // Allow users with no groups
        },
      },
      // Step 4: Add a field for group membership status
      {
        $addFields: {
          isInGroup: { $cond: { if: { $ifNull: ['$userGroups', false] }, then: true, else: false } },
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
      return { message: 'User not found', data: null }; // Return when no user is matched
    }

    return { message: 'Users found', data: result }; // Return matched users' details
  } catch (error) {
    console.error('Error in checkForUserWithGroup:', error);
    return { message: 'An error occurred', data: null };
  }
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
  addMoreUserFeild
}
