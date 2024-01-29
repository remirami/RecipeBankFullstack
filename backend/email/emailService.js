const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendConfirmationEmail(recipientEmail, token) {
  const emailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: recipientEmail,
    subject: "Please confirm your email address",
    html: `
      <h1>Email Confirmation</h1>
      <p>Please confirm your email address by clicking on the link below:</p>
      <a href="${process.env.FRONTEND_URL}/confirm-email/${token}">Confirm email</a>
      <p>Link expires in 24 hours</p>
      `,
  };

  try {
    const info = await transporter.sendMail(emailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function sendPasswordResetEmail(recipientEmail, token) {
  const emailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: recipientEmail,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset</h1>
      <p>To reset your password, click the link below:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset password</a>
      <p>Link expires in 1 hour</p>
      `,
  };

  try {
    const info = await transporter.sendMail(emailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
async function sendFeedbackEmail(feedbackData) {
  const { type, message } = feedbackData;

  const emailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.FEEDBACK_RECIPIENT_EMAIL,
    subject: `New feedback received: ${type}`,
    html: `
    <h1>Feedback Type: ${type}</h1>
    <p>${message}</p>
    `,
  };
  try {
    const info = await transporter.sendMail(emailOptions);
    console.log("Feedback email sent: ", info.response);
  } catch (error) {
    console.log("Error sending feedback mail", error);
  }
}
module.exports = {
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendFeedbackEmail,
};
