import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const optionalProvenance = JSON.parse(await readFile(resolve('docs/audio/optional-instruments-provenance.json'), 'utf8'));
const optionalManifest = JSON.parse(await readFile(resolve('src/features/viewer/optionalInstrumentManifest.json'), 'utf8'));
const instruments = [
  { soundFont: 'FluidR3_GM', name: 'acoustic_grand_piano', expectedBytes: 1_983_629, expectedDigest: '257e78e57118ad7ad264b1cdb079e818e2ee6ff630576a037f9e0b490f5ece86' },
  { soundFont: 'FluidR3_GM', name: 'church_organ', expectedBytes: 2_110_917, expectedDigest: '96d3228e7d20f7a67476c3367765dddc66e27a842f90b8bd41a4aff9d767ddce' },
  { soundFont: 'FluidR3_Salamander_GM', name: 'acoustic_grand_piano', expectedBytes: 19_606_163, expectedDigest: '9dceb650f39190528eb940097e64c9badd6ecc5e77d43cf51175139f5fc37741' },
  ...Object.entries(optionalProvenance.banks).map(([name, bank]) => ({ soundFont: 'optional-v1', name, expectedBytes: bank.bytes, expectedDigest: bank.sha256 })),
];

for (const instrument of instruments) {
  const sampleDirectory = resolve(`public/soundfonts/${instrument.soundFont}/${instrument.name}-mp3`);
  const files = (await readdir(sampleDirectory)).filter((name) => name.endsWith('.mp3')).sort();
  const digest = createHash('sha256');
  let bytes = 0;

  for (const name of files) {
    const content = await readFile(resolve(sampleDirectory, name));
    const hasId3 = content.subarray(0, 3).toString('ascii') === 'ID3';
    const hasMpegFrame = content[0] === 0xff && (content[1] & 0xe0) === 0xe0;
    if (!content.length || (!hasId3 && !hasMpegFrame)) throw new Error(`${instrument.soundFont}/${instrument.name}/${name} does not look like an MP3 sample.`);
    if (instrument.soundFont === 'optional-v1') {
      const expected = optionalManifest[instrument.name].find(sample => `${sample.name}.mp3` === name);
      if (!expected || content.length !== expected.bytes || createHash('sha256').update(content).digest('hex') !== expected.sha256) throw new Error(`Optional sample manifest mismatch: ${instrument.name}/${name}`);
    }
    bytes += content.length;
    digest.update(name);
    digest.update('\0');
    digest.update(content);
  }

  const actualDigest = digest.digest('hex');
  console.log(`${instrument.soundFont}/${instrument.name} samples: ${files.length} files, ${bytes} bytes, aggregate SHA-256 ${actualDigest}.`);
  if (files.length !== 89 || bytes !== instrument.expectedBytes || actualDigest !== instrument.expectedDigest) process.exitCode = 1;
}
