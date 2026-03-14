import path from "path";
import { fileURLToPath } from "url";
import { build as esbuild } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await esbuild({
  entryPoints: [path.resolve(__dirname, "src/app.ts")],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: path.resolve(__dirname, "../../api/app-bundle.cjs"),
  logLevel: "info",
});

console.log("API bundle written to api/app-bundle.cjs");
