const blacklistedWords = [
  "nigger",
  "nigga",
  "cunt",
  "neekeri",
  "tits",
  "titties",
  "goatfucker",
  "taint",
  "zipperhead",
  "towelhead",
  "pickaniny",
  "porchmonkey",
  "negro",
];

const wordFilter = (req, res, next) => {
  const { name, description, ingredients } = req.body;

  const checkString = (str) => {
    if (!str) return false; // If str is undefined, return false

    const words = str.toLowerCase().split(" ");
    return words.some((word) => blacklistedWords.includes(word));
  };

  if (
    checkString(name) ||
    checkString(description) ||
    (ingredients &&
      ingredients.some((ingredient) => checkString(ingredient.name)))
  ) {
    return res.status(400).json({ message: "Inappropriate content detected" });
  }

  next();
};

module.exports = wordFilter;
