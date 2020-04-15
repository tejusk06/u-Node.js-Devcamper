const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false //? When we get user through API it will not show the password
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {

  //? If passwod is not modified it won't be hashed again, will go to next function
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10)
  //? Higher the gensalt number the more secure but also heavier on your system. 10 is recommended
  this.password = await bcrypt.hash(this.password, salt);
  console.log();

})

// Sign JWT and return 
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
  //? 'this._id' gives the specific users 'id'. Since this is a method and not a static it will be called on the particular user and not the User model.
}

// Match user entered password to hashed password in database 
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and hash paswword token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate the token 
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set the expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

module.exports = mongoose.model('User', UserSchema);