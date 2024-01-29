require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();

const isTestEnvironment = process.env.NODE_ENV === "test";
const uri = isTestEnvironment
  ? process.env.MONGODB_URI_TEST
  : process.env.MONGODB_URI;
const port = process.env.PORT || 8000;
const { confirmEmail } = require("./controllers/emailController");

const recipeRouter = require("./routes/recipe");
const userRouter = require("./routes/user");
const searchRouter = require("./routes/search");
const randomRouter = require("./routes/random");
const authRouter = require("./routes/auth");
const feedbackRouter = require("./routes/feedback");
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
  ],
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.get("/api/confirm-email/:token", confirmEmail);

app.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route is working" });
});
app.use(mongoSanitize());

app.use(
  "/api/recipes",
  (req, res, next) => {
    console.log("Request received in app.js");
    next();
  },
  recipeRouter
);
app.use(
  "/api/feedback",
  (req, res, next) => {
    console.log("Feedback route hit");
    next();
  },
  feedbackRouter
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use("/api/search", searchRouter);
app.use("/api/random", randomRouter);
app.use("/api/feedback", feedbackRouter);

// Error handling middleware

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal server error");
  next(err);
});

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Start the server using HTTP
    if (!isTestEnvironment) {
      app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
      });
    }
  })
  .catch((err) => console.error(err));

module.exports = app;
