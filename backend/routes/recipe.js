const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const wordFilter = require("../middleware/wordFilter");
const { isRecipeOwnerOrAdmin } = require("../middleware/authMiddleware");
const { dailyRecipeLimit } = require("../middleware/middleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware.isAuthenticated,
  wordFilter,
  dailyRecipeLimit,
  async (req, res, next) => {
    try {
      const { name, user_id } = req.body;

      if (!name || !user_id) {
        console.log("name:", name, "user_id:", user_id);
        return res
          .status(400)
          .json({ message: "Name and user_id are required" });
      }

      const newRecipe = await recipeController.createRecipe(req.body);
      res.status(201).json(newRecipe);
    } catch (err) {
      if (err.message.includes("Incompatible foodType and dietaryPreference")) {
        res.status(400).json({ message: err.message });
      } else {
        next(err);
      }
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const recipes = await recipeController.getAllRecipes();
    res.status(200).json(recipes);
  } catch (err) {
    next(err);
  }
});
router.get("/check-name", async (req, res, next) => {
  try {
    const name = req.query.name;
    const recipe = await recipeController.getRecipeByName(name);
    res.status(200).json({ exists: !!recipe });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const recipe = await recipeController.getRecipeById(req.params.id);
    res.status(200).json(recipe);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:recipeId",
  authMiddleware.isAuthenticated,
  isRecipeOwnerOrAdmin,
  wordFilter,
  async (req, res, next) => {
    try {
      console.log("Received PUT request for recipe ID:", req.params.recipeId);
      console.log("Request body:", req.body);

      const result = await recipeController.updateRecipe(
        req.params.recipeId,
        req.body
      );

      if (result === 0) {
        res.status(404).json({ message: "Recipe not found" });
      } else {
        res.status(200).json({ message: "Recipe updated successfully" });
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      if (
        error.message.includes("Incompatible foodType and dietaryPreference")
      ) {
        res.status(400).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }
);

router.delete(
  "/:recipeId",
  authMiddleware.isAuthenticated,
  isRecipeOwnerOrAdmin,
  async (req, res, next) => {
    try {
      const result = await recipeController.deleteRecipe(req.params.recipeId);
      if (result === 0) {
        res.status(404).json({ message: "Recipe not found" });
      } else {
        res.status(200).json({ message: "Recipe deleted successfully" });
      }
    } catch (err) {
      next(err);
    }
  }
);
// Thumbs Up a Recipe
router.post(
  "/:id/thumbsup",
  authMiddleware.isAuthenticated,
  async (req, res, next) => {
    try {
      const recipe = await recipeController.addThumbsUp(
        req.params.id,
        req.user.userId
      );

      // Call the method to increase likesCount
      await recipeController.increaseLikesCount(req.params.id);

      res.status(200).json(recipe);
    } catch (err) {
      next(err);
    }
  }
);

// Remove Thumbs Up from a Recipe
router.delete(
  "/:id/thumbsup",
  authMiddleware.isAuthenticated,
  async (req, res, next) => {
    try {
      const recipe = await recipeController.removeThumbsUp(
        req.params.id,
        req.user.userId
      );

      // Call the method to decrease likesCount
      await recipeController.decreaseLikesCount(req.params.id);

      res.status(200).json(recipe);
    } catch (err) {
      next(err);
    }
  }
);

// Thumbs Down a Recipe
router.post(
  "/:id/thumbsdown",
  authMiddleware.isAuthenticated,
  async (req, res, next) => {
    try {
      const recipe = await recipeController.addThumbsDown(
        req.params.id,
        req.user.userId
      );

      // Call the method to increase likesCount
      await recipeController.increaseLikesCount(req.params.id);

      res.status(200).json(recipe);
    } catch (err) {
      next(err);
    }
  }
);

// Remove Thumbs Down from a Recipe
router.delete(
  "/:id/thumbsdown",
  authMiddleware.isAuthenticated,
  async (req, res, next) => {
    try {
      const recipe = await recipeController.removeThumbsDown(
        req.params.id,
        req.user.userId
      );

      // Call the method to decrease likesCount
      await recipeController.decreaseLikesCount(req.params.id);

      res.status(200).json(recipe);
    } catch (err) {
      next(err);
    }
  }
);
module.exports = router;
