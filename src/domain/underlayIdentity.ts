export interface UnderlayRowIdentity {
  voiceId: string;
  musicSegment: number;
  /** Zero denotes a shared chorus, never an additional selectable stanza. */
  stanzaNumber: number;
  sourceText: string;
  repeatPass?: number;
  role?: 'stanza' | 'chorus';
  /** A distinct source chorus lane, preserved during selected-part transfer. */
  chorusRow?: number;
}

/** Obtained only after qualifying an exact pristine source. The association
 * survives filtering/notation transforms only while the lyric bytes match. */
export interface UnderlayIdentityWitness {
  rows: readonly UnderlayRowIdentity[];
  /** Source-reviewed shared rows whose spacer slots must remain a complete,
   * ordered vector. They may not be identified by individual text matches. */
  completeChorusSegments?: readonly { voiceId: string; musicSegment: number }[];
  /** Source-reviewed identical stanza endings, qualified only by the complete
   * ordered selection from an earlier validated numbered block of this voice. */
  inheritedStanzaSegments?: readonly { voiceId: string; musicSegment: number }[];
}

export interface UnderlaySourceRow extends UnderlayRowIdentity {
  sourceLineIndex: number;
  sourceStartChar: number;
  continuation: boolean;
}

export interface UnderlayModel {
  /** Rows retain voice, music segment, stanza/chorus role, and repeat pass. */
  rows: UnderlaySourceRow[];
  stanzaNumbers: number[];
  ambiguous: boolean;
}

/** Extract source lyrics without flattening away their voice/music association.
 * Continuation rows inherit an ordinal identity only from a prior numbered
 * block of the same voice and length. Every explicit number must agree. */
