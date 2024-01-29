const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/user");
const crypto = require("crypto");
const mailer = require("../email/emailService");

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginAttempts = require("./loginAttempts");
const Recipe = require("../models/recipe");
const { generateRandomToken } = require("../utils");
const {
  sendConfirmationEmail,
  sendPasswordResetEmail,
} = require("../email/emailService");
const { saltRounds } = require("../config");

const router = express.Router();

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json("Please fill in all required fields");
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        message:
          "Password should be at least 8 characters long and it cannot be longer than 128 characters",
      });
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username is already taken" });
    }

    // Check if email is already in use
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const emailConfirmationToken = generateRandomToken();
    const emailConfirmationTokenExpires = new Date();
    emailConfirmationTokenExpires.setHours(
      emailConfirmationTokenExpires.getHours() + 24
    ); // Expires in 24 hours

    const user = new User({
      username,
      email,
      password,
      emailConfirmationToken,
      emailConfirmationTokenExpires,
      emailConfirmed: false,
    });
    // Send the confirmation email with the token
    await sendConfirmationEmail(email, emailConfirmationToken);

    const result = await user.save();
    console.log("Saved user:", result);

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to confirm your account.",
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json("Please fill in all required fields");
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check the number of login attempts
    const attempts = await loginAttempts.getLoginAttempts(user._id);
    const currentTime = new Date();
    if (attempts >= loginAttempts.THRESHOLD) {
      const loginAttempt = await loginAttempts.getLoginAttempt(user._id);
      const lastAttemptTime = loginAttempt.lastAttemptTime;
      if (currentTime - lastAttemptTime < loginAttempts.HOUR_IN_MS) {
        res.status(429).json({
          message: "Too many login attempts. Please try again later.",
        });
        return;
      } else {
        // Reset login attempts after an hour
        await loginAttempts.resetLoginAttempts(user._id);
      }
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Increment the login attempts counter
      await loginAttempts.addLoginAttempt(user._id);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Reset the login attempts counter on successful login
    await loginAttempts.resetLoginAttempts(user._id);

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour in milliseconds
    });

    user.password = undefined;

    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
}
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate password reset token
    const passwordResetToken = generateRandomToken();
    const passwordResetTokenExpires = new Date();
    passwordResetTokenExpires.setHours(
      passwordResetTokenExpires.getHours() + 1
    ); // Expires in 1 hour

    // Save the password reset token and its expiration to the user's document
    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, passwordResetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
}
async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Invalid or missing data" });
    }

    const user = await User.findOne({ passwordResetToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const currentTime = new Date();
    if (currentTime > user.passwordResetTokenExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while resetting password" });
  }
}
async function changePassword(req, res, next) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}

function requireLogin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token from the 'Bearer {token}' format

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("jwt", { path: "/" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error logging out" });
  }
}
async function getUserProfile(req, res, next) {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password -__v"); // Exclude password and __v fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

async function getUserRecipes(req, res, next) {
  try {
    const userId = req.user.userId;
    const recipes = await Recipe.find({ user_id: userId });

    res.status(200).json(recipes);
  } catch (err) {
    next(err);
  }
}

router.get("/profile", requireLogin, (req, res) => {
  res.json({ message: "This is a protected route" });
});
module.exports = {
  router,
  register,
  login,
  requireLogin,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  getUserRecipes,
  changePassword,
};
