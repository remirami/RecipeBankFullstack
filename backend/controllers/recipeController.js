/* eslint-disable complexity */
const Recipe = require("../models/recipe");

async function getAllRecipes() {
  return await Recipe.find().populate("user_id");
}

async function getRecipeById(id) {
  if (!id) throw new Error("ID is required");
  return await Recipe.findById(id).populate("user_id");
}

function validateRecipe(recipeData) {
  console.log(JSON.stringify(recipeData, null, 2));
  const incompatibleFoods = {
    "Red Meat & Ground Meat": ["Vegan", "Vegetarian"],
    "Fish & Seafood": ["Vegan"],
    "Dairy & Eggs": ["Vegan", "Dairy-free", "Lactose-intolerant", "Egg-free"],
    "Chicken & Poultry": ["Vegan", "Vegetarian"],
    "Grains & Rice": ["Low-carb", "Paleo", "Keto", "Gluten-free"],
    Legumes: ["Paleo"],
    "Fruits & Berries": ["Low-carb", "Sugar-free"],
  };
  if (!Array.isArray(recipeData.foodType)) {
    throw new Error("Expected foodType to be an array");
  }

  for (let foodTypeObject of recipeData.foodType) {
    if (!Array.isArray(foodTypeObject.subType)) {
      throw new Error("Expected subType to be an array for each foodType");
    }
  }
  for (let foodTypeObject of recipeData.foodType) {
    const mainType = foodTypeObject.mainType;
    const subType = foodTypeObject.subType;
    if (incompatibleFoods[mainType]) {
      if (recipeData.dietaryPreference) {
        // Check if dietaryPreference is defined
        for (let dietPreference of recipeData.dietaryPreference) {
          // The condition here is updated to check the subtype
          if (
            incompatibleFoods[mainType].includes(dietPreference) &&
            !(
              mainType === "Dairy & Eggs" &&
              dietPreference === "Egg-free" &&
              subType.includes("Dairy") &&
              !subType.includes("Eggs")
            )
          ) {
            throw new Error(
              `Incompatible foodType and dietaryPreference: ${mainType} cannot be ${dietPreference}`
            );
          }
        }
      }
    }
  }
}

async function createRecipe(recipeData) {
  const {
    name,
    user_id,
    foodType,
    dietaryPreference,
    prepTime,
    cookTime,
    foodCategory,
    servingSize,
    ingredientGroups,
  } = recipeData;

  if (recipeData.foodType) {
    recipeData.foodType = recipeData.foodType.map((item) => {
      if (item.contains) {
        item.subType = item.contains;
        delete item.contains;
      }
      return item;
    });
  }
  if (
    prepTime === undefined ||
    !Number.isInteger(Number(prepTime)) ||
    Number(prepTime) <= 0 ||
    Number(prepTime) > 1200
  )
    throw new Error(
      "Prep time is required and must be a positive integer and must be less than 1200"
    );

  if (
    cookTime === undefined ||
    !Number.isInteger(Number(cookTime)) ||
    Number(cookTime) <= 0 ||
    Number(cookTime) > 1200
  )
    throw new Error(
      "Cook time is required and must be a positive integer and must be less than 1200"
    );

  if (!recipeData.foodCategory || typeof recipeData.foodCategory !== "object")
    throw new Error("Food Category is required and must be an object");

  if (
    !recipeData.foodCategory.mealType ||
    typeof recipeData.foodCategory.mealType !== "string"
  )
    throw new Error("Food Category Meal Type is required and must be a string");

  if (
    !recipeData.foodCategory.type ||
    typeof recipeData.foodCategory.type !== "string"
  )
    throw new Error("Food Category Type is required and must be a string"); // Validation check for character limit
  if (recipeData.name.length > 50) {
    throw new Error("Recipe name must be less than or equal to 50 characters");
  }
  // Validation check for description limit
  if (recipeData.description.length > 400) {
    throw new Error(
      "Recipe description must be less than or equal to 400 characters"
    );
  }
  if (!Array.isArray(ingredientGroups)) {
    throw new Error("ingredientGroups must be an array");
  }
  // Validate ingredientGroups
  ingredientGroups.forEach((group) => {
    group.ingredients.forEach((ingredient) => {
      if (!ingredient.name || !ingredient.quantity || !ingredient.unit) {
        throw new Error(
          "Each ingredient must have a name, quantity (as a string), and unit"
        );
      }
    });
  });

  try {
    // Validate the combination of foodType and dietaryPreference
    validateRecipe(recipeData);
    const newRecipe = new Recipe({ ...recipeData, createdBy: user_id });
    console.log("Creating a new recipe:", newRecipe);
    return await newRecipe.save();
  } catch (err) {
    console.error("Error in createRecipe:", err.message);
    throw err;
  }
}
async function getRecipeByName(name) {
  if (!name) throw new Error("Name is required");
  return await Recipe.findOne({ name: name.toLowerCase() });
}

