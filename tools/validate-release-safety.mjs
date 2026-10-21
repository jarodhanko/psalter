import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPsalterRecordingPolicy } from './psalter-recording-policy.mjs';
import { readHymnRecordingPolicy } from './hymn-recording-policy.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
// Check identities and qualifications before release, independently of emitted
// build coverage. The existing Psalter pair pin remains a separate policy.
await readPsalterRecordingPolicy(root);
await readHymnRecordingPolicy(root);
const result = spawnSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8' });

if (result.error) {
  console.error(`FAIL could not list tracked files: ${result.error.message}`);
  process.exitCode = 1;
} else if (result.status !== 0) {
  console.error(`FAIL git ls-files exited with ${result.status}: ${result.stderr.trim()}`);
  process.exitCode = 1;
} else {
  const protectedRoots = [
    'temp/',
    'reference/',
    'transcriptions/',
    'scripts/',
    'psalter-work/',
    'scratch/',
    'scans/',
    'scanned-pages/',
    'photos/',
    'photographs/',
    'archives/',
    '.firebase/',
    '.audio-cache/',
    'public/soundfonts/',
  ];
  const protectedFiles = new Set(['.firebaserc']);
  const archivePattern = /\.(?:7z|zip|rar|tar|tgz|gz|bz2|xz)$/i;
  const scanPattern = /(?:^|\/)(?:scan|page|photo|photograph)[-_ ]?\d[^/]*\.(?:png|jpe?g|tiff?|pdf)$/i;
  const credentialPattern = /(?:^|\/)(?:service[-_]?account|firebase-adminsdk|credentials?|secrets?)(?:[-_.]|$)/i;
  const firebaseKeyPattern = /(?:^|\/)firebase[-_]?.*(?:key|credential|secret).*\.json$/i;

  const failures = result.stdout
    .split('\0')
    .filter(Boolean)
    .filter((path) => {
      const lowerPath = path.toLowerCase();
      const environmentFile = lowerPath === '.env' || (lowerPath.startsWith('.env.') && lowerPath !== '.env.example');
      const firebaseDebugLog = /(?:^|\/)firebase-debug\.log/i.test(path);
      return protectedFiles.has(path)
        || protectedRoots.some((rootPath) => path.startsWith(rootPath))
        || environmentFile
        || firebaseDebugLog
        || /\.(?:mp3|wav|ogg|flac|m4a)$/i.test(path)
        || archivePattern.test(path)
        || scanPattern.test(path)
        || credentialPattern.test(path)
        || firebaseKeyPattern.test(path);
    });

  if (failures.length) {
    console.error('FAIL tracked release-safety artifacts:');
    for (const path of failures) console.error(`  ${path}`);
    process.exitCode = 1;
  } else {
    console.log('Release safety: no protected scratch, scan, archive, environment, Firebase alias, or credential artifacts are tracked.');
  }
}
