module.exports = {
  extends: [
    '@pixelgame/eslint-config/react.cjs',
    '@pixelgame/eslint-config/import-boundaries.cjs',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
