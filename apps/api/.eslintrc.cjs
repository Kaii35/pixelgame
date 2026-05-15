module.exports = {
  extends: ['@pixelgame/eslint-config/node.cjs'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/no-default-export': 'off',
    // NestJS class-based DI requires VALUE imports for injectable types so
    // their constructor metadata survives compilation. consistent-type-imports
    // auto-fix flips them to `import type` and breaks runtime resolution.
    '@typescript-eslint/consistent-type-imports': 'off',
  },
};
