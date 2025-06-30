const Receiver = require("../Receiver/receiver.model");
const User = require("../User/user.model");
const Load = require("./load.model");

function updateLocationToServer(loadId) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Send location data to your backend
        try {
          const response = await fetch("/api/v1/loads/update-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              loadId, // The load ID to associate the location
              latitude,
              longitude,
            }),
          });

          const data = await response.json();
        } catch (error) {
          console.error("Error updating location:", error);
        }
      },
      (error) => {
        console.error("Error fetching location:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

const generateReceiverId = async (loadDetails) => {
  for (const load of loadDetails) {
    const { receiverEmail, receiverName, _id: loadId } = load;

    // Check if receiver email exists in User model
    const existingUser = await User.findOne({ email: receiverEmail });

    if (existingUser) {
      // Check if receiver email exists in Receiver model
      let receiver = await Receiver.findOne({ email: receiverEmail });

      if (!receiver) {
        // Create a new receiver
        receiver = new Receiver({
          email: receiverEmail,
          name: receiverName,
          loadId,
          user: existingUser._id,
        });
        await receiver.save();
      }
      // Update load model with receiver ID
      await Load.findByIdAndUpdate(loadId, { receiverId: receiver._id });
    } else {
      // Create a new receiver without a user reference
      const newReceiver = new Receiver({
        email: receiverEmail,
        name: receiverName,
        loadId,
      });
      await newReceiver.save();

      const updateLoad = await Load.findByIdAndUpdate(
        loadId,
        { receiverId: newReceiver._id },
        { new: true }
      );
    }
  }
};

module.exports = {
  generateReceiverId,
};
