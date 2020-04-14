const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  //? Pulling the fields out because the password needs to be hashed in middleware

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Create token
  const token = user.getSignedJwtToken();
  //? call the '.getSignedJwtToken' on 'user' instance not 'User' model

  res.status(200).json({
    success: true,
    token
  })
})



// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //? We are not creating or updating a new instance so it will not run through the model and middleware so need to validate here 
  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  //? '+password' because we want the password included to verify it. In the user model we have set 'select' as 'false'


  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Create token
  const token = user.getSignedJwtToken();
  //? call the '.getSignedJwtToken' on 'user' instance not 'User' model

  res.status(200).json({
    success: true,
    token
  })
})