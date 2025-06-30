const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  fullName: { type: String, required: [true, 'Name must be given'], trim: true },
  email: { type: String, required: false, trim: true },
  image: { type: String, required: false, default: '/uploads/users/user.jpg' },
  password: { type: String, required: false, set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)) },
  phoneNumber: { type: String, required: false },
  address: { type: String, required: false },

  // google or facebook id
  googleId: { type: String, required: false },
  facebookId: { type: String, required: false },

  isOnDuty: { type: Boolean, default: false },

  // user end
  taxId: { type: String, required: false },

  // driver end
  ratings: { type: Number, default: 0 },
  dispatchCompleted: { type: Number, default: 0 },

  role: { type: String, enum: ['admin', 'user', 'driver'], default: 'user' },
},
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);