async function updateRecipe(id, recipeData) {
  console.log("recipeData:", recipeData);
  console.log("foodCategory:", recipeData.foodCategory);
  const {
    name,
    user_id,
    foodType,
    dietaryPreference,
    prepTime,
    cookTime,
    foodCategory,
    servingSize,
    ingredientGroups,
  } = recipeData;

  if (recipeData.foodType) {
    recipeData.foodType = recipeData.foodType.map((item) => {
      if (item.contains) {
        item.subType = item.contains;
        delete item.contains;
      }
      return item;
    });
  }

  validateRecipe(recipeData);

  if (
    prepTime === undefined ||
    !Number.isInteger(Number(prepTime)) ||
    Number(prepTime) <= 0 ||
    Number(prepTime) > 1200
  )
    throw new Error(
      "Prep time is required and must be a positive integer and must not be over 1200"
    );

  if (
    cookTime === undefined ||
    !Number.isInteger(Number(cookTime)) ||
    Number(cookTime) <= 0 ||
    Number(cookTime) > 1200
  )
    throw new Error(
      "Cook time is required and must be a positive integer and must not be over 1200"
    );

  if (!recipeData.foodCategory || typeof recipeData.foodCategory !== "object")
    throw new Error("Food Category is required and must be an object");

  if (
    !recipeData.foodCategory.mealType ||
    typeof recipeData.foodCategory.mealType !== "string"
  )
    throw new Error("Food Category Meal Type is required and must be a string");

  if (
    !recipeData.foodCategory.type ||
    typeof recipeData.foodCategory.type !== "string"
  )
    throw new Error("Food Category Type is required and must be a string");

  if (name.length > 50) {
    throw new Error("Recipe name must be less than or equal to 50 characters");
  }

  if (recipeData.description.length > 400) {
    throw new Error(
      "Recipe description must be less than or equal to 400 characters"
    );
  }
  if (!Array.isArray(ingredientGroups)) {
    throw new Error("ingredientGroups must be an array");
  }
  // Validate ingredientGroups
  ingredientGroups.forEach((group) => {
    group.ingredients.forEach((ingredient) => {
      if (!ingredient.name || !ingredient.quantity || !ingredient.unit) {
        throw new Error(
          "Each ingredient must have a name, quantity (as a string), and unit"
        );
      }
    });
  });

  try {
    const existingRecipe = await Recipe.findOne({ name: name });
    if (existingRecipe && String(existingRecipe._id) !== String(id)) {
      throw new Error("A recipe with this name already exists");
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, recipeData, {
      runValidators: true,
      new: true,
    });

    if (!updatedRecipe) {
      throw new Error(`No recipe found with id: ${id}`);
    }

    return updatedRecipe;
  } catch (err) {
    console.error("Error in updateRecipe:", err.message);
    throw err;
  }
}
async function deleteRecipe(id) {
  if (!id) throw new Error("ID is required");
  const result = await Recipe.deleteOne({ _id: id });
  return result.deletedCount;
}

async function addThumbsUp(recipeId, userId) {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new Error(`No recipe found with id ${recipeId}`);

  if (recipe.thumbsUp.includes(userId)) {
    const index = recipe.thumbsUp.indexOf(userId);
    if (index > -1) {
      recipe.thumbsUp.splice(index, 1);
    }
  } else {
    recipe.thumbsUp.push(userId);
  }

  return await recipe.save();
}

async function addThumbsDown(recipeId, userId) {
  if (!userId) throw new Error("userId is null");

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new Error(`No recipe found with id ${recipeId}`);

  if (recipe.thumbsDown.includes(userId)) {
    const index = recipe.thumbsDown.indexOf(userId);
    if (index > -1) {
      recipe.thumbsDown.splice(index, 1);
    }
  } else {
    recipe.thumbsDown.push(userId);
    const index = recipe.thumbsUp.indexOf(userId);
    if (index !== -1) {
      recipe.thumbsUp.splice(index, 1);
    }
  }

  return await recipe.save();
}

async function removeThumbsUp(recipeId, userId) {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new Error(`No recipe found with id ${recipeId}`);

  if (recipe.thumbsUp.includes(userId)) {
    const index = recipe.thumbsUp.indexOf(userId);
    if (index > -1) {
      recipe.thumbsUp.splice(index, 1);
    }
    await recipe.save();
  } else {
    throw new Error(
      `User ${userId} has not liked recipe ${recipeId} to remove the thumbs up`
    );
  }

  return recipe;
}

async function removeThumbsDown(recipeId, userId) {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new Error(`No recipe found with id ${recipeId}`);

  if (recipe.thumbsDown.includes(userId)) {
    const index = recipe.thumbsDown.indexOf(userId);
    if (index > -1) {
      recipe.thumbsDown.splice(index, 1);
    }
    await recipe.save();
  } else {
    throw new Error(
      `User ${userId} has not disliked recipe ${recipeId} to remove the thumbs down`
    );
  }

  return recipe;
}
// To increase the likesCount
async function increaseLikesCount(id) {
  if (!id) throw new Error("ID is required");

  const recipe = await Recipe.findById(id);
  if (!recipe) throw new Error(`No recipe found with id ${id}`);

  // Increment the likesCount by 1
  recipe.likesCount += 1;

  return await recipe.save();
}

// To decrease the likesCount
async function decreaseLikesCount(id) {
  if (!id) throw new Error("ID is required");

  const recipe = await Recipe.findById(id);
  if (!recipe) throw new Error(`No recipe found with id ${id}`);

  // Make sure the likesCount doesn't go below 0
  if (recipe.likesCount > 0) {
    // Decrement the likesCount by 1
    recipe.likesCount -= 1;
  }

  return await recipe.save();
}

// To get recipes sorted by the number of thumbs up
async function getRecipesSortedByThumbsUp() {
  return await Recipe.find()
    .sort((a, b) => b.thumbsUp.length - a.thumbsUp.length)
    .populate("user_id");
}

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeByName,
  addThumbsUp,
  addThumbsDown,
  getRecipesSortedByThumbsUp,
  removeThumbsUp,
  removeThumbsDown,
  increaseLikesCount,
  decreaseLikesCount,
};
