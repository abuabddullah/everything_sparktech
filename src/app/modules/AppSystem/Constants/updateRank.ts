import mongoose, { Types } from 'mongoose';
import { Investment } from '../Models/invest.model';
import { Raised } from '../Models/raised.model';
import { User } from '../../User/user.model';
import AppError from '../../../errors/AppError';
import httpStatus from 'http-status';
import { Notification } from '../Models/notification.model';

const updateRanks = async () => {
  const dateTime = new Date();
  console.log('Updated At: ', dateTime);
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const updateRankType = async (
      model: typeof Investment | typeof Raised,
      rankField: 'rank' | 'raisedRank',
      prevField: 'prevRank' | 'prevRaisedRank',
      totalField: 'totalInvest' | 'totalRaised',
    ) => {
      const totals = await model
        .aggregate([
          { $group: { _id: '$user', total: { $sum: '$amount' } } },
          { $sort: { total: -1 } },
        ])
        .session(session);

      for (let i = 0; i < totals.length; i++) {
        const userId = totals[i]._id;
        const newRank = i + 1;
        const total = totals[i].total;

        const existingRank = await User.findOne({ _id: userId, isDeleted: false }).session(
          session,
        );

        if (existingRank) {
          if (existingRank[rankField] !== newRank) {
            existingRank[prevField]?.push({
              date: new Date(),
              number: existingRank[rankField] as number,
            });
            existingRank[rankField] = newRank;
          }
          existingRank[totalField] = total;
          await existingRank.save({ session });
        }
      }
    };

    await updateRankType(Investment, 'rank', 'prevRank', 'totalInvest');
    await updateRankType(Raised, 'raisedRank', 'prevRaisedRank', 'totalRaised');

    await session.commitTransaction();
    console.log(`[${new Date().toISOString()}] Rank updated.`);
  } catch (err) {
    await session.abortTransaction();
    console.error('Rank update failed:', err);
  } finally {
    session.endSession();
  }
};

const sendNotification = async (payload: {
  title: string;
  subTitle: string;
  user?: string | Types.ObjectId;
  type: string;
}) => {
  if (!payload) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the user id!');
  }
  const result = await Notification.create(payload)
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the user id!');
  }
};

export { updateRanks, sendNotification };
