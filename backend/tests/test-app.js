const express = require("express");
const app = express();
const mongoose = require("mongoose");
const recipeRouter = require("./routes/recipe");
const userRouter = require("./routes/user");
const { connect } = require("./db");

const port = process.env.PORT || 3000;

process.env.NODE_ENV = "test";

app.use(express.json());
app.use("/recipes", recipeRouter);
app.use("/users", userRouter);

module.exports = app;
