import path from "path";
import { fileURLToPath } from "url";
import { build as esbuild } from "esbuild";
import fs from "fs";

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

const assetsOut = path.resolve(__dirname, "../../netlify/functions/assets");
fs.mkdirSync(assetsOut, { recursive: true });
const assetsSrc = path.resolve(__dirname, "src/assets");
for (const file of fs.readdirSync(assetsSrc)) {
  fs.copyFileSync(path.join(assetsSrc, file), path.join(assetsOut, file));
}

console.log("Netlify function bundle written to netlify/functions/api.js");
