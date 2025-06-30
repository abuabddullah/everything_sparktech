const receiverService = require("./receiver.service");

const createReceiver = async (req, res) => {
  try {
    const { userId, loadId, name, email } = req.body;

    // Call the service to create a new receiver
    const newReceiver = await receiverService.createReceiver({
      userId,
      loadId,
      name,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Receiver created successfully",
      data: newReceiver,
    });
  } catch (error) {
    console.error("Error creating receiver:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create receiver",
      error: error.message,
    });
  }
};

module.exports = {
  createReceiver,
};
