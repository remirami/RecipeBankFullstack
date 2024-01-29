const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const feedbackController = require("../controllers/feedbackController");
const { validateFeedback } = require("../middleware/feedbackValidator");

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 10, //Maximum of 10 submissions per IP
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post(
  "/submit",
  validateFeedback,
  feedbackLimiter,
  feedbackController.submitFeedback
);

module.exports = router;
