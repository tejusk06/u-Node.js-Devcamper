//? Can be added in user.js route and controller as well, but preferable to seperate the CRUD functionality of user and authentication into seperate files.
const express = require('express');
const { register, login, getMe } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);


module.exports = router;