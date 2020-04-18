//? Can be added in user.js route and controller as well, but preferable to seperate the CRUD functionality of user and authentication into seperate files.
const express = require('express');
const { register, login, getMe, forgotpassword, resetPassword, updateDetails, updatePassword, logout } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotPassword', forgotpassword);
router.put('/resetpassword/:resettoken', resetPassword);


module.exports = router;