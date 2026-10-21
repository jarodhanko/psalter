import { readCanonicalPsalterSource } from './read-canonical-psalter-source.mjs';
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  hashGeneratedArtifacts,
  legacyPsalterArrangementCount,
  legacyPsalterCanonicalCount,
  legacyPsalterCorpusVersion,
  legacyPsalterManifestSchemaVersion,
  legacyPsalterPackageId,
  sha256,
} from "./legacy-psalter-manifest.mjs";

const root = resolve(import.meta.dirname, "..");
const psalmMapPath = resolve(root, "src/data/psalterPsalmMap.ts");
const packagePath = resolve(root, "package.json");
const generatedPath = resolve(root, "src/data/generated");
const abcPath = resolve(generatedPath, "abc");
const primaryExport = /^psalter[1-9]\d*$/;
const psalterExport = /^psalter(\d+)(.*)$/;

const fieldValues = (abc, field) => abc.split(/\r?\n/).flatMap((line) => {
  const match = line.match(new RegExp(`^\\s*${field}:\\s*(.*?)\\s*$`, "i"));
  return match?.[1] ? [match[1]] : [];
});
const exactFieldValues = (abc, field) => abc.split(/\r?\n/).flatMap((line) => {
  const match = line.match(new RegExp(`^\\s*${field}:\\s*(.*?)\\s*$`));
  return match?.[1] ? [match[1]] : [];
});
const firstField = (abc, field) => fieldValues(abc, field)[0];
const normalizeSearchText = (values) => values.filter((value) => value !== undefined && value !== "")
  .join(" ").toLowerCase().normalize("NFKD").replace(/æ/g, 'ae').replace(/[^a-z0-9]+/g, " ").trim();
const parseVoices = (abc) => {
  const seen = new Set();
  return fieldValues(abc, "V").flatMap((definition) => {
    const id = definition.match(/^(\S+)/)?.[1];
    if (!id || seen.has(id)) return [];
    const attributes = definition.slice(id.length).trim();
    if (!attributes) return [];
    seen.add(id);
    const name = attributes.match(/\bname=(?:"([^"]*)"|'([^']*)'|(\S+))/i);
    const assignedClef = attributes.match(/\bclef=(?:"([^"]*)"|'([^']*)'|(\S+))/i);
    const bareClef = attributes.match(/\b(treble|bass|alto|tenor|perc(?:ussion)?)\b/i);
    return [{ id, ...((assignedClef || bareClef) ? { clef: (assignedClef ? assignedClef[1] || assignedClef[2] || assignedClef[3] : bareClef[1]).toLowerCase() } : {}), ...(name ? { name: name[1] || name[2] || name[3] } : {}) }];
  });
};
const parseMetadata = (abc, fallbackPsalmNumber) => {
  const credits = fieldValues(abc, "C");
  const tuneCredit = credits.find((credit) => /^tune\s*:/i.test(credit));
  const credit = tuneCredit ? tuneCredit.replace(/^tune\s*:\s*/i, "") : credits[0];
  const creditParts = credit?.split(/\s*(?:;|—)\s*/, 2);
  const hasExplicitTune = Boolean(tuneCredit || creditParts?.length > 1);
  const reference = ["R", "O", "N"].flatMap((field) => fieldValues(abc, field)).find((value) => /Psalm\s+\d+/i.test(value));
  const psalm = reference?.match(/Psalm\s+(\d+)/i);
  const psalmNumber = psalm ? Number(psalm[1]) : fallbackPsalmNumber;
  const meter = reference?.replace(/^.*?Psalm\s+\d+\s*(?:[;,.]\s*)?/i, "").trim();
  const [title, ...otherTitles] = fieldValues(abc, "T");
  const tuneTitle = otherTitles.find((value) => !/^Psalm\s+\d+\b/i.test(value));
  const tune = hasExplicitTune && creditParts?.[0]
    ? creditParts[0]
    : tuneTitle;
  const composer = creditParts?.[1] ? creditParts[1] : !hasExplicitTune ? credit : undefined;
  const note = firstField(abc, "N");
  const underlay = exactFieldValues(abc, "w");
  const transcripts = exactFieldValues(abc, "W");
  const stanzaNumber = (line) => Number(/^\s*(\d+)\.(?:\s|~)/.exec(line)?.[1]);
  const underlaidNumbers = [...new Set(underlay.map(stanzaNumber).filter(Number.isFinite))].sort((a, b) => a - b);
  const transcriptNumbers = transcripts.map(stanzaNumber).filter(Number.isFinite).sort((a, b) => a - b);
  const completeTranscripts = transcripts.length > 0 && transcriptNumbers.length === transcripts.length
    && underlaidNumbers.length === transcriptNumbers.length
    && underlaidNumbers.every((number, index) => number === transcriptNumbers[index]);
  const lyrics = completeTranscripts ? transcripts : fieldValues(abc, "w");
  // Keep both syllabified and joined spellings searchable, but do not repeat
  // an already identical normalized W: line in the lazy index.
  const joinedSyllables = (completeTranscripts ? [] : underlay).map((line) => line.replace(/-/g, ""))
    .filter((joined, index) => normalizeSearchText([joined]) !== normalizeSearchText([underlay[index]]));
  return { ...(title ? { title } : {}), ...(tune ? { tune } : {}), ...(composer ? { composer } : {}), ...(note ? { note } : {}), ...(reference ? { reference } : {}), ...(psalmNumber ? { psalmNumber } : {}), ...(meter ? { meter } : {}), lyrics, voices: parseVoices(abc), searchText: normalizeSearchText([title, tune, composer, note, reference, psalmNumber ? `Psalm ${psalmNumber}` : undefined, meter, ...lyrics, ...joinedSyllables]) };
};

