import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Required for @colyseus/schema's @type(...) decorators.
  // tsup forwards these to esbuild's tsconfig.
  tsconfig: 'tsconfig.json',
});
