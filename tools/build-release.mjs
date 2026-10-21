import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const nodeModules = new URL("../node_modules/", import.meta.url);

// Owner-requested build-only release preparation. No automated test suite or
// broad corpus/audio/lyric audit runs here. Native changed-behavior acceptance
// and exact Hosting artifact/lease checks are separate release steps.
const stages = [
  { label: "prepared-audio integrity and notices", script: new URL("prepare-audio.mjs", import.meta.url), args: ["--verify-only"] },
  { label: "ABCJS measurement cleanup", script: new URL("patch-abcjs.mjs", import.meta.url) },
  { label: "generate:psalter", script: new URL("generate-legacy-psalter-data.mjs", import.meta.url) },
  { label: "release-safety", script: new URL("validate-release-safety.mjs", import.meta.url) },
  { label: "hosting-config", script: new URL("validate-hosting-config.mjs", import.meta.url) },
  { label: "TypeScript", script: new URL("typescript/bin/tsc", nodeModules), args: ["-b"] },
  { label: "Vite build", script: new URL("vite/bin/vite.js", nodeModules), args: ["build"] },
  { label: "artifact-integrity", script: new URL("validate-build.mjs", import.meta.url) },
];

for (const { label, script, args = [] } of stages) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(process.execPath, [fileURLToPath(script), ...args], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`Unable to run ${label}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
