const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {

  let error = { ...err };

  error.message = err.message; //? Not sure why this is being done since the spread operator above is supposed to add this, which it isn't.


  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`; //? err.value gives the req.params.id
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key 
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }


  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });

}

module.exports = errorHandler;