export function extractUnderlayModel(abc: string, witness?: UnderlayIdentityWitness): UnderlayModel {
  const lines = abc.split(/\r?\n/);
  const lineStartChars: number[] = [];
  let charOffset = 0;
  lines.forEach((line, index) => {
    lineStartChars.push(charOffset);
    charOffset += line.length;
    if (index < lines.length - 1) charOffset += abc.startsWith('\r\n', charOffset) ? 2 : 1;
  });
  const rows: UnderlaySourceRow[] = [];
  const firstStanzaLine = new Map<number, number>();
  const precedingNumberedRows = new Map<string, number[]>();
  const reviewedRowIndexes = new Map<string, number>();
  const nextMusicSegment = new Map<string, number>();
  const lastMusicSegment = new Map<string, number>();
  let currentVoice = 'default';
  let inBody = true;
  let block: { voiceId: string; musicSegment: number | undefined; sourceLineIndex: number; sourceStartChar: number; sourceText: string }[] = [];
  let ambiguous = false;
  const finishBlock = () => {
    if (!block.length) return;
    const parsed = block.map((row) => ({ ...row, number: /^(\d+)\.(?:\s|~|$)/.exec(row.sourceText)?.[1] }));
    const named = parsed.every((row) => row.number !== undefined);
    if (!parsed.every((row) => row.musicSegment !== undefined)) ambiguous = true;
    if (witness) {
      const expected = witness.rows.filter(row => row.voiceId === parsed[0].voiceId && row.musicSegment === parsed[0].musicSegment);
      const reviewedSegmentKey = `${parsed[0].voiceId}\0${parsed[0].musicSegment}`;
      // Directives can divide one music segment into several lyric blocks.
      // Keep order/uniqueness across those boundaries, not just within a block.
      let previousIndex = reviewedRowIndexes.get(reviewedSegmentKey) ?? -1;
      const firstBlock = previousIndex === -1;
      const completeChorus = witness.completeChorusSegments?.some(segment =>
        segment.voiceId === parsed[0].voiceId && segment.musicSegment === parsed[0].musicSegment);
      if (completeChorus && (previousIndex !== -1 || expected.length !== parsed.length ||
          expected.some((identity, index) => identity.role !== 'chorus' || identity.stanzaNumber !== 0 || identity.sourceText !== parsed[index].sourceText))) {
        ambiguous = true;
        block = [];
        return;
      }
      const inheritedStanza = witness.inheritedStanzaSegments?.some(segment =>
        segment.voiceId === parsed[0].voiceId && segment.musicSegment === parsed[0].musicSegment);
      const prior = precedingNumberedRows.get(parsed[0].voiceId);
      const inherited = inheritedStanza ? expected.filter(identity => prior?.includes(identity.stanzaNumber)) : undefined;
      if (inherited && (previousIndex !== -1 || !prior || prior.length !== parsed.length || inherited.length !== parsed.length ||
          inherited.some((identity, index) => identity.role !== 'stanza' || identity.stanzaNumber !== prior[index] || identity.sourceText !== parsed[index].sourceText))) {
        ambiguous = true;
        block = [];
        return;
      }
      const acceptedNumbers: number[] = [];
      for (const [rowIndex, row] of parsed.entries()) {
        const matches = expected.flatMap((identity, index) => identity.sourceText === row.sourceText ? [{ identity, index }] : []);
        const match = completeChorus ? { identity: expected[rowIndex], index: rowIndex }
          : inherited ? { identity: inherited[rowIndex], index: expected.indexOf(inherited[rowIndex]) }
          : matches.length === 1 ? matches[0] : undefined;
        if (!match || match.index <= previousIndex || (row.number !== undefined && Number(row.number) !== match.identity.stanzaNumber)) {
          ambiguous = true;
          continue;
        }
        previousIndex = match.index;
        reviewedRowIndexes.set(reviewedSegmentKey, previousIndex);
        const identity = match.identity;
        if (identity.role !== 'chorus') acceptedNumbers.push(identity.stanzaNumber);
        if (identity.role !== 'chorus') firstStanzaLine.set(identity.stanzaNumber,
          Math.min(firstStanzaLine.get(identity.stanzaNumber) ?? row.sourceLineIndex, row.sourceLineIndex));
        rows.push({ ...row, ...identity, continuation: identity.musicSegment > 0 || (identity.repeatPass ?? 1) > 1 });
      }
      if (named) {
        // A split or partially invalid numbered block cannot qualify a later
        // inherited vector, even if its last fragment has matching row count.
        precedingNumberedRows.delete(parsed[0].voiceId);
        if (firstBlock && acceptedNumbers.length === parsed.length) precedingNumberedRows.set(parsed[0].voiceId, acceptedNumbers);
      }
    } else if (named) {
      const numbers = parsed.map((row) => Number(row.number));
      precedingNumberedRows.set(parsed[0].voiceId, numbers);
      parsed.forEach((row, index) => {
        const stanzaNumber = numbers[index];
        firstStanzaLine.set(stanzaNumber, Math.min(firstStanzaLine.get(stanzaNumber) ?? row.sourceLineIndex, row.sourceLineIndex));
        rows.push({ ...row, musicSegment: row.musicSegment ?? -1, stanzaNumber, continuation: false });
      });
    } else {
      const prior = precedingNumberedRows.get(parsed[0].voiceId);
      if (prior && prior.length === parsed.length &&
          parsed.every((row, index) => row.number === undefined || Number(row.number) === prior[index])) {
        parsed.forEach((row, index) => {
          const stanzaNumber = prior[index];
          firstStanzaLine.set(stanzaNumber, Math.min(firstStanzaLine.get(stanzaNumber) ?? row.sourceLineIndex, row.sourceLineIndex));
          rows.push({ ...row, musicSegment: row.musicSegment ?? -1, stanzaNumber, continuation: true });
        });
      } else ambiguous = true;
    }
    block = [];
  };
  const isMusicLine = (line: string) => {
    const content = line.trim();
    return content.length > 0 && !content.startsWith('%') && !/^[A-Z]:/.test(content);
  };
  const recordMusic = (voiceId: string) => {
    const segment = nextMusicSegment.get(voiceId) ?? 0;
    nextMusicSegment.set(voiceId, segment + 1);
    lastMusicSegment.set(voiceId, segment);
  };

  lines.forEach((line, sourceLineIndex) => {
    // A source annotation does not start another music or lyric segment.
    // Keep ABC directives as boundaries rather than treating them as prose.
    if (/^\s*%(?!%)/.test(line)) return;
    const voice = /^V:[ \t]*([^\s]+)(.*)$/.exec(line);
    if (voice) {
      finishBlock();
      currentVoice = voice[1];
      inBody = !voice[2].trim();
      return;
    }
    const inlineVoice = /^\s*\[V:[ \t]*([^\]\s]+)([^\]]*)\](.*)$/.exec(line);
    if (inlineVoice) {
      finishBlock();
      currentVoice = inlineVoice[1];
      inBody = true;
      if (isMusicLine(inlineVoice[3])) recordMusic(currentVoice);
      return;
    }
    const lyric = /^\s*w:\s*(.*?)\s*$/.exec(line);
    if (lyric) {
      const sourceText = lyric[1];
      if (!sourceText) {
        finishBlock();
        precedingNumberedRows.delete(currentVoice);
      } else {
        block.push({ voiceId: currentVoice, musicSegment: lastMusicSegment.get(currentVoice), sourceLineIndex, sourceStartChar: lineStartChars[sourceLineIndex], sourceText });
      }
      return;
    }
    finishBlock();
    if (inBody && currentVoice && isMusicLine(line)) recordMusic(currentVoice);
  });
  finishBlock();
  // Empty lyric selections are intentional. Any nonempty selection must keep
  // every reviewed vector, including shared spacers and inherited endings.
  const requiredSegments = [...(witness?.completeChorusSegments ?? []), ...(witness?.inheritedStanzaSegments ?? [])];
  if (rows.length && requiredSegments.some(segment =>
    !rows.some(row => row.voiceId === segment.voiceId && row.musicSegment === segment.musicSegment))) ambiguous = true;
  const stanzaNumbers = [...firstStanzaLine.entries()].sort((left, right) => left[1] - right[1]).map(([number]) => number);
  return { rows, stanzaNumbers, ambiguous };
}

