const { expect } = require("chai");
const { createRecipe } = require("../controllers/recipeController");
const { getDb } = require("../db");

describe("createRecipe", () => {
  let db;

  before(async () => {
    db = await getDb();
  });

  afterEach(async () => {
    await db.collection("recipes").deleteMany({});
  });

  after(async () => {
    await db.collection("recipes").drop();
  });

  it("should create a recipe", async () => {
    const recipe = {
      user_id: "user123",
      name: "Pasta Carbonara",
      description: "Creamy and delicious",
    };
    const resultId = await createRecipe(recipe);

    expect(resultId).to.be.a("string");

    const insertedRecipe = await db
      .collection("recipes")
      .findOne({ _id: resultId });
    expect(insertedRecipe).to.be.an("object");
    expect(insertedRecipe.user_id).to.equal(recipe.user_id);
    expect(insertedRecipe.name).to.equal(recipe.name);
    expect(insertedRecipe.description).to.equal(recipe.description);
  });
});
