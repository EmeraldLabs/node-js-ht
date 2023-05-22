//importing modules
const express = require("express");
const userController = require("../Controllers/userController");
const { signup, login, verifyTwoFAToken, getPasswordResetLink, resetPassword } = userController;
const userAuth = require("../Middlewares/userAuth");

const router = express.Router();

//signup endpoint
//passing the middleware function to the signup
router.post("/signup", userAuth.saveUser, signup);

//login route
router.post("/login", login);

// verify 2fa token
router.post("/verify-2fa", verifyTwoFAToken);

// get reset password link
router.post("/get-password-reset-link", getPasswordResetLink);

// reset password
router.post("/reset-password", resetPassword);

module.exports = router;
