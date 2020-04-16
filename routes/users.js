const express = require('express');
const { updateUser, getUser, getUsers, createUser, deleteUser } = require('../controllers/users');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.use(protect);
//? Since we will need the protect middleware for all routes we can use it like this, anything below this will use protect, same applies for authorize. Only admin is authorized.
router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser)
  .get(getUser);


router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;



