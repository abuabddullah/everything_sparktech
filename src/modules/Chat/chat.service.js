const Chat = require("./chat.model");
const mongoose = require("mongoose");

const addChat = async (user, participant) => {
  return await Chat.create(
    {
      participants: [user, participant]
    }
  );
};

const getChatById = async (id) => {
  return await Chat.findById(id);
};

const getChatByParticipants = async (user, participant) => {
  let chat = await Chat.findOne({
    participants: { $all: [user, participant] },
  });
  //let isBlocked = false;
  // const blockedChats = await getBlockedListByUsersId(user, participant);
  // if (blockedChats) {
  //   isBlocked = true;
  // }
  return chat;
};

const getChatDetailsByParticipantId = async (user, participant) => {
  let chat = await Chat.findOne({
    participants: { $all: [user, participant] },
  });
  return chat;
};

const getChatByDeleteId = async (chatId) => {
  return await Chat.findByIdAndDelete(chatId);
};

//in use
const getChatByParticipantId = async (filters, options) => {
  try {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const participantId = new mongoose.Types.ObjectId(filters.participantId);
    const name = filters.name ? filters.name : "";

    const allChatLists = await Chat.aggregate([
      { $match: { participants: participantId } },
      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$chat", "$$chatId"] } } },
            { $sort: { createdAt: -1 } }, // Sort messages in descending order by createdAt
            { $limit: 1 },
            { $project: { message: 1, createdAt: 1 } } // Project only the content and createdAt of the latest message
          ],
          as: "latestMessage"
        }
      },
      { $unwind: { path: "$latestMessage", preserveNullAndEmptyArrays: true } },
      { $sort: { "latestMessage.createdAt": -1 } }, // Sort chat list based on the createdAt of the latest message
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants"
        }
      },
      {
        $addFields: {
          participants: {
            $map: {
              input: {
                $filter: {
                  input: "$participants",
                  as: "participant",
                  cond: { $ne: ["$$participant._id", participantId] }
                }
              },
              as: "participant",
              in: {
                _id: "$$participant._id",
                fullName: "$$participant.fullName",
                image: "$$participant.image"
              }
            }
          }
        }
      },
      {
        $match: {
          participants: {
            $elemMatch: {
              fullName: { $regex: name }
            }
          }
        }
      },
      {
        $addFields:{
          participant:{
            $arrayElemAt: ["$participants", 0]
          }
        }
      },
      {
        $project: {
          latestMessage: 1,
          groupName: 1,
          type: 1,
          groupAdmin: 1,
          image: 1,
          participant: 1
        }
      },
      {
        $facet: {
          "totalCount": [
            { $count: "count" }
          ],
          "data": [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]);

    const totalResults = allChatLists[0].totalCount.length > 0 ? allChatLists[0].totalCount[0].count : 0;
    const totalPages = Math.ceil(totalResults / limit);
    const pagination = { totalResults, totalPages, currentPage: page, limit };

    return { chatList: allChatLists[0]?.data, pagination };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteChatById = async (chatId) => {
  return await Chat.findByIdAndDelete(chatId);
}

const getParticipantLists = async (userId) => {
  const myId = new mongoose.Types.ObjectId(userId);
  const result = await Chat.aggregate([
  { $match: { participants: { $in: [myId]} } },
  { $unwind: "$participants" },
  { $match: { participants: { $ne: myId } } },
  {
    $group: {
      _id: null,
      participantIds: { $addToSet: "$participants" }
    }
  }
]);
return result;
};

module.exports = {
  addChat,
  getChatById,
  getChatByParticipants,
  getChatDetailsByParticipantId,
  getChatByDeleteId,
  getChatByParticipantId,
  deleteChatById,
  getParticipantLists
};
