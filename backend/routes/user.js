const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/profile",
  authMiddleware.isAuthenticated,
  userController.getUserProfile
);

router.get(
  "/recipes",
  authMiddleware.isAuthenticated,
  userController.getUserRecipes
);

router.put(
  "/:userId/change-password",
  authMiddleware.isAuthenticated,
  userController.changePassword
);

module.exports = router;
