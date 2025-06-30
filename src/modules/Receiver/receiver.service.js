const ReceiverModel = require("./Receiver.model");

const createReceiver = async ({ userId, loadId, name, email }) => {
  try {
    // Create a new receiver instance
    const receiver = new ReceiverModel({
      userId,
      loadId,
      name,
      email,
    });

    // Save the receiver to the database
    const savedReceiver = await receiver.save();
    return savedReceiver;
  } catch (error) {
    console.error("Error in receiver service:", error);
    throw new Error("Error creating receiver");
  }
};

module.exports = {
  createReceiver,
};
