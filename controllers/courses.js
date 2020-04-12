const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/async');

// @desc      Get Courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
    //?.populate adds the bootcamp object to the returned course, select specifies the particular fields to be added from the bootcamp object
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
})
