const express = require("express");
const petRoute = require('./pet.route.js');
const userRoute = require('./user.route.js');
const authRoute = require('./auth.route.js');
const router = express.Router();

router.use('/auth',authRoute);
router.use('/pets',petRoute);
router.use('/users',userRoute);

module.exports = router ;
