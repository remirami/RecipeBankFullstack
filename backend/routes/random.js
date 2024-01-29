const express = require("express");
const Recipe = require("../models/recipe");

const router = express.Router();

router.get("/random", async (req, res, next) => {
  try {
    const recipeCount = await Recipe.countDocuments();
    const randomIndex = Math.floor(Math.random() * recipeCount);
    const randomRecipe = await Recipe.findOne().skip(randomIndex);

    res.status(200).json(randomRecipe);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
