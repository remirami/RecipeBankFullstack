const assert = require("assert");
const mongoose = require("mongoose");
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const app = require("../../test-app");

describe("User", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await mongoose.connection.db.dropDatabase();
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it("should create a user", async () => {
    const user = new User({
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    });
    const savedUser = await user.save();
    assert.strictEqual(savedUser.username, "testuser");
  });

  it("should require a username", async () => {
    const user = new User({
      email: "test@example.com",
      password: "testpassword",
    });
    try {
      await user.validate();
    } catch (error) {
      assert.strictEqual(
        error.errors["username"].message,
        "Path `username` is required."
      );
    }
  });

  // Additional tests

  it("should enforce unique usernames", async () => {
    const user1 = new User({
      username: "duplicateuser",
      email: "user1@example.com",
      password: "testpassword",
    });
    const user2 = new User({
      username: "duplicateuser",
      email: "user2@example.com",
      password: "testpassword",
    });
    await user1.save();
    try {
      await user2.save();
    } catch (error) {
      assert.strictEqual(error.code, 11000); // Duplicate key error code
    }
  });

  it("should enforce unique email addresses", async () => {
    const user1 = new User({
      username: "user1",
      email: "duplicate@example.com",
      password: "testpassword",
    });
    const user2 = new User({
      username: "user2",
      email: "duplicate@example.com",
      password: "testpassword",
    });
    await user1.save();
    try {
      await user2.save();
    } catch (error) {
      assert.strictEqual(error.code, 11000); // Duplicate key error code
    }
  });

  it("should validate email format", async () => {
    const user = new User({
      username: "invalidemailuser",
      email: "invalidemail",
      password: "testpassword",
    });
    try {
      await user.validate();
    } catch (error) {
      assert.strictEqual(error.errors["email"].message, "Invalid email format");
    }
  });

  it("should encrypt the password", async () => {
    const user = new User({
      username: "encryptedpassworduser",
      email: "encrypted@example.com",
      password: "testpassword",
    });
    const savedUser = await user.save();
    assert.notStrictEqual(savedUser.password, "testpassword");
    assert.strictEqual(
      await bcrypt.compare("testpassword", savedUser.password),
      true
    );
  });

  it("should require a password of minimum length", async () => {
    const user = new User({
      username: "shortpassworduser",
      email: "short@example.com",
      password: "short",
    });
    try {
      await user.validate();
    } catch (error) {
      assert.strictEqual(
        error.errors["password"].message,
        "Password should be at least 8 characters long"
      );
    }
  });
});
