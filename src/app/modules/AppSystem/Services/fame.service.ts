import { User } from '../../User/user.model';
import { Investment } from '../Models/invest.model';

const mostViewed = async () => {
  const user = await User.findOne()
    .sort({ views: -1 })
    .select('name country profileImg views _id gender')
    .lean();

  return user;
};

const highestInvestor = async () => {
  const result = await Investment.aggregate([
    {
      $group: {
        _id: '$user',
        totalInvested: { $sum: '$amount' },
      },
    },
    { $sort: { totalInvested: -1 } },
    { $limit: 1 },
  ]);

  if (!result.length) return null;

  const user = await User.findOne({ _id: result[0]._id })
    .select('name country profileImg views _id gender')
    .lean();
  return {
    ...user,
    totalInvested: result[0].totalInvested,
  };
};

const consecutivelyToper = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await User.aggregate([
    {
      $project: {
        _id: 1,
        topRanks: {
          $filter: {
            input: { $ifNull: ['$prevRank', []] },
            as: 'rank',
            cond: {
              $and: [
                { $eq: ['$$rank.number', 1] },
                { $gte: ['$$rank.date', thirtyDaysAgo] },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        topCount: { $size: '$topRanks' },
      },
    },
    { $sort: { topCount: -1 } },
    { $limit: 1 },
  ]);

  if (!result.length) return null;
  const user = await User.findById(result[0]._id)
    .select('name country profileImg views _id gender')
    .lean();

  return {
    ...user,
    timesRankedTop: result[0].topCount,
  };
};

export const FameServices = {
  mostViewed,
  highestInvestor,
  consecutivelyToper,
};
