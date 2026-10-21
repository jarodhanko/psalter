# Psalter 185 photo QA

## Printed sources

- Owner photo: local source evidence (not distributed), annotated photo 152, printed page 156. It shows “Petitions for Deliverance,” Psalm 69, C.M.; ST. FLAVIAN, attributed to Daye's Psalter, stanzas 1–5 under the two music systems, and stanzas 6–9 as text only below the music, followed by `[Stanzas 10–18]`.
- Clean score: local source evidence (not distributed). It confirms the two-system soprano pattern and the printed alignment for stanzas 1–5.
- No copyright or permission notice is visible for no.185; none was added.

## Underlay result

Added numbered `w:` rows for stanzas 6–9 in both systems. They fit the C.M. text to the melody pattern of 14 soprano note events per system. Because the printed source gives stanzas 6–9 as text-only, their event-level placement is an editorial alignment; the complete text remains in `W:` unchanged.

`node tools/inspect-underlay.mjs psalter185` reports 14 events in each system and verifies these new slots (one-based):

| System | Stanza 6 | Stanza 7 | Stanza 8 | Stanza 9 |
| --- | --- | --- | --- | --- |
| 1 | My, heart, is, bro-, ken, by, re-, proach,, My, soul, is, full, of, grief; | They, gave, me, bit-, ter, gall, for, food,, And, taunt-, ing, words, they, spake; | Their, peace, and, plen-, ty, be, their, snare,, In, blind-, ness, let, them, grope; | Be-, cause, they, proud-, ly, per-, se-, cute, Those, whom, Thou,, Lord,, dost, smite; |
| 2 | I, looked, in, vain, for, com-, for-, ters,, For, pit-, y, and, re-, lief. | They, gave, me, vin-, e-, gar, to, drink,, My, burn-, ing, thirst, to, slake. | Thy, in-, dig-, na-, tion, on, them, pour,, And, des-, o-, late, their, hope. | Let, them, be, blot-, ted, from, Thy, book,, And, ban-, ished, from, Thy, sight. |

All note events are covered with no lyric skips. The visible hyphenation in stanzas 1–5 supports the established sung syllabification conventions; stanza 6–9's common-meter line counts provide a defensible 8.6 + 8.6 fit, but do not prove that each syllable was originally assigned to these exact notes.

No tests or rendering were run for this task. The inspector verified structure and slot counts only; no full note-accuracy, audio, or rendered-score approval is claimed.
