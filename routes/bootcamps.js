const express = require('express');
const { getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware//advancedResults');


// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter); //? Re-routes to getCourses

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

router
  .route('/:id/photo')
  .put(protect, bootcampPhotoUpload);
//? The protect part make the route private so that only authorized users can access

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  //? Need to pass the advancedResults here to make it work for that route
  .post(protect, createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

module.exports = router;