/** Join a single carrier's complete, equally indexed music segments into prose.
 * Refuse partial vectors, repeated stanza identities, and independent/echo
 * carriers. No text comparison is used to infer identity or discard words. */
export function reconstructUnderlayTranscript(abc: string): readonly string[] | undefined {
  const model = extractUnderlayModel(abc);
  if (model.ambiguous || !model.rows.length || new Set(model.rows.map((row) => row.voiceId)).size !== 1) return undefined;
  const sourceRowCount = abc.split(/\r?\n/).filter((line) => /^\s*w:\s*\S/.test(line)).length;
  if (model.rows.length !== sourceRowCount) return undefined;
  const segments = new Map<number, UnderlaySourceRow[]>();
  for (const row of model.rows) {
    const rows = segments.get(row.musicSegment) ?? [];
    rows.push(row);
    segments.set(row.musicSegment, rows);
  }
  const orderedSegments = [...segments.entries()].sort((a, b) => a[0] - b[0]);
  if (orderedSegments.length < 2) return undefined;
  const numbers = orderedSegments[0][1].map((row) => row.stanzaNumber);
  const fragmentText = (row: UnderlaySourceRow) => row.sourceText.replace(/^\d+\.(?=\s|~|$)[\s~]*/, '').trim();
  if (model.rows.some((row) => !fragmentText(row))) return undefined;
  if (new Set(numbers).size !== numbers.length || orderedSegments.some(([, rows]) =>
    rows.length !== numbers.length || rows.some((row, index) => row.stanzaNumber !== numbers[index]))) return undefined;
  return numbers.map((number, index) => {
    const parts = orderedSegments.map(([, rows]) => fragmentText(rows[index]));
    return `${number}. ${parts.join(' ')}`;
  });
}
