import { type Options, defineConfig } from "tsup";

const config: Options = {
  entry: {
    index: "./src/react/index.ts",
    core: "./src/core/index.ts",
    plugins: "./src/plugins/index.ts",
  },
  outDir: "./dist",
  format: ["esm", "cjs"],
  target: "es2020",
  ignoreWatch: ["**/dist/**", "**/node_modules/**", "*.test.ts"],
  // clean: true,
  dts: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  minify: process.env.NODE_ENV === "production",
  skipNodeModulesBundle: true,
  external: ["node_modules"],
};

export default defineConfig([config]);
