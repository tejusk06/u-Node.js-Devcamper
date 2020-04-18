const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;


  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    //? 'split' will split it at the gap and then [1] will get the second element of the array. That way we exclude the starting 'Bearer' part of the token
  }
  // Set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token
  //   //? If bearer token is present not present in header, cookie will be checked 
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
});

// Grant access to specific roles 
//? '...roles' spread operator is used to specify multiple values seperated by commas
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to acces this route`, 403));
    }
    next(); //? Make sure next() is inside the return statement or it will hang 
  }
}