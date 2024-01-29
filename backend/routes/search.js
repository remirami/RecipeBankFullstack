/* eslint-disable complexity */
const express = require("express");
const Recipe = require("../models/recipe");
const User = require("../models/user");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const {
      searchTerm,
      categoryType,
      mealType,
      searchByUsername,
      includeLiked,
      searchByLikes,
      foodType,
      subType,
      dietaryPreferences,
      maxCookTime,
    } = req.query;

    const query = {};

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { "ingredients.name": { $regex: searchTerm, $options: "i" } },
      ];

      if (searchByUsername && searchByUsername === "true") {
        const users = await User.find({
          username: { $regex: searchTerm, $options: "i" },
        }).exec();
        const userIds = users.map((user) => user._id);
        query.$or.push({ user_id: { $in: userIds } });
      }
    }

    if (mealType) {
      query["foodCategory.mealType"] = mealType;
    }

    if (foodType) {
      query["foodType.mainType"] = foodType;
    }

    if (subType) {
      query["foodType.subType"] = { $in: [subType] };
    }
    if (categoryType) {
      query["foodCategory.type"] = categoryType;
    }

    if (includeLiked === "true" && req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        query._id = { $in: user.likes };
      }
    }

    if (maxCookTime) {
      const maxTime = Number(maxCookTime);

      // Check if maxCookTime is a valid number and greater than zero
      if (!isNaN(maxTime) && maxTime > 0) {
        query.cookTime = { $lte: maxTime };
      }
    }

    if (dietaryPreferences) {
      query.dietaryPreference = { $in: dietaryPreferences };
    }

    let recipes = await Recipe.find(query).populate("user_id").exec();
    if (searchByLikes === "true") {
      // Filter out recipes with less than 1 likes
      recipes = recipes.filter((recipe) => recipe.thumbsUp.length >= 1);

      // Sort the recipes by the number of likes in descending order
      recipes.sort((a, b) => b.thumbsUp.length - a.thumbsUp.length);
    }

    res.status(200).json({
      status: "success",
      data: {
        recipes,
        count: recipes.length,
      },
    });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
