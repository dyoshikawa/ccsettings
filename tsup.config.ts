import { defineConfig } from 'tsup'

const config = defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: false,
  shims: true,
  sourcemap: true,
  splitting: false,
})

export default config
