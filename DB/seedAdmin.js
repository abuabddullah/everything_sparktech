const generateCustomID = require("../src/helpers/generateCustomId");
const User = require("../src/modules/User/user.model");

const seedAdmin = async () => {
  try {
    const admin = {
      userId: await generateCustomID(),
      fullName: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: process.env.ADMIN_ROLE,
    };
    // Check if an admin user already exists
    const isAdminExist = await User.findOne({ role: "admin" });
    if (!isAdminExist) {
      await User.create(admin);
      console.log("Admin seeded successfully");
    }
    console.log("Admin already exists");
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

module.exports = seedAdmin;
