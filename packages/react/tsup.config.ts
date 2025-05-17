import { type Options, defineConfig } from "tsup";

const config: Options = {
  entry: {
    index: "./src/index.ts",
  },
  outDir: "./dist",
  format: ["esm", "cjs"],
  target: "es2020",
  ignoreWatch: ["**/dist/**", "**/node_modules/**", "*.test.ts"],
  clean: true,
  dts: true, // Use tsconfig for dts options
  sourcemap: true,
  splitting: true,
  treeshake: true,
  minify: process.env.NODE_ENV === "production",
  skipNodeModulesBundle: true,
  external: ["node_modules", "@snapdrag/core"],
  esbuildOptions(options) {
    options.mangleProps = /^_/;
  },
};

export default defineConfig([config]);
