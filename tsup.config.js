import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts"
  },
  dts: {
    index: "src/index.ts"
  },
  outDir: "libs",
  format: ["esm"]
});
