# Printed-source corrections for Psalter 162 and 163

This bounded change adds thirteen independently confirmed corrections to the
previously reviewed source the historical reviewed source.
It does not change other arrangements, source-specific timing, hymn settings,
lyrics, build policy, or the existing lazy-loading optimization.

## Confirmed music

- **162, FOUNTAIN:** RFPA PDF page 242 and original 1912 printed page 137
  independently show alto C4 quarters at quarter onsets 0, 8, 12, 16, 44 and 48.
  Their separate unflagged downstems distinguish them from the soprano eighths.
  Six canonical eighth-note pairs become quarters, removing six unprinted alto
  attacks without changing any other voice or total duration. The existing exact
  legacy selection digest is rebound; its stanza arrays remain unchanged.
- **163, THE GREEN HILL:** RFPA PDF page 243, with the rights footer on page 244,
  agrees with the original 1912 printed page 138 at seven pitch corrections.
  Original E major is one semitone above RFPA E-flat major. Alto changes at q16.5
  D4→B-flat3, q25.5 G4→A-flat4, q26 F4→G4 and q27 E-flat4→F4; tenor at q20 and
  q21 D4→C4; bass at q30 C3→E-flat3. No duration, tie, slur, text, rights notice,
  bar position or source companion is changed.

## Independent source and retained qualifications

The fixtures contain all 490 written SATB events and twenty per-voice stanza
rows, reconciled directly to the independently frozen/revised printed ledgers.
The evidence fixture records the exact source-ledger, fixture, baseline ABC and
corrected ABC digests, page identities, and every independently reversible
token edit. The original audit evidence remains outside the repository with
checksummed paths, including source images, coordinates, initial ledgers,
independent corroboration, later revisions and failed baseline comparisons.

The initial 162 shared tenor/bass half-note reading was rejected: the original
print confirms the unchanged quarter. Five initial 163 pitch readings were
rejected after independent review. Soprano “long,” alto “see Thy,” and bass
“des-ert” retain their original canonical pitches. The bass flat carries through
both C-flat3 notes; its original E-major counterpart is C-natural3.

No literal typography certification is claimed. In 162, printed stanza 1 q23
“tow’r:” remains canonical “tow'r;”; source-system separator styles and apostrophe
typography differ. In 163, stanza 1 q21.5 “grace.” remains “grace,” and stanza 2
q33.5 “light,” remains “light;”. Both reconstructed prose texts join the printed
compound “loving-kindness” as “lovingkindness”. The fixtures retain the literal
printed words; tests identify only the specific known presentation differences.

## Validation scope

The source-owned regression suite covers literal source deltas, all written
events, every individual inverse correction, key/rhythm negative controls,
corrupted callback data, all part subsets and stanza groups, learner signs,
all sixteen audio masks across all twenty-three UI transpositions, exact
pitch/onset/end/volume and frozen tracking, legacy selection bindings, generated
loading and real React screen/application-print preparations.

Separate audit harnesses exercise complete prepared screen/print grids, all
stanza subsets, transposition, underlay, transcript and source-guard inventories.
They retain strict baseline failures and typography qualifications. Their local
results are recorded in the external validation report; a prepared test is not
an executed pass. Aggregate verification must run on the frozen combined batch.

Synthetic jsdom bounds and pure preparation/audio data checks do not establish
native layout, physical printing, device playback, offline acceptance or audible
quality. Native acceptance and publication remain separately held.
