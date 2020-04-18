const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
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

  sendTokenResponse(user, 200, res);
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
  //? '+password' because we want the password included to verify it. In the user model we have set 'select' as 'false' so by default it will not be included


  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});




// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  //? We have access to res.cookie because of cookie parser middleware

  // if (res.cookie) {

  // }
  res.cookie('token', 'none', {
    //? Setting cookie to expire in 10 seconds.
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    data: {}
  })
})




// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // console.log(req.user.id);

  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  })
})



// @desc      Update user details
// @route     PUT /api/v1/auth/updateDetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {

  //? We dont want to update the entire user instance
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  })
})




// @desc      Update Password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.user.id).select('+password');
  //? Since password select is set as false in the User model

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
})






// @desc      Forgot Password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotpassword = asyncHandler(async (req, res, next) => {

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false })

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
  //? "req.protocol" returns 'http' or 'https'. "req.get('host')" returns the domain/host name

  const message = `To reset your password, make a PUT request to: \n\n ${resetUrl}`
  //? If we have a front-end the link would be to another page which would make the api call to the reset Url

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    })

    res.status(200).json({ success: true, data: 'Email sent' });

  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    //? We are not saving a new user so we dont want to validate

    return next(new ErrorResponse('Email could not be sent', 500));

  }

  // res.status(200).json({
  //   success: true,
  //   data: user
  // })
})


// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {

  // Get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
    //? "$gt" - greater than, makes sure the token has not expired yet.
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set the new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
})








//  Get token from model, create cookie and send response 
const sendTokenResponse = (user, statusCode, res) => {

  // Create token
  const token = user.getSignedJwtToken();
  //? call the '.getSignedJwtToken' on 'user' instance not 'User' model

  const options = {
    //? "JWT_COOKIE_EXPIRE" is in milliseconds so need to convert it to days
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    //? cookie 'expires' field shows 'session' in postman even though set to 30 days here
    httpOnly: true //? Only client side script can access if true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true; //? if true the cookie will be sent with 'https'
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};