/** Root ESLint config — apps/packages extend their own from @pixelgame/eslint-config */
module.exports = {
  root: true,
  ignorePatterns: [
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".turbo",
    ".next",
    "*.config.cjs",
    "*.config.js"
  ],
  extends: ["@pixelgame/eslint-config"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  }
};
