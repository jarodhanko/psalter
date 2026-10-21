# Maria Van Dyke piano arrangement links

## Scope and source audit

Verified on 2026-10-05 against Maria Van Dyke's official Spotify artist catalog
(artist ID `5kB8oBWfvI6TnZevaZRaWP`):
https://open.spotify.com/artist/5kB8oBWfvI6TnZevaZRaWP

The five complete album track lists contained 94 unique Psalter-numbered tracks.
All 94 direct Spotify track pages returned HTTP 200 with the expected artist,
title and album. The artist's Bandcamp discography was a secondary cross-check:
https://mariavandyke.bandcamp.com/

The shipped map contains **93** links. Psalter 188 is deliberately withheld;
see the unresolved source conflict below. Source availability was observed in
market GB and can change or differ elsewhere. This is not a worldwide
availability guarantee or a claim about future releases.

| Official Spotify album | Tracks | Secondary artist source |
| --- | ---: | --- |
| [Joyful Meditations, Vol. 1](https://open.spotify.com/album/4FDgrMWWZOswMdwPUvMjlT) | 16 | [Bandcamp](https://mariavandyke.bandcamp.com/album/joyful-meditations-vol-1) |
| [Joyful Meditations, Vol. 2](https://open.spotify.com/album/5N3cAwcrYpqhoCBqEuPeLc) | 18 | [Bandcamp](https://mariavandyke.bandcamp.com/album/joyful-meditations-vol-2) |
| [Joyful Meditations, Vol. 3](https://open.spotify.com/album/171HAMxBCMYLZK4igOP4fr) | 20 | [Bandcamp](https://mariavandyke.bandcamp.com/album/joyful-meditations-vol-3) |
| [Joyful Meditations, Vol. 4](https://open.spotify.com/album/0NPvw19iIM3Np1Kb6AHxW4) | 20 | [Bandcamp](https://mariavandyke.bandcamp.com/album/joyful-meditations-vol-4) |
| [Joyful Meditations, Vol. 5](https://open.spotify.com/album/1jLeeCEqJDNCYWaKTmDtmZ) | 20 | [Bandcamp](https://mariavandyke.bandcamp.com/album/joyful-meditations-vol-5) |

## Number and setting decisions

- Match `psalter-1912` and the currently selected **Psalter number**, never the
  Psalm number, album track number or a previously loaded score.
- **188 withheld:** Spotify and Bandcamp identify Psalm 69; the app's
  photo-verified Psalter 188 is Psalm 70. A shared number is insufficient to
  resolve this disagreement. No link appears until the match is established.
- **124 included:** the official Spotify album and direct track page agree on
  Psalter 124 / Psalm 45. Bandcamp volume 2 track 8 instead repeats 115 / Psalm 42.
  Follow the two agreeing official Spotify records for this link; preserve the
  documented discrepancy. This does not remove the separately verified 115 link.
- **433 included:** The Lord's Prayer (J. Heys) matches the app's Lord's Prayer
  title and John A. Heys composer, independently of the Psalm-number mapping.
- **Alternate settings:** 2, 64, 91, 247, 260, 354, 384, 389 and 391 each have
  multiple app settings. The link is described as a Maria Van Dyke piano
  arrangement. These recordings were not audio-compared to each score, and are
  not represented as exact-score matches or sung performances.

## Release integrity

`src/data/psalterRecordings.json` is the complete shipped number-to-full-URL map.
The independent release-policy pin is SHA256:

`216446ab0e0b7efd038bde1e7ddabac89ed7315e4b92cb355b0da4a3bc82e2a5`

Hash input: numerically sort keys ascending; join each `number=URL` pair with
one LF between pairs and **no trailing LF**; encode as UTF-8. The validator also
requires exactly 93 canonical positive integer keys, actual catalog membership,
unique full HTTPS Spotify track URLs and 22-character alphanumeric track IDs.
Duplicate raw JSON keys are rejected before parsing can collapse them.
Changing only the map cannot authorize swapped or substituted recordings.

Production permits those URLs only as complete, unescaped JavaScript string
literals or no-substitution template literals in built application assets.
Rolldown emits the map using backticks; the exception requires zero expressions,
one template part and raw source exactly equal to an approved URL. Escapes,
interpolation, tagged templates, comments, regexes, concatenation and member-based
URL manipulation do not authorize a reference. It rejects any residual Spotify
domain or URI and
requires the approved set emitted in application JavaScript to equal the whole
map. Root text, notices, app assets and workers remain covered; root text cannot
supply any exception or fulfill the application emission requirement. Service workers never receive an exception to the
existing prohibition on external URLs. All unrelated withheld-hymn gates remain.
Preview preserves its previously authorized hymn-playlist behavior while
validating this recording map and complete emitted set.

The UI uses an ordinary footer anchor with a new-tab accessibility cue and
`noopener noreferrer`. It adds no player, embedding, automatic external request,
audio download or storage operation. The existing footer wraps and is hidden
when printing. No media from these recordings is copied or cached.

## Reproducibility

The source audit retained complete per-number artist/title/album metadata and
94 direct-page verification records. These SHA256 values identify those input
records; the published app includes only the compact link map and this note.

- `maria-van-dyke-psalter-by-number.json`: `45b9854720f1b31fc9fd6ad661f0198a462b36cbd527d2e20b1d6db2db7dc97d`
- `maria-van-dyke-psalter-mapping.json`: `db363d0e6021eba3501405e6a118612d7f45bfd7add332d5a6fb3abe9eae905d`
- `track-link-audit.json`: `408e49476eccbcfc1c448ffa199a2a6131e9054bdaa33a527d7e505289687fb3`
