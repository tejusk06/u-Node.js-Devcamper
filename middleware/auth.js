const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;


  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    //? 'split' will split it at the gap and then [1] will get the second element of the array. That way we exclude the starting 'Bearer' part of the token
  }

  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to acces this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();

  } catch (err) {
    return next(new ErrorResponse('Not authorized to acces this route', 401));
  }
})