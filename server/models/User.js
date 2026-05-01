const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  emailOTP: {
    type: String,
    default: null
  },
  phoneOTP: {
    type: String,
    default: null
  },
  emailOTPExpiry: {
    type: Date,
    default: null
  },
  phoneOTPExpiry: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  coins: {
    type: Number,
    default: 100 // Welcome bonus
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bio: {
    type: String,
    default: 'NextGen Developer'
  },
  profileViews: {
    type: Number,
    default: 0
  },
  solvedChallenges: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String
  }],
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure at least email or phone is provided
userSchema.pre('save', function(next) {
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone is required'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
