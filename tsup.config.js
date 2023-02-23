import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "tailwind.config": "src/windi/index.ts"
  },
  dts: {
    entry: {
      index: "src/index.ts",
      "tailwind.config": "src/windi/index.ts"
    }
  },
  outDir: "libs",
  format: ["esm", "cjs"],
  clean: true
});
