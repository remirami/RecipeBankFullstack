require("dotenv").config();
const assert = require("assert");
const mongoose = require("mongoose");
const Recipe = require("../../models/recipe");
const app = require("../../test-app");

describe("Recipe", () => {
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

  it("should create a recipe", async () => {
    const recipe = new Recipe({
      user_id: new mongoose.Types.ObjectId(),
      name: "Pancakes",
      description: "Fluffy pancakes for breakfast",
      ingredients: [{ name: "Flour", amount: "1 cup" }],
      directions: ["Mix ingredients", "Cook on griddle"],
    });
    const savedRecipe = await recipe.save();
    assert.strictEqual(savedRecipe.name, "Pancakes");
  });

  it("should require a name", async () => {
    const recipe = new Recipe({
      user_id: new mongoose.Types.ObjectId(),
      description: "Fluffy pancakes for breakfast",
      ingredients: [{ name: "Flour", amount: "1 cup" }],
      directions: ["Mix ingredients", "Cook on griddle"],
    });
    try {
      await recipe.validate();
    } catch (error) {
      assert.strictEqual(
        error.errors["name"].message,
        "Path `name` is required."
      );
    }
  });

  it("should require a user_id", async () => {
    const recipe = new Recipe({
      name: "Pancakes",
      description: "Fluffy pancakes for breakfast",
      ingredients: [{ name: "Flour", amount: "1 cup" }],
      directions: ["Mix ingredients", "Cook on griddle"],
    });
    try {
      await recipe.validate();
    } catch (error) {
      assert.strictEqual(
        error.errors["user_id"].message,
        "Path `user_id` is required."
      );
    }
  });

  it("should allow ingredients to be empty", async () => {
    const recipe = new Recipe({
      user_id: new mongoose.Types.ObjectId(),
      name: "Pancakes",
      description: "Fluffy pancakes for breakfast",
      directions: ["Mix ingredients", "Cook on griddle"],
    });
    const savedRecipe = await recipe.save();
    assert.strictEqual(savedRecipe.ingredients.length, 0);
  });

  it("should allow directions to be empty", async () => {
    const recipe = new Recipe({
      user_id: new mongoose.Types.ObjectId(),
      name: "Pancakes",
      description: "Fluffy pancakes for breakfast",
      ingredients: [{ name: "Flour", amount: "1 cup" }],
    });
    const savedRecipe = await recipe.save();
    assert.strictEqual(savedRecipe.directions.length, 0);
  });
});
