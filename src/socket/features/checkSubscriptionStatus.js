const checkSubscriptionStatus = async (socket, data, callback) => {
  return callback({ status: "Success", message: "Joined room successfully" });
};

module.exports = checkSubscriptionStatus;
