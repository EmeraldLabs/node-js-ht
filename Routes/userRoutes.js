const express = require("express");
const userController = require("../Controllers/userController");
const {
  signup,
  login,
  verifyTwoFAToken,
  getPasswordResetLink,
  resetPassword,
  updateUser,
  getUserById,
  getAllUsers,
  deleteUserById,
} = userController;
const userAuth = require("../Middlewares/userAuth");
const router = express.Router();

router.post("/signup", userAuth.saveUser, signup);
router.post("/login", login);
router.post("/verify-2fa", verifyTwoFAToken);
router.post("/get-password-reset-link", getPasswordResetLink);
router.post("/reset-password", resetPassword);
router.put("/:id", updateUser);
router.get("/:id", getUserById);
router.get("/", getAllUsers);
router.delete("/:id", deleteUserById);

module.exports = router;
