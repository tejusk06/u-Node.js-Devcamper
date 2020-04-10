const Bootcamp = require('../models/Bootcamp');

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  } catch (err) {
    res.status(400).json({ Success: false });
  }
}


// @desc      Get single bootcamps
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({ Success: false });
      //? Since there is another res.status below we add 'return' to make sure that it ends here.
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    // res.status(400).json({ Success: false });
    next(err);
  }
}


// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps/
// @access    Private
exports.createBootcamp = async (req, res, next) => {

  try {
    const bootcamp = await Bootcamp.create(req.body)
    //? If there is a field in req.body that is not defined in 'Bootcamp' model then it will not be added to the database 

    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch (error) {
    res.status(400).json({ success: false })
  }


}


// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = async (req, res, next) => {

  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //? the response will have the new data
      runValidators: true //? Runs momgoose validators 
    });

    if (!bootcamp) {
      return res.status(400).json({ success: false })
    }

    res.status(200).json({ success: true, data: bootcamp })

  } catch (err) {
    res.status(400).json({ success: false })
  }





}



// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({ Success: false });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ Success: false });
  }
}