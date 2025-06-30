const {
  getChatAndAgoraTokens,
  deleteChatAndAgoraToken,
} = require("../../modules/ChatAndAgoraTokenGenerator/chatAndAgoraTokenGenerator.service");
const generateAgoraToken = require("../../helpers/generateAgoraToken");
const { getChatByParticipants } = require("../../modules/Chat/chat.service");
const { addMessage } = require("../../modules/Message/message.service");
const Chat = require("../../modules/Chat/chat.model");
const sendNotification = require("../../helpers/formatNotification");
const { start } = require("agenda/dist/agenda/start");

const chatAndAgoraTokenGenerate = async (agenda) => {
  agenda.define("chat and agora token generate", async (job) => {
    try {
      const myTasks = await getChatAndAgoraTokens();
      if (myTasks && myTasks.length > 0) {
        for (const data of myTasks) {
          const agoraToken = await generateAgoraToken(
            data.channelName,
            data.appointmentStartTime,
            data.duration
          );

          let existingChat = await getChatByParticipants(
            data.user._id,
            data.ootms._id
          );
          if (!existingChat) {
            existingChat = new Chat({
              participants: [data.user._id, data.ootms._id],
              status: "accepted",
            });
          }
          existingChat.agoraToken = agoraToken;
          existingChat.channelName = data.channelName;
          existingChat.startTime = data.appointmentStartTime;
          existingChat.duration = data.duration;
          await existingChat.save();

          await addMessage({
            type: "special",
            chat: existingChat._id,
            channelName: data.channelName,
            startTime: data.appointmentStartTime,
            meetingTime: data.appointmentStartTime,
            duration: data.duration,
            token: agoraToken,
            sender: data.ootms._id,
          });

          // send notification to user and ootms
          const roomForUser = "user-notification::" + data.user._id.toString();
          const roomForootms =
            "user-notification::" + data.ootms._id.toString();

          const dataForUser = {
            message: "You can now start the chat with " + data.ootms.fullName,
            type: "chat",
            link: existingChat._id,
            role: "user",
            receiver: data.user._id,
          };

          const dataForootms = {
            message: "You can now start the chat with " + data.user.fullName,
            type: "chat",
            link: existingChat._id,
            role: "user",
            receiver: data.ootms._id,
          };

          await sendNotification(dataForUser, roomForUser);
          await sendNotification(dataForootms, roomForootms);

          await deleteChatAndAgoraToken(data._id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = chatAndAgoraTokenGenerate;
