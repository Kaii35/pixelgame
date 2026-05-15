module.exports = {
  extends: ['./base.cjs'],
  env: { node: true, es2022: true },
  rules: {
    'no-process-env': 'off',
  },
};
