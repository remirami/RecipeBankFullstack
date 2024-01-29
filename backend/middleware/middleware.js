const Recipe = require("../models/recipe");
const jwt = require("jsonwebtoken");

const dailyRecipeLimit = async (req, res, next) => {
  const userId = req.body.user_id;
  const limit = 10;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required." });
  }

  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  console.log("Today:", today);
  console.log("Yesterday:", yesterday);

  try {
    const count = await Recipe.countDocuments({
      user_id: userId,
      createdAt: { $gte: yesterday, $lte: today },
    });

    console.log("Recipe count:", count);

    if (count >= limit) {
      return res.status(429).json({ message: "Daily recipe limit reached." });
    }

    next();
  } catch (error) {
    console.error("Error checking daily recipe limit:", error);
    return res
      .status(500)
      .json({ message: "Error checking daily recipe limit." });
  }
};

const checkRecipeOwnership = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (
      recipe.user.toString() !== req.user.userId.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking recipe ownership", error });
  }
};

module.exports = {
  dailyRecipeLimit,
  checkRecipeOwnership,
};
