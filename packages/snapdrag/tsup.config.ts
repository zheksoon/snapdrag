import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/core.ts', 'src/plugins.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  esbuildOptions(options) {
    options.mangleProps = /^_/;
  },
});
