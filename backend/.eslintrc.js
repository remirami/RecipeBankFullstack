module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": "off",
    "no-console": "warn",
    "no-eval": "error",
    eqeqeq: "error",
    "prefer-const": "error",
    complexity: ["warn", 12],
  },
};
