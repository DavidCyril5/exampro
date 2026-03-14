import path from "path";
import { fileURLToPath } from "url";
import { build as esbuild } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await esbuild({
  entryPoints: [path.resolve(__dirname, "src/netlify-handler.ts")],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: path.resolve(__dirname, "../../netlify/functions/api.js"),
  logLevel: "info",
});

console.log("Netlify function bundle written to netlify/functions/api.js");
