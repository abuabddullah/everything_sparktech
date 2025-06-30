const response = require("../../helpers/response");
const ApiError = require("../../helpers/ApiError");
const catchAsync = require("../../helpers/catchAsync");
const httpStatus = require("http-status");
const { getChatByDeleteId, getChatByParticipantId } = require("./chat.service");

const getAllChats = catchAsync(async (req, res) => {
  const options = {
    limit: Number(req.query.limit) || 10,
    page: Number(req.query.page) || 1,
  };
  const filter = { participantId: req.User._id };
  const search = req.query.search;
  if (search && search !== 'null' && search !== '' && search !== undefined) {
    const searchRegExp = new RegExp('.*' + search + '.*', 'i');
    filter.name= searchRegExp;
  }
  const chatResult = await getChatByParticipantId(filter, options);
  return res.status(200).json(response({ message:"Chats", status: "OK", statusCode:"200" , data: chatResult }));
});

const deleteChat = catchAsync(async (req, res) => {
  const chat = await getChatByDeleteId(req.body.chatId);
  return res.status(200).json(response({ message:"Chat Deleted", status: "OK", statusCode:"200" , data: chat}));
});

module.exports = {
  getAllChats,
  deleteChat,
};
