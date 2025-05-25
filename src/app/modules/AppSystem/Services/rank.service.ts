import { Investment } from '../Models/invest.model';
import { User } from '../../User/user.model';
import { Raised } from '../Models/raised.model';
import QueryBuilder from '../../../builder/QueryBuilder';

const getUsersByRank = async (query:Record<string, unknown>) => {
  // Step 1: Aggregate total investment per user
  const investmentTotals = await Investment.aggregate([
    {
      $group: {
        _id: '$user',
        totalInvest: { $sum: '$amount' },
      },
    },
    {
      $sort: { totalInvest: -1 },
    },
  ]);

  const userIds = investmentTotals.map((entry) => entry._id);

  // Step 2: Use QueryBuilder to filter/sort/paginate user data
  const resultQuery = new QueryBuilder(
    User.find({ _id: { $in: userIds }, isDeleted: false }),
    query
  )
    .search(['status', 'name', 'gender', 'email', 'country', "city", 'age', 'role'])
    .filter()
    .sort()
    .fields()
    .paginate()
    .limit()

  const users = await resultQuery.modelQuery.lean();
  const meta = await resultQuery.countTotal();

  const userMap = new Map();
  for (const user of users) {
    userMap.set(user._id.toString(), {
      name: user.name,
      profileImg: user.profileImg,
      currentRank: user.rank,
      previousRank:
        user.prevRank && user.prevRank.length > 0
          ? user.prevRank[user.prevRank.length - 1].number
          : null,
    });
  }

  // Step 3: Assemble leaderboard from filtered users only
  const leaderboard = investmentTotals
    .filter((entry) => userMap.has(entry._id.toString()))
    .map((entry, index) => {
      const uid = entry._id.toString();
      const user = userMap.get(uid);
      return {
        userId: uid,
        name: user?.name || 'Unknown',
        profileImg: user?.profileImg || 'Unknown',
        totalInvest: entry.totalInvest,
        currentRank: user?.currentRank ?? index + 1,
        previousRank: user?.previousRank ?? null,
      };
    });

  return { data: leaderboard, meta };
};


const getUsersByRaisedRank = async (query:Record<string, unknown>) => {
  // Step 1: Aggregate total raised amount per user
  const raisedTotals = await Raised.aggregate([
    {
      $group: {
        _id: '$user',
        totalRaised: { $sum: '$amount' },
      },
    },
    {
      $sort: { totalRaised: -1 },
    },
  ]);

  const userIds = raisedTotals.map((entry) => entry._id);

  // Step 2: Use QueryBuilder to filter/sort/paginate user data
  const resultQuery = new QueryBuilder(
    User.find({ _id: { $in: userIds }, isDeleted: false }),
    query
  )
    .search(['status', 'name', 'gender', 'email', 'country', "city", 'age', 'role'])
    .filter()
    .sort()
    .fields()
    .paginate()
    .limit();

  const users = await resultQuery.modelQuery.lean();
  const meta = await resultQuery.countTotal();

  const userMap = new Map();
  for (const user of users) {
    userMap.set(user._id.toString(), {
      name: user.name,
      profileImg: user.profileImg,
      currentRaisedRank: user.raisedRank,
      previousRaisedRank:
        user.prevRaisedRank && user.prevRaisedRank.length > 0
          ? user.prevRaisedRank[user.prevRaisedRank.length - 1].number
          : null,
    });
  }

  // Step 3: Assemble leaderboard from filtered users only
  const leaderboard = raisedTotals
    .filter((entry) => userMap.has(entry._id.toString()))
    .map((entry, index) => {
      const uid = entry._id.toString();
      const user = userMap.get(uid);
      return {
        userId: uid,
        name: user?.name || 'Unknown',
        profileImg: user?.profileImg || 'Unknown',
        totalRaised: entry.totalRaised,
        currentRaisedRank: user?.currentRaisedRank ?? index + 1,
        previousRaisedRank: user?.previousRaisedRank ?? null,
      };
    });

  return { data: leaderboard, meta };
};

export const RankServices = {
  getUsersByRank,
  getUsersByRaisedRank
};
