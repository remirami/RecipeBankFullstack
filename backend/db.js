require("dotenv").config();

const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

const dbName = "recipebank";

async function connect() {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: dbName,
  });
  console.log("Connected to MongoDB using Mongoose");
}

async function createRecipesCollection() {
  console.log("Recipes collection will be created by Mongoose");
}

async function createUsersCollection() {
  console.log("Users collection will be created by Mongoose");
}

module.exports = {
  connect,
  createRecipesCollection,
  createUsersCollection,
};
