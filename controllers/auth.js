const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc      Register user
// @route     GET /api/v1/auth/register
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