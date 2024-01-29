const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  userId: String,
  lastAttemptTime: Date,
  attempts: Number,
});

const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);

const COLLECTION_NAME = "login_attempts";
const THRESHOLD = 10; // maximum number of attempts allowed within an hour
const HOUR_IN_MS = 3600 * 1000; // milliseconds in an hour

async function addLoginAttempt(userId) {
  const currentTime = new Date();
  const result = await LoginAttempt.findOneAndUpdate(
    { userId },
    { $set: { lastAttemptTime: currentTime }, $inc: { attempts: 1 } },
    { upsert: true, new: true }
  );

  return result.attempts;
}

async function getLoginAttempts(userId) {
  const result = await LoginAttempt.findOne({ userId });
  return result ? result.attempts : 0;
}

async function getLoginAttempt(userId) {
  const result = await LoginAttempt.findOne({ userId });
  return result;
}

async function resetLoginAttempts(userId) {
  await LoginAttempt.deleteOne({ userId });
}

module.exports = {
  addLoginAttempt,
  getLoginAttempts,
  getLoginAttempt,
  resetLoginAttempts,
  THRESHOLD,
  HOUR_IN_MS,
};
