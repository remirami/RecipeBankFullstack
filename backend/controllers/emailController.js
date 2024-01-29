const User = require("../models/user");
const { sendConfirmationEmail } = require("../email/emailService");
const validator = require("validator");

async function confirmEmail(req, res) {
  try {
    const { token } = req.params;

    if (!token || !validator.isAlphanumeric(token) || token.length !== 32) {
      return res.status(400).json({ message: "Invalid or missing token" });
    }
    const user = await User.findOne({
      emailConfirmationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const currentTime = new Date();
    if (currentTime > user.emailConfirmationTokenExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.emailConfirmed = true;
    user.emailConfirmationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email confirmed successfully" });
  } catch (error) {
    console.error("Error confirming email:", error);
    res
      .status(500)
      .json({ message: "An error occurred while confirming email" });
  }
}

module.exports = {
  confirmEmail,
};
