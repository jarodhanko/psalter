/** Legacy W fields copied with syllable hyphens rather than plain prose.
 * These exact, reviewed source rows retain their historical underlay formatting.
 * An unknown song, changed/missing/duplicate witness, or extended stanza must
 * remain literal prose. Never infer this convention from the presence of hyphens.
 */
const sourceWitnesses: Readonly<Record<string, Readonly<Record<number, string>>>> = {
  "psalter166": {
    "1": "W:1. Praise waits in Zi-on, Lord, for Thee, And un-to Thee shall vows be paid; O Thou that hear-est those who cry, To Thee by all shall prayer be made.",
    "2": "W:2. A-gainst us sin has bat-tled hard; For help we look to Thee and pray; Thou our trans-gres-sions wilt for-give, Yea, Thou wilt take them all a-way.",
    "3": "W:3. How blest are they whom Thou dost choose To come and in Thy courts a-bide; Com-mun-ing in Thy ho-ly house, With good we shall be sat-is-fied.",
    "4": "W:4. By might-y deeds in right-eous-ness Prayer's an-swer sure-ly comes from Thee, O God our Sav-iour, God the trust Of all Thy saints on land or sea."
  },
  "psalter171": {
    "1": "W:1. Thy might sets fast the moun-tains; Strength girds Thee ev-er-more To calm the rag-ing peo-ples And still the o-cean's roar. Thy maj-es-ty and great-ness Are thro' all lands con-fessed, And joy on earth Thou send-est A-far, from east to west.",
    "2": "W:2. To bless the earth Thou send-est From Thy a-bun-dant store The wa-ters of the spring-time, En-rich-ing it once more. The seed by Thee pro-vid-ed Is sown o'er hill and plain, And Thou with gen-tle show-ers Dost bless the spring-ing grain.",
    "3": "W:3. The year with good Thou crown-est, The earth Thy mer-cy fills, The wil-der-ness is fruit-ful, And joy-ful are the hills; With corn the vales are cov-ered, The flocks in pas-tures graze; All na-ture joins in sing-ing A joy-ful song of praise."
  },
  "psalter355": {
    "1": "W:1. All who with heart con-fid-ing De-pend on God a-lone, Like Zi-on's mount a-bid-ing, Shall ne'er be o-ver-thrown. Like Zi-on's cit-y bound-ed By guard-ing moun-tains broad, His peo-ple are sur-round-ed For-ev-er by their God.",
    "2": "W:2. No scep-ter of op-pres-sion Shall hold un-bro-ken sway, Lest un-to base trans-gres-sion The right-eous turn a-way. Thy fa-vor be im-part-ed To god-ly men, O Lord; Bless all that are pure-heart-ed, The good with good re-ward.",
    "3": "W:3. The men who false-hood cher-ish, For-sak-ing truth and right, With wick-ed men shall per-ish, God will their sin re-quite. From sin Thy saints de-fend-ing, Their joy, O Lord, in-crease With mer-cy nev-er end-ing And ev-er-last-ing peace."
  }
};

/** Return only proven legacy W stanza text for the specified arrangement. */
export const legacySyllabifiedProseWitnesses = (songId: string | undefined, abc: string): readonly string[] => {
  const witnesses = songId ? sourceWitnesses[songId] : undefined;
  if (!witnesses) return [];
  const numberedFields = abc.split(/\r?\n/).flatMap((line) => {
    const number = /^\s*W:\s*(\d+)(?:\.(?=\s|~|$)|(?=\s|$))/.exec(line)?.[1];
    return number && Object.hasOwn(witnesses, Number(number)) ? [{ number: Number(number), line }] : [];
  });
  const entries = Object.entries(witnesses);
  if (numberedFields.length !== entries.length || entries.some(([number, expected]) => {
    const fields = numberedFields.filter((field) => field.number === Number(number));
    return fields.length !== 1 || fields[0].line !== expected;
  })) return [];
  // The parser must also match the complete final stanza, so a newly appended
  // continuation cannot accidentally acquire this legacy formatting convention.
  return entries.map(([, line]) => line.slice(2));
};
