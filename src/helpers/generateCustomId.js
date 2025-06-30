const User = require("../modules/User/user.model");

async function generateCustomID() {
  try {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    let newUserId = "";

    // Find the most recent non-deleted and non-blocked user
    const latestUser = await User.findLastUser();

    if (latestUser && latestUser.userId) {
      // Extract the last number from the userId and increment it
      const lastNumber = parseInt(latestUser.userId.split("-")[2]);
 
      const newNumber = (lastNumber + 1).toString().padStart(5, "0");
      newUserId = newNumber;
    } else {
      // If no valid users found, start from '00001'
      newUserId = "00001";
    }

    // Generate the custom ID
    const customID = `OOTMS-${month}${year}-${newUserId}`;
    return customID;
  } catch (err) {
    console.error("Error generating custom ID:", err);
    throw new Error("Failed to generate custom ID");
  }
}

module.exports = generateCustomID;
