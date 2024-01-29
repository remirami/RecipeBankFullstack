const mongoose = require("mongoose");
const ingredientSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  unit: { type: String, required: true },
});

const ingredientGroupSchema = new mongoose.Schema({
  title: { type: String, required: false },
  ingredients: [ingredientSchema],
});
const recipeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, lowercase: true, unique: false },
    description: { type: String },
    ingredientGroups: [ingredientGroupSchema],
    instructions: [{ type: String }],
    thumbsUp: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    thumbsDown: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    foodType: [
      {
        mainType: {
          type: String,
          enum: [
            "Vegetable",
            "Sausage",
            "Red Meat & Ground Meat",
            "Marinades & Sauces",
            "Fish & Seafood",
            "Dairy & Eggs",
            "Chicken & Poultry",
            "Grains & Rice",
            "Legumes",
            "Fruits & Berries",
            "Beverages",
          ],
          required: true,
        },
        subType: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    foodCategory: {
      mealType: {
        type: String,
        enum: ["Dessert", "Main Course", "Appetizer", "Breakfast", "Side Dish"],
        required: true,
      },
      type: {
        type: String,
        enum: [
          "Soup",
          "Salad",
          "Snack",
          "Pizza",
          "Bread",
          "Beverage",
          "Pasta",
          "Pie",
          "Bake",
          "Pastry",
          "Cake",
          "Other",
        ],
        required: false,
      },
    },
    dietaryPreference: [
      {
        type: String,

        enum: [
          "Vegan",
          "Vegetarian",
          "Gluten-free",
          "Dairy-free",
          "Paleo",
          "Keto",
          "Low-carb",
          "Low-fat",
          "Low-sodium",
          "Sugar-free",
          "Lactose-intolerant",
          "Egg-free",
        ],
        required: false,
      },
    ],
    prepTime: {
      type: Number,
      required: true,
    },
    cookTime: {
      type: Number,
      required: true,
    },
    servingSize: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
