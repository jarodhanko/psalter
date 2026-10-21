import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

export const legacyPsalterManifestSchemaVersion = 1;
export const legacyPsalterPackageId = "psalter-1912";
export const legacyPsalterCorpusVersion = "1912.2";
export const legacyPsalterCanonicalCount = 450;
export const legacyPsalterArrangementCount = 474;

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

/** Hash generated source by path and bytes, so additions, removals, and edits are all observable. */
export const hashGeneratedArtifacts = (artifacts) => {
  const digest = createHash("sha256");
  for (const { path, source } of [...artifacts].sort((left, right) => left.path.localeCompare(right.path))) {
    digest.update(path).update("\0").update(source).update("\0");
  }
  return digest.digest("hex");
};

export const readGeneratedArtifacts = async (generatedPath) => {
  const files = [];
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith(".ts") && entry.name !== "legacyPsalterManifest.ts") {
        files.push({ path: relative(generatedPath, path).replaceAll("\\", "/"), source: await readFile(path, "utf8") });
      }
    }
  };
  await visit(generatedPath);
  return files;
};

export const parseGeneratedManifest = (source) => {
  const literal = source.match(/legacyPsalterManifest\s*=\s*(\{[\s\S]*\})\s+as const;/)?.[1];
  if (!literal) throw new Error("Could not parse generated legacy Psalter manifest.");
  return JSON.parse(literal);
};
