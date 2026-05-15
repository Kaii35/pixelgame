/**
 * Layer boundary rules for apps/client.
 * Enforces: engine ↛ network, network ↛ engine, features isolated from each other.
 * Apply by extending this config in apps/client/.eslintrc.cjs.
 */
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app/*' },
      { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
      { type: 'engine', pattern: 'src/engine/*' },
      { type: 'network', pattern: 'src/network/*' },
      { type: 'state', pattern: 'src/state/*' },
      { type: 'api', pattern: 'src/api/*' },
      { type: 'ui', pattern: 'src/ui/*' },
      { type: 'lib', pattern: 'src/lib/*' },
    ],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'allow',
        rules: [
          { from: 'engine', disallow: ['network', 'api'] },
          { from: 'network', disallow: ['engine'] },
          {
            from: 'feature',
            disallow: [['feature', { feature: '!${feature}' }]],
            message: 'A feature must not import from another feature directly.',
          },
          { from: 'ui', disallow: ['feature', 'engine', 'network', 'api'] },
        ],
      },
    ],
  },
};
