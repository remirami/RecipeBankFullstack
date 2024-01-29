const { check, validationResult } = require("express-validator");

exports.validateFeedback = [
  check("type").trim().not().isEmpty().withMessage("Feedback type is required"),
  check("message")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Feedback message is required")
    .isLength({ max: 1000 })
    .withMessage("Feedback message must be less than 500 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
