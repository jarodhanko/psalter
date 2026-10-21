# MusicXML interchange plan

Status: researched and prototyped; converter adoption is rejected for now because the sampled round trips fail required fidelity gates.

ABC remains the reviewed canonical format. MusicXML is an import/export interchange format, not a second independently edited corpus. ABCJS remains the browser renderer/player: it can generate MIDI, but it does not provide MusicXML import/export, and MIDI would discard notation and lyric information required for an exact conversion.

## Recommended toolchain

Prototype a pinned version of [croma](https://github.com/ro-ag/croma) in a separate local prototype. It is an Apache-2.0 Rust CLI/library with ABC 2.1 parsing and bidirectional ABC/MusicXML commands:

```sh
cargo install croma-cli --version <pinned-version>
croma check --diagnostics=json tune.abc
croma xml tune.abc > tune.musicxml
croma musicxml2abc tune.musicxml > roundtrip.abc
```

Keep Willem Vree's [abc2xml](https://wim.vree.org/svgParse/abc2xml.html) and [xml2abc](https://wim.vree.org/svgParse/xml2abc.html) as pinned compatibility/reference converters. The abc2xml implementation is LGPL; its exact source revision and license notice must be retained if redistributed.

Do not use an unreviewed hosted converter and do not use an ABC → MIDI → MusicXML route.

## Prototype result (2026-09-21)

A historical local prototype tested the checksum-pinned Croma 1.3.0 release binary against three representative SATB settings. It did not add a production dependency or change the canonical corpus.

Croma requires an `X:` reference field, which the corpus intentionally omits, so the harness added a transient `X:1` wrapper. With that wrapper, validation and export completed, but all three round trips renamed the source voices (`T1,T2,B1,B2` became structural `P1` names). Two of three cases also changed lyric-line counts, while the remaining case changed lyric formatting and still lacked semantic attachment proof. Event-level fidelity remains unproven, and `%%stretchlast` is reported as unsupported.

Therefore Croma is technically runnable but does not pass this project's stable-voice or lyric gates. Do not add MusicXML export to the product until a converter or normalization layer passes the complete acceptance gate below.

## Acceptance gate

Before adopting either converter, add hand-reviewed fixtures covering a pickup, four independent SATB voices, exceptional voices, repeats, ties across barlines, dotted rhythms, accidentals, tuplets, and multi-stanza lyric underlay.

For ABC → MusicXML → ABC, compare a normalized event model:

1. tune identity and musical metadata;
2. number and order of parts/voices, with stable SATB mappings;
3. each voice's measure, onset, duration, pitch, written accidental, rest/chord state, ties/slurs, tuplets, repeats, and barlines;
4. lyric attachment by voice and event, including syllable, hyphen, and melisma state;
5. key, meter, pickup/anacrusis, and tempo.

Reject changes in musical events, voice assignment, lyrics, or bar boundaries. Ignore layout-only changes: page/system breaks, spacing, fonts, and similar engraving details are intentionally responsive in this app.

## Expected lossiness

ABC and MusicXML do not share an identical notation model. The reference converters document incomplete support for some positioning, cross-staff slurs, advanced MusicXML directions, and tool-specific ABC `%%` directives. A converter must report unsupported constructs rather than silently dropping them. Any construct that fails the fixture gate needs a documented exception or a different pinned conversion path.

Primary references:

- [croma source and Apache-2.0 license](https://github.com/ro-ag/croma)
- [abc2xml documentation](https://wim.vree.org/svgParse/abc2xml.html)
- [xml2abc documentation](https://wim.vree.org/svgParse/xml2abc.html)
- [ABCJS scope](https://docs.abcjs.net/overview/purpose)
- [ABCJS synthesized sound and MIDI API](https://docs.abcjs.net/audio/synthesized-sound)
