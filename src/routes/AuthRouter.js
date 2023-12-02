const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const { AuthPermission } = require("../middleware/AuthPermission");

router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);
router.get("/me", AuthPermission("", true), authController.getAuthMe);
router.put("/me", AuthPermission("", true), authController.updateAuthMe);
router.post("/refresh-token", authController.refreshToken);
router.patch(
  "/change-password",
  AuthPermission("", true),
  authController.changePasswordMe
);
router.post(
  "/forgot-password",
  AuthPermission("", true, true),
  authController.forgotPasswordMe
);

router.post(
  "/reset-password",
  AuthPermission("", true, true),
  authController.resetPasswordMe
);

module.exports = router;
