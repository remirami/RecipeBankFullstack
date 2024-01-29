/*const assert = require("assert");
const mongoose = require("mongoose");
const Recipe = require("../../models/recipe");
const request = require("supertest");
const app = require("../../app");

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
beforeEach(async () => {
  const sampleRecipes = [
    {
      name: "Chocolate Cake",
      ingredients: ["chocolate", "flour", "sugar", "eggs"],
      directions: ["Mix ingredients", "Bake"],
    },
    {
      name: "Apple Pie",
      ingredients: ["apples", "flour", "sugar", "cinnamon"],
      directions: ["Prepare apples", "Mix ingredients", "Bake"],
    },
    {
      name: "Carrot Cake",
      ingredients: ["carrots", "flour", "sugar", "eggs"],
      directions: ["Grate carrots", "Mix ingredients", "Bake"],
    },
  ];

  await Recipe.insertMany(sampleRecipes);
});

afterEach(async () => {
  await Recipe.deleteMany({});
});
describe("Search", () => {
  it("should return recipes matching the search term", async () => {
    const searchTerm = "cake";
    const response = await request(app).get(`/search?searchTerm=${searchTerm}`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.length, 2);
    response.body.forEach((recipe) => {
      assert.ok(recipe.name.toLowerCase().includes(searchTerm));
    });
  });

  it("should return an empty array if no recipes match the search term", async () => {
    const searchTerm = "nonexistent";
    const response = await request(app).get(`/search?searchTerm=${searchTerm}`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.length, 0);
  });
});
*/
