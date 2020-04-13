//? Can be added in user.js route and controller as well, but preferable to seperate the CRUD functionality of user and authentication into seperate files.
const express = require('express');
const { register } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);

module.exports = router;