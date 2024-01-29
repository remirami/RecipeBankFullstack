const Recipe = require("../models/recipe");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const recipeController = require("../controllers/recipeController");

const isAuthenticated = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!user.emailConfirmed) {
      return res.status(403).json({ error: "Email not confirmed" });
    }

    // Add user's likes and dislikes to the request object
    decoded.likes = user.likes;
    decoded.dislikes = user.dislikes;

    decoded.isAdmin = user.isAdmin;

    req.user = decoded;
    console.log("User data attached to request:", req.user);
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
};
async function isRecipeOwnerOrAdmin(req, res, next) {
  console.log("Checking if user is the recipe owner or an admin");

  try {
    const recipeId = req.params.recipeId;
    const userId = req.user.userId;

    console.log(`recipeId: ${recipeId}`);
    console.log(`userId: ${userId}`);

    let recipe;

    try {
      recipe = await recipeController.getRecipeById(recipeId);
    } catch (err) {
      console.error("Error getting recipe by ID in isRecipeOwner:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!recipe) {
      console.log("Recipe not found");
      return res.status(404).json({ message: "Recipe not found" });
    }

    console.log(`recipe.user_id: ${recipe.user_id}`);

    if (recipe.user_id._id.toString() !== userId && !req.user.isAdmin) {
      console.log("User is not the recipe owner nor an admin");
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log("User is the recipe owner or an admin, continuing");
    next();
  } catch (err) {
    console.error("Error in isRecipeOwner:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = {
  isAuthenticated,
  isRecipeOwnerOrAdmin,
};
