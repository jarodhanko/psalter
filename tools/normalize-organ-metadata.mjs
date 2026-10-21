import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const crc16 = bytes => {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xa001 : 0);
  }
  return crc;
};

// Compatibility reconstruction, NOT a claim that FFmpeg 4.4 was executed.
// Accept only the exact reviewed FFmpeg 7.1.5 organ result. No audio frames are
// changed. This preserves the historical bank's byte hashes. See audio/setup.md.
export function normalizeOrganMetadata(raw) {
  assert.equal(raw.length, 12212, 'Unexpected raw organ size');
  assert.equal(sha256(raw), '117801cccd64b4652091c636ace2758ef0dac4050bdb0143be2cf0a2a7759f67', 'Unexpected raw organ SHA-256; refusing metadata reconstruction');
  assert.equal(raw.subarray(0, 3).toString('ascii'), 'ID3');
  assert.equal(raw[9], 34);
  assert.equal(raw.subarray(10, 14).toString('ascii'), 'TSSE');
  assert.equal(raw[17], 14);
  assert.equal(raw.subarray(21, 33).toString('ascii'), 'Lavf61.7.103');
  const id3 = Buffer.concat([raw.subarray(0, 21), Buffer.from('Lavf58.76.100', 'ascii'), raw.subarray(33, 44)]);
  id3[9] = 35;
  id3[17] = 15;
  const mpeg = Buffer.from(raw.subarray(44));
  assert.equal(mpeg.subarray(36, 40).toString('ascii'), 'Info');
  assert.equal(mpeg.subarray(156, 165).toString('ascii'), 'Lavc61.19');
  assert.equal(mpeg.readUInt16BE(190), crc16(mpeg.subarray(0, 190)));
  mpeg.write('Lavc58.13', 156, 'ascii');
  mpeg.writeUInt16BE(crc16(mpeg.subarray(0, 190)), 190);
  const normalized = Buffer.concat([id3, mpeg]);
  assert.equal(normalized.length, 12213);
  assert.equal(sha256(normalized), '53202c3c307996969eb4440cdc463b0e986cf66df46df901a7656de2394d45f9', 'Unexpected normalized organ SHA-256');
  return normalized;
}
