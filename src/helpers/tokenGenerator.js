const jwt = require("jsonwebtoken");

const tokenGenerator = async (user) => {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    image: user.image,
    role: user.role,
    noOfTrades: user.noOfTrades || 0,
    noOfKeys: user.noOfKeys || 0,
    noOfPromotes: user.noOfPromotes || 0,
    noOfFills: user.noOfFills || 0,
    voteCounts: user.voteCounts || 1,
    address: user.address || "N/A",
  };
  return await jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: "1y",
  });
};

module.exports = tokenGenerator;
