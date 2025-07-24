import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'es2022',
  tsconfig: 'tsconfig.json',
  esbuildOptions: (options) => {
    options.jsx = 'automatic';
  },
});