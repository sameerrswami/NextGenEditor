const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true,
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
    minlength: 6
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isTempUser: {
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

// Validate basic requirements for registered users
userSchema.pre('save', function(next) {
  if (this.isTempUser) {
    return next();
  }
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone is required'));
  }
  if (!this.username) {
    return next(new Error('Username is required'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

