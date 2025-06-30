const userLiveLocationShare = async (socket, data, callback) => {
  console.log("User Live Location Share: ", data);
  if (data) {
    // save the data in the database
    
    //broadcast the message to the socket

    //by this, if another person is Online, he will just get the message
    
    return callback({
      status: "Success",
      message: "User location shared successfully",
    });
  } else {
    return callback({
      status: "Error",
      message: "No data found",
    });
  }
};

module.exports = userLiveLocationShare;
