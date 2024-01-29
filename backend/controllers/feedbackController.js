const Feedback = require("../models/feedback");
const emailService = require("../email/emailService");

exports.submitFeedback = async (req, res) => {
  try {
    const newFeedback = await Feedback.create({
      type: req.body.type,
      message: req.body.message,
    });

    await emailService.sendFeedbackEmail(newFeedback);
    res.status(201).json({ message: "Feedback submitted succesfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
};
