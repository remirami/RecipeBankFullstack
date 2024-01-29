const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const emailController = require("../controllers/emailController");

router.get("/confirm-email/:token", emailController.confirmEmail);

router.post("/login", userController.login);

router.post("/register", userController.register);

router.post("/forgot-password", userController.forgotPassword);

router.post("/reset-password/:token", userController.resetPassword);

module.exports = router;
