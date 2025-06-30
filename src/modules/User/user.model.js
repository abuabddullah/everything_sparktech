const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    fullName: {
      type: String,
      required: [true, "Name must be given"],
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      unique: true,
    },
    image: {
      type: String,
      required: false,
      default: "/uploads/users/user.jpg",
    },
    password: {
      type: String,
      required: false,
      select: 0,
      set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)),
    },
    phoneNumber: { type: String, required: false },
    address: { type: String, required: false },
    phoneCode: { type: String, required: false },
    // google or facebook id
    googleId: { type: String, required: false },
    facebookId: { type: String, required: false },
    birthday: { type: Date, required: false },

    isOnDuty: { type: Boolean, default: false },
    isComplete: { type: Boolean, default: false },
    validDriver: { type: Boolean, default: true, required: false },
    cdlNumberImage: { type: String, required: false },
    isSocialLogin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    // user end
    taxid: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },

    // driver end
    ratings: { type: Number, default: 0 },
    role: { type: String, enum: ["admin", "user", "driver"], default: "user" },
    fcmToken: { type: String, required: false, default: "" },
    truckOnDuty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: false,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.findLastUser = async function () {
  return await this.findOne({}, null, { bypassMiddleware: true })
    .select("userId")
    .sort({ createdAt: -1 })
    .limit(1)
    .lean();
};
// query middlewares
userSchema.pre("find", async function (next) {
  if (this.options.bypassMiddleware) {
    return next(); // Skip middleware if the flag is set
  }
  this.find({
    $and: [{ isDeleted: { $ne: true } }, { isBlocked: { $ne: true } }],
  });
  next();
});

userSchema.pre("findOne", async function (next) {
  console.log(this.options, "mongoose middleware option =>");

  if (this.options.bypassMiddleware) {
    return next(); // Skip middleware if the flag is set
  }
  this.findOne({
    $and: [{ isDeleted: { $ne: true } }, { isBlocked: { $ne: true } }],
  });
  next();
});

// userSchema.pre('aggregate', async function (next) {
//   this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
//   next();
// });

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
