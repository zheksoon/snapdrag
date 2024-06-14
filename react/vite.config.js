import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true, outDir: "dist/types" })],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "snapdrag-react",
      // the proper extensions will be added
      fileName: "snapdrag-react",
      formats: ["umd", "es", "cjs"],
    },
    rollupOptions: {
      external: ["snapdrag/core", "react", "react-dom"],
    },
  },
});
