const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { sendOTP, verifyOTP, validateUser, updateProfile, getUserById } = require("../controller/userController");

// Route to send OTP
router.post("/sendOTP", sendOTP);

// Route to verify OTP and register user, with optional image upload
router.post("/verifyOTP", upload.single("userImg"), verifyOTP);

// Route to validate user login
router.post("/validateUser", validateUser);

// Route to update user profile
router.post("/updateProfile/:userId", upload.single("userImg"), updateProfile);

router.get("/getUser/:userId", getUserById)

module.exports = router;