const source = await readCanonicalPsalterSource({ root });
const psalmMapSource = await readFile(psalmMapPath, "utf8");
const { version: releaseVersion } = JSON.parse(await readFile(packagePath, "utf8"));
const psalmMapLiteral = psalmMapSource.match(/psalmNumbersByPsalterNumber[^=]*=\s*(\[[\s\S]*?\]);/)?.[1];
if (!psalmMapLiteral) throw new Error("Could not read psalmNumbersByPsalterNumber.");
const laterPsalmMapLiteral = psalmMapSource.match(/laterPsalmNumbersByPsalterNumber[^=]*=\s*(\[[\s\S]*?\]);/)?.[1];
if (!laterPsalmMapLiteral) throw new Error("Could not read laterPsalmNumbersByPsalterNumber.");
const psalmNumbersByPsalterNumber = [...JSON.parse(psalmMapLiteral), ...JSON.parse(laterPsalmMapLiteral)];
const exported = [...source.matchAll(/export const (psalter\w+) = `([\s\S]*?)`;/g)]
  .map(([, id, abc]) => ({ id, abc, match: id.match(psalterExport) }))
  .filter(({ match }) => match && Number(match[1]) >= 1 && Number(match[1]) <= legacyPsalterCanonicalCount);
const songs = exported.map(({ id, abc, match }) => {
  const number = Number(match[1]);
  return { id, abc, number, variant: match[2], ...parseMetadata(abc, psalmNumbersByPsalterNumber[number] ?? undefined) };
})
  .filter((song) => song.variant !== "combined")
  .sort((left, right) => left.number - right.number || (left.variant === "" ? -1 : right.variant === "" ? 1 : left.id.localeCompare(right.id)))
  .filter((song, index, all) => !all.slice(0, index).some((candidate) => candidate.number === song.number && candidate.abc === song.abc));
if (songs.length !== legacyPsalterArrangementCount || !songs.filter((song) => primaryExport.test(song.id)).every((song) => songs.some((candidate) => candidate.id === song.id))) throw new Error(`Expected ${legacyPsalterArrangementCount} distinct arrangements with canonical exports; found ${songs.length}.`);

await rm(generatedPath, { recursive: true, force: true });
await mkdir(abcPath, { recursive: true });
const artifacts = songs.map((song) => ({
  path: `abc/${song.id}.ts`,
  source: `// Generated from src/psalter-abc.ts. Do not edit manually.\nexport default ${JSON.stringify(song.abc)};\n`,
}));
const metadata = songs.map(({ abc, lyrics, searchText, ...song }) => song);
const searchIndex = Object.fromEntries(songs.map((song) => [song.id, song.searchText]));
artifacts.push(
  { path: "legacyPsalterMetadata.ts", source: `// Generated from src/psalter-abc.ts. Do not edit manually.\nimport type { SongbookCatalogSong } from "../../domain/songbook";\n\nexport const legacyPsalterMetadata: readonly SongbookCatalogSong[] = ${JSON.stringify(metadata, null, 2)};\n` },
  { path: "legacyPsalterSearchIndex.ts", source: `// Generated from src/psalter-abc.ts. Do not edit manually.\nimport type { SongbookSearchIndex } from "../../domain/songbook";\n\nexport const legacyPsalterSearchIndex: SongbookSearchIndex = ${JSON.stringify(searchIndex)};\n` },
);
await Promise.all(artifacts.map(({ path, source: artifactSource }) => writeFile(resolve(generatedPath, path), artifactSource)));
const manifest = {
  packageId: legacyPsalterPackageId,
  schemaVersion: legacyPsalterManifestSchemaVersion,
  corpusVersion: legacyPsalterCorpusVersion,
  releaseVersion,
  canonicalCount: legacyPsalterCanonicalCount,
  arrangementCount: legacyPsalterArrangementCount,
  canonicalAbcSha256: sha256(source),
  generatedArtifactsSha256: hashGeneratedArtifacts(artifacts),
};
await writeFile(resolve(generatedPath, "legacyPsalterManifest.ts"), `// Generated from src/psalter-abc.ts. Do not edit manually.\n\nexport const legacyPsalterManifest = ${JSON.stringify(manifest, null, 2)} as const;\n`);
console.log(`Generated compact metadata, one lazy search index, and ${songs.length} lazy ABC modules.`);
