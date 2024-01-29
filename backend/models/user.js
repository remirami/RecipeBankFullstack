const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { saltRounds } = require("../config");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailConfirmationToken: { type: String },
  emailConfirmed: { type: Boolean, default: false },
  emailConfirmationTokenExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  skipPasswordHash: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
});

const isBcryptHash = (str) => /^\$2[ayb]\$.{56}$/.test(str);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && !isBcryptHash(this.password)) {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
