import { hasOLoveOpeningSource } from './oLoveOpeningSource';
import { newOLoveSession, disposeOLoveSession, releaseOLoveFrame, captureOLoveFrame, reflowOLove, clearOLoveReflow } from './oLoveInteriorReflow';
import { newRollInteriorSession, disposeRollInteriorSession, releaseRollInteriorFrame, captureRollInteriorFrame, reflowRollInterior, clearRollInteriorReflow } from './rollInteriorReflow';
import type { RollInteriorSession } from './rollInteriorReflow';
import type { RollGroupingBaseline } from './rollGroupingWrap';
import { PSALTER44_GROUPED_ID, PSALTER47_GROUPED_ID, ALL_CREATURES_OPENING_ID, HIDETH_OPENING_ID, GOD_LEADS_OPENING_ID, MIGHTY_FORTRESS_OPENING_ID, CHURCH_OPENING_ID, HE_LEADETH_OPENING_ID, OH_HOW_OPENING_ID, PSALTER39_OPENING_ID, PSALTER46_LYRIC_ID, PSALTER_BEAT_ID, SAVIORS_LOVE_OPENING_ID, THOUSAND_OPENING_ID, newOpeningBeatSession, captureOpeningBeatFrame, reflowOpeningBeats, clearOpeningBeatReflow } from './openingBeatReflow';
import { hasMightyFortressOpeningSource } from './mightyFortressOpeningSource';
import type { BeatFrame } from './openingBeatReflow';
import { reflowAllCreaturesOpeningScreenScore } from './hymnOpeningWrap';
import { clearItIsWellOpeningWrap, reportItIsWellOpeningSettings, reflowItIsWellOpeningScreenScore } from './hymnOpeningWrap';
import { clearOLoveOpeningWrap, reportOLoveOpeningSettings, reflowOLoveOpeningScreenScore } from './hymnOpeningWrap';
import { hasRollGroupingSource, renderRollGroupingScreenScore } from './rollGroupingWrap';
import { projectHymnLyrics } from '../../domain/hymnLyricPolicy';
import type { HymnOpeningSettings } from './hymnOpeningWrap';
import { clearOhHowOpeningWrap, reportOhHowOpeningSettings, reflowOhHowOpeningScreenScore, clearSandsOpeningWrap, reportSandsOpeningSettings, reflowSandsOpeningScreenScore, clearGodLeadsOpeningWrap, reportGodLeadsOpeningSettings, reflowGodLeadsOpeningScreenScore, clearSweetHourOpeningWrap, reportSweetHourOpeningSettings, reflowSweetHourOpeningScreenScore, clearOnlyTrustOpeningWrap, reportOnlyTrustOpeningSettings, reflowOnlyTrustOpeningScreenScore, clearHeLeadethOpeningWrap, reportHeLeadethOpeningSettings, reflowHeLeadethOpeningScreenScore, clearMightyFortressOpeningWrap, reportMightyFortressOpeningSettings, reflowMightyFortressOpeningScreenScore, clearMelitaOpeningWrap, reportMelitaOpeningSettings, reflowMelitaOpeningScreenScore, clearCoronationOpeningWrap, reportCoronationOpeningSettings, reflowCoronationOpeningScreenScore, clearSaviorsLoveOpeningWrap, reportSaviorsLoveOpeningSettings, reflowSaviorsLoveOpeningScreenScore, clearFaithOpeningWrap, reportFaithOpeningSettings, reflowFaithOpeningScreenScore, clearHymnOpeningWrap, reportHymnOpeningSettings, reflowHymnOpeningScreenScore, clearHidethOpeningWrap, reportHidethOpeningSettings, reflowHidethOpeningScreenScore } from './hymnOpeningWrap';
import { extractUnderlayModel } from '../../domain/underlayIdentity';
import type { UnderlayIdentityWitness } from '../../domain/underlayIdentity';
import { getReviewedUnderlay, presentReviewedChorus, qualifyAllCreaturesUnderlayParts } from '../../domain/reviewedUnderlay';
import { getEditorialStanzaUnderlay } from '../../domain/editorialStanzaUnderlay';
import { getPublishedStanzaVariant } from '../../domain/publishedStanzaVariant';
import { refineWondrousGroupingScreenScore } from './wondrousGroupingWrap';
import { refineAllCreaturesGroupingScreenScore } from './allCreaturesGroupingWrap';
import { clearChurchSizeWrap, refineChurchSizeScreenScore } from './churchSizeWrap';
import { clearTwoHymnSizeWrap, refineTwoHymnSizeScreenScore } from './twoHymnSizeWrap';
import { refineHeKeepsSizeScreenScore } from './heKeepsSizeWrap';
import { hasHeKeepsSizeSource } from './heKeepsSizeSource';
import { reflowHeKeepsDefault, clearHeKeepsDefaultWrap } from './heKeepsDefaultWrap';
import { getReportedDuplicateCarriers, presentReportedDuplicateCarriers } from '../../domain/reportedDuplicateCarriers';
import type { ReportedDuplicateCarriers } from '../../domain/reportedDuplicateCarriers';
import type { ReviewedUnderlay } from '../../domain/reviewedUnderlay';
export { extractUnderlayModel } from '../../domain/underlayIdentity';
export type { UnderlayModel, UnderlaySourceRow } from '../../domain/underlayIdentity';
import { useEffect, useMemo, useRef, useState } from 'react';
import abcjs from 'abcjs';
import { renderScreenScore } from './isolatedChordWrap';
import { clearPsalter46OpeningWrap, reflowPsalter46OpeningScreenScore } from './psalter46OpeningWrap';
import { clearPsalterGroupedOpeningWrap, hasPsalterGroupedOpeningSource, reflowPsalterGroupedOpeningScreenScore } from './psalter47OpeningWrap';
import { hasOhHowPickupSource } from './hymnPickupSource';
import { hasCompleteInTheeWidthSource, hasOLoveWidthSource, hasWhateerWidthSource, hasSoftlyWidthSource, hasOldRuggedCrossWidthSource, renderCompleteInTheeScreenScore } from './completeInTheeWrap';
import type { CompleteInTheeScreenFit } from './completeInTheeWrap';
import { clearSoftlyMusicOnlyWrap, reflowSoftlyMusicOnlyScreenScore } from './softlyMusicOnlyWrap';
import { hasDayByDayWrapSource, reflowDayByDayScreenScore, reflowDayByDayEndingScreenScore } from './dayByDayWrap';
import { clearNearPickupWrap, reportNearPickupSettings, reflowNearScreenScore } from './nearPickupWrap';
import { clearSaviorWidthProbe, observeSaviorWidthProbe, reflowSaviorScreenScore } from './saviorWidthProbe';
import { withInheritedHymnClefs } from './inheritedHymnClefs';
import { withHymnVocalPlacement } from './hymnVocalPlacement';
import { hasHymnAboveResponseSource, hasHymnBelowResponseSource, prepareHymnResponseRows, restoreHymnResponseRows } from './hymnAboveResponseRows';
import { hasDoesJesusLyricExtenderSource, withDoesJesusLyricExtenders } from './doesJesusLyricExtenders';
import { containScreenSvgSystems } from './screenSvgBounds';
import { getReviewedPrintEndingSource, keepReviewedPrintEndingWithPrevious } from './printEnding';
import { preserveBlankLyricRows } from './lyricRows';
import { hasPsalter81DottedRestSource, presentPsalter81DottedRests } from './dottedRest81';
import { sourceHeadWitness, withSourceHeads, prepareSourceHeads, presentSourceHeads } from './sourceHeadPresentation';
import type { SourceHeadWitness } from './sourceHeadPresentation';
import { sourceLayerWitness, withSourceLayerHeads, withSelectedSourceLayers, prepareSourceLayers, presentSourceLayers } from './sourceTimedLayers';
import type { SourceLayerWitness } from './sourceTimedLayers';
import { addLearnerAccidentals } from './learnerAccidentals';
import { isSourceTimingReady, type SourceTimingContext } from '../../data/timingWitnesses';
import { sourceBoundTimingId, presentSourceBoundTimingCarrier } from './sourceBoundTimingCarriers';
import { hasSharedFermataSource, presentSharedFermatas } from './sharedFermatas';
import { hasPsalter366FermataSource, presentPsalter366Fermata } from './mixedFermata366';
import { hasPsalter411FermataSource, presentPsalter411Fermatas } from './sharedFermata411';
import { getReviewedFermataSource, presentReviewedFermatas } from './reviewedFermatas';
import type { ReviewedFermataSource } from './reviewedFermatas';
import { hasRepeatUnderlaySource, withRepeatUnderlay } from './repeatUnderlay';
import type { RepeatUnderlay } from './repeatUnderlay';
import { hasCarrierWitness, presentCombinedCarrier, psalter26UnderlayCarrier } from './underlayCarrier';
import type { CarrierWitness } from './underlayCarrier';
import { hasPsalter31CarrierSource, presentPsalter31Carrier, psalter31UnderlayCarrier } from './underlayCarrier31';
import type { Psalter31CarrierWitness } from './underlayCarrier31';
import { hasPsalter99CarrierSource, presentPsalter99Carrier, withPsalter99StanzaIdentities } from './underlayCarrier99';
import { hasPsalter142CarrierSource, psalter142RecipientPriority } from './underlayCarrier142';
import { bindPsalter226CarrierSource, presentPsalter226Carrier } from './underlayCarrier226';
import type { Psalter226CarrierSource } from './underlayCarrier226';
import { hasPsalter133SharedRestSource, presentPsalter133SharedRests } from './sharedRest133';
import { sharedQuarterRestSource, presentSharedQuarterRests } from './sharedQuarterRests';
import type { SharedQuarterRestSource } from './sharedQuarterRests';
import { preparePsalter143Display, presentPsalter143KeySignatures } from './keySignatures143';
import type { Psalter143Display } from './keySignatures143';
import { preparePsalter226Display, presentPsalter226KeySignatures } from './keySignatures226';
import type { Psalter226Display } from './keySignatures226';

import type { RegisterVisibleScore } from './playbackTracking';
import type { PreparedScreenAbc } from '../export/abcExport';

// Keep distinct lyric words separated even when the available width compresses
// a system. Apply the same event spacing to screen and print engraving.
const SCORE_MIN_PADDING = 6;
// Copy primitive defaults into each fresh options object; never share mutable options.
// Responsive SVG width owns the requested size, so ABCJS wrapping stays at scale 1.
const SCORE_SVG_OPTIONS = { oneSvgPerLine: true, minPadding: SCORE_MIN_PADDING, responsive: 'resize' as const, scale: 1 };

// The same probe-owned diagnostics are reset before rendering and on failure.
function clearSizeOpeningWraps(probeHost: HTMLElement | null) {
  clearChurchSizeWrap(probeHost);
  clearTwoHymnSizeWrap(probeHost);
  clearPsalter46OpeningWrap(probeHost);
  probeHost?.removeAttribute('data-psalter433-opening-wrap');
}

type HymnSlurClearance = readonly [margin: 'stafftopmargin' | 'vocalspace', points: number] | undefined;

// Bind the complete original edition before part/verse/transposition changes.
// Length + FNV-1a64 follows the existing compact source-witness convention.
function getHymnSlurClearance(songId: string | undefined, abc: string): HymnSlurClearance {
  const source = songId === 'hymn-remaining-openpsalm-on-jordans-stormy-banks-i-stand'
    ? [5041, 0x01dc20a398b56302n, 'vocalspace', 11] as const
    : songId === 'hymn-mobile-we-have-an-anchor'
      ? [4030, 0xccc1f21bbaca682en, 'vocalspace', 12] as const
      : songId === 'hymn-winkworth-whateer-gastorius'
        ? [3188, 0xb1ba2708a831f5f7n, 'stafftopmargin', 14] as const : undefined;
  if (!source || abc.length !== source[0]) return;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index += 1) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  }
  if (hash === source[1]) return [source[2], source[3]];
}

function reserveHymnSlurClearance(tune: abcjs.TuneObject, active: HymnSlurClearance) {
  if (!active || abcjs.signature !== 'abcjs-basic v6.7.0' || tune.warnings?.length) return;
  const [margin, points] = active;
  if (tune.formatting[margin] !== undefined) return;
  const hasLyrics = (staff: NonNullable<abcjs.TuneObject['lines'][number]['staff']>[number]) => staff.voices?.some(voice =>
    voice.some(event => event.el_type === 'note' && (event as abcjs.VoiceItemNote & { lyric?: unknown[] }).lyric?.length));
  // Jordan and Anchor need same-staff clearance beneath their down-slurs.
  // The supported vocal margin reserves height and moves below-staff lyrics:
  // 11 points = 44/3 SVG units for Jordan; 12 points = 16 units for Anchor.
  // Music, source offsets, and slurs stay intact; unpaired/music-only views opt out.
  if (tune.lines.some(line => margin === 'vocalspace'
    ? line.staff?.some(staff => staff.voices?.length === 2 && hasLyrics(staff))
    : line.staff?.length === 2 && hasLyrics(line.staff[0]))) {
    tune.formatting[margin] = points;
  }
}

export type ScreenScoreFit = {
  abc: string; songId: string | undefined; requestedScale: number; transpose: number;
  learnerAccidentals: boolean; visibleKey: string; stanzasPerGroup: number;
  width: number; effectiveScale: number;
};

interface ScoreRendererProps {
  abc: string;
  songId?: string;
  sourceTimingContext?: SourceTimingContext | null;
  accessibleLabel: string;
  scale: number;
  transpose: number;
  learnerAccidentals?: boolean;
  stanzasPerGroup?: number;
  printStanzaNumbers?: readonly number[];
  /** Defined only for source-reviewed hymn lyric defaults. */
  showOriginalLyrics?: boolean;
  visibleVoiceIndexes: readonly number[];
  repeatUnderlay?: RepeatUnderlay;
  onRendered: (tune: abcjs.TuneObject | undefined) => void;
  onScreenAbc?: (prepared: PreparedScreenAbc | undefined) => void;
  onScreenFit?: (fit: ScreenScoreFit | undefined) => void;
  onNoteClick?: (tune: abcjs.TuneObject, startChar: number) => void;
  onPrintReady?: (error?: string) => void;
  registerVisible?: RegisterVisibleScore;
}

function removeInlineKeySignatureArtifacts(container: HTMLElement) {
  for (const element of container.querySelectorAll('.abcjs-key-signature.abcjs-v1, .abcjs-key-signature.abcjs-v3')) element.remove();
  for (const element of container.querySelectorAll('text[stroke="#ff0000"]')) {
    if (element.textContent?.trim() === 'element type keySignature') (element.closest('g') || element).remove();
  }
}

// ABCJS infers split-system tops from the preceding section's bottom.
// Dense lyric bounds can overlap; keep all owned ink without changing notes.
function containPrintSvgSystems(container: HTMLElement) {
  for (const svg of container.querySelectorAll('svg')) {
    if (!svg.querySelector('g') || typeof svg.getBBox !== 'function') continue;
    const box = svg.getAttribute('viewBox')?.trim().split(/\s+/).map(Number);
    if (!box || box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0) continue;
    let bounds: DOMRect;
    try { bounds = svg.getBBox(); } catch { continue; }
    if (![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite) || bounds.width <= 0 || bounds.height <= 0) continue;
    // Root-SVG bounds include child transforms in SVG-local coordinates.
    // Two units also cover the current ABCJS default one-unit stroke.
    const padding = 2;
    const top = Math.min(box[1], bounds.y - padding);
    const bottom = Math.max(box[1] + box[3], bounds.y + bounds.height + padding);
    svg.setAttribute('viewBox', `${box[0]} ${top} ${box[2]} ${bottom - top}`);
    svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    svg.removeAttribute('height');
    svg.style.removeProperty('height');
    const wrapper = svg.parentElement;
    if (wrapper instanceof HTMLElement && wrapper.childElementCount === 1) {
      wrapper.style.removeProperty('height');
      wrapper.style.removeProperty('padding-bottom');
    }
    // Horizontal overflow is diagnosed, never silently rescaled or hidden.
    if (bounds.x - padding < box[0] || bounds.x + bounds.width + padding > box[0] + box[2]) {
      svg.setAttribute('data-print-horizontal-overflow', 'true');
    } else svg.removeAttribute('data-print-horizontal-overflow');
  }
}

function omitEngravedVoiceNames(abc: string, hymn: boolean) {
  const names = hymn
    ? /\s+(?:name|subname|nm|snm)=(?:"[^"]*"|'[^']*'|[^\s]+)/g
    : /\s+(?:name|subname)=(?:"[^"]*"|'[^']*'|[^\s]+)/g;
  return abc.replace(/^V:[^\r\n]*$/gm, (line) =>
    line.replace(names, ''),
  );
}

const HYMNSTOGOD_SYSTEM_SPACING_IDS = new Set([
  'hymn-final-htg-day-by-day',
  'hymn-final-htg-god-leads-us-along',
  'hymn-final-htg-hallelujah-praise-jehovah',
  'hymn-final-htg-how-gentle-god-s-commands',
  'hymn-final-htg-i-must-tell-jesus',
  'hymn-final-htg-love-lifted-me',
  'hymn-final-htg-near-to-the-heart-of-god',
  'hymn-final-htg-oh-how-i-love-jesus',
  'hymn-final-htg-take-time-to-be-holy',
]);

function omitImportedHymnSystemSpacing(abc: string, songId?: string) {
  if (!songId || !HYMNSTOGOD_SYSTEM_SPACING_IDS.has(songId)) return abc;
  const headerEnd = abc.search(/^K:/m);
  if (headerEnd < 0) return abc;
  const header = abc.slice(0, headerEnd);
  // Count parser-recognized case/spacing variants (even staffsep95) and
  // conservatively treat indented instructions as conflicts too.
  const directives = header.match(/^[ \t]*%%[ \t]*staffsep(?![a-z_])[^\r\n]*/gim);
  if (directives?.length !== 1 || !/^%%staffsep[ \t]+90[ \t]*(?:%[^\r\n]*)?$/.test(directives[0])) return abc;
  // ABCJS staffsep sets the gap between whole systems, not between their staves.
  // Let its collision-aware default replace this family's imported page spacing
  // only in screen/print engraving copies. Keep vocalspace and lyric placement.
  return header.replace(/^%%staffsep[ \t]+90[ \t]*(?:%[^\r\n]*)?(?:\r?\n|$)/m, '') + abc.slice(headerEnd);
}

function notationAbc(abc: string, songId?: string) {
  abc = omitImportedHymnSystemSpacing(abc, songId);
  const hymn = songId?.startsWith('hymn-') ?? false;
  // In ABCJS, zero requests system-start measure labels rather than disabling
  // them. Omit that imported instruction only from hymn engraving copies.
  if (hymn) abc = abc.replace(/^%%measurenb[ \t]+0[ \t]*(?:%[^\r\n]*)?(?:\r?\n|$)/gm, '');
  // Song metadata belongs in the app heading/transcript, not ABCJS's score
  // canvas. In particular W: is the stanza-level text field (as opposed to
  // lowercase w:, which is the note underlay and must stay with the music).
  return omitEngravedVoiceNames(abc.replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '')
    // These imported editions retain their original page instructions in the
    // downloadable source. The responsive viewer owns width and line breaks.
    .replace(/^%%(?:pagewidth|barsperstaff)\b[^\r\n]*(?:\r?\n|$)/gm, ''), hymn);
}

/** Hide only parsed engraving lyrics, after source-bound presentation guards.
 * Keep the canonical ABC, all musical events/repeats, and playback untouched.
 */
function omitEngravedLyrics(tune: abcjs.TuneObject) {
  for (const line of tune.lines) for (const staff of line.staff ?? []) {
    for (const voice of staff.voices ?? []) for (const event of voice) {
      if (event.el_type === 'note') delete (event as abcjs.VoiceItemNote & { lyric?: unknown }).lyric;
    }
  }
}

export interface UnderlaidAbcGroup {
  firstStanza: number;
  lastStanza: number;
  stanzaNumbers: number[];
  abc: string;
}

export function splitUnderlaidStanzas(abc: string, stanzasPerGroup = 5, identity?: UnderlayIdentityWitness): UnderlaidAbcGroup[] {
  const model = extractUnderlayModel(abc, identity);
  if (model.ambiguous || model.stanzaNumbers.length <= stanzasPerGroup || stanzasPerGroup < 1) return [];
  // Some printed settings put different stanzas on different music sections.
  // Repeating the entire score for a five-verse page would duplicate sections
  // that those stanzas never sing (for example Psalter 317).
  const lyricSegments = [...new Set(model.rows.filter((row) => row.role !== 'chorus').map((row) => row.musicSegment))];
  if (model.stanzaNumbers.some((number) => lyricSegments.some((segment) =>
    !model.rows.some((row) => row.stanzaNumber === number && row.musicSegment === segment)))) return [];
  const lines = abc.split(/\r?\n/);
  return Array.from({ length: Math.ceil(model.stanzaNumbers.length / stanzasPerGroup) }, (_, index) => {
    const stanzaNumbers = model.stanzaNumbers.slice(index * stanzasPerGroup, index * stanzasPerGroup + stanzasPerGroup);
    const keep = new Set(model.rows.filter((row) => row.role === 'chorus' || stanzaNumbers.includes(row.stanzaNumber)).map((row) => row.sourceLineIndex));
    return {
      firstStanza: stanzaNumbers[0],
      lastStanza: stanzaNumbers.at(-1)!,
      stanzaNumbers,
      abc: lines.filter((line, lineIndex) => !/^\s*w:/.test(line) || keep.has(lineIndex)).join('\n'),
    };
  });
}

export function hasGroupedStanzas(abc: string, stanzasPerGroup = 5, identity?: UnderlayIdentityWitness) {
  return splitUnderlaidStanzas(abc, stanzasPerGroup, identity).length > 0;
}

function ScoreGroupCanvas({ abc, songId, rollGroupingSource, rollSession, rollGeneration, rollMetricsRevision, allCreaturesGroupingSource, heKeepsSizeSource, openingSource, openingSettings, lyricExtenders, hymnSlurClearance, accessibleLabel, scale, transpose, width, stanzasPerGroup, repeatLyricSpacing = false, hymnAboveResponse = false, hymnBelowResponse = false, dottedRests81 = false, sourceHeads, sourceLayers, sharedRests133 = false, sharedQuarterRests, keySignatures143, keySignatures226, onNoteClick, registerVisible, trackingSupported, copy }: {
  abc: string;
  songId?: string;
  rollGroupingSource?: string;
  rollSession?: RollInteriorSession;
  rollGeneration?: { current: number };
  rollMetricsRevision?: number;
  allCreaturesGroupingSource?: string;
  heKeepsSizeSource?: string;
  openingSource?: string;
  openingSettings: HymnOpeningSettings;
  stanzasPerGroup: number;
  accessibleLabel: string;
  scale: number;
  transpose: number;
  width: number;
  lyricExtenders: boolean;
  hymnSlurClearance: HymnSlurClearance;
  repeatLyricSpacing?: boolean;
  hymnAboveResponse?: boolean;
  hymnBelowResponse?: ReturnType<typeof hasHymnBelowResponseSource>;
  dottedRests81?: boolean;
  sourceHeads?: SourceHeadWitness;
  sourceLayers?: SourceLayerWitness;
  sharedRests133?: boolean;
  sharedQuarterRests?: SharedQuarterRestSource;
  keySignatures143?: Psalter143Display;
  keySignatures226?: Psalter226Display;
  onNoteClick?: ScoreRendererProps['onNoteClick'];
  registerVisible?: RegisterVisibleScore;
  trackingSupported: boolean;
  copy: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onNoteClickRef = useRef(onNoteClick);
  const openingSession = useRef(newOpeningBeatSession()).current;
  const openingGeneration = useRef(0);
  onNoteClickRef.current = onNoteClick;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    clearPsalterGroupedOpeningWrap(host);
    clearOpeningBeatReflow(host);
    const groupedBeat = (songId === PSALTER47_GROUPED_ID || songId === PSALTER44_GROUPED_ID) && !!openingSource && scale === 1;
    const openingRevision = ++openingGeneration.current;
    let openingFrame: BeatFrame | undefined, openingSealed = false;
    clearRollInteriorReflow(host);
    host.replaceChildren();
    const generation = rollGeneration?.current;
    const current = () => host.isConnected && host === hostRef.current &&
      openingGeneration.current === openingRevision && rollGeneration?.current === generation;
    releaseRollInteriorFrame(rollSession);
    const settled: { baseline?: RollGroupingBaseline } = {};
    let tune: abcjs.TuneObject | undefined;
    let keysRecognized143 = false;
    let keysRecognized226 = false;
    try {
      const options = withDoesJesusLyricExtenders(host, abc, {
        afterParsing: (tune, _number, source) => {
          presentSharedQuarterRests(
            presentPsalter133SharedRests(tune, source, sharedRests133), source, sharedQuarterRests,
          );
          prepareSourceHeads(tune, source, sourceHeads);
          prepareSourceLayers(tune, source, sourceLayers);
          keysRecognized143 = presentPsalter143KeySignatures(tune, source, keySignatures143);
          keysRecognized226 = presentPsalter226KeySignatures(tune, source, keySignatures226);
          if (keySignatures226 && !keysRecognized226) throw new Error('Unable to validate the Psalter 226 display keys.');
          prepareHymnResponseRows(tune, hymnAboveResponse, hymnBelowResponse);
          reserveHymnSlurClearance(tune, hymnSlurClearance);
          if (rollSession && rollGroupingSource && scale === 1 && stanzasPerGroup === 1)
            captureRollInteriorFrame(rollSession, tune, source, abc);
          if (groupedBeat && !openingSealed)
            openingFrame = captureOpeningBeatFrame(openingSession, tune, source, abc, songId);
          return tune;
        },
        accentAbove: true,
        add_classes: true,
        ...(registerVisible ? { selectionColor: 'currentColor', dragColor: 'currentColor' } : {}),
        clickListener: (element: abcjs.AbcElem) => {
          if (element.el_type === 'note' && element.startChar !== undefined && element.startChar >= 0 && tune) {
            onNoteClickRef.current?.(tune, element.startChar);
          }
        },
        ...SCORE_SVG_OPTIONS,
        staffwidth: width / scale,
        visualTranspose: transpose,
        viewportHorizontal: false,
        wrap: { minSpacing: repeatLyricSpacing ? 1.6 : 1.5, maxSpacing: repeatLyricSpacing ? 3.2 : 2.7, preferredMeasuresPerLine: 0 },
      }, lyricExtenders);
      const groupedRender = refineAllCreaturesGroupingScreenScore(host, abc, songId, options,
        refineWondrousGroupingScreenScore(host, abc, songId, options,
          renderRollGroupingScreenScore(host, abc, songId, options, rollGroupingSource, settled)), allCreaturesGroupingSource);
      openingSealed = true;
      const interiorRender = reflowRollInterior({ host, canonical: rollGroupingSource, prepared: abc, options, original: groupedRender,
        baseline: settled.baseline, session: rollSession, scale, stanzasPerGroup, current });
      if (heKeepsSizeSource) { preserveBlankLyricRows(host); containScreenSvgSystems(host); }
      const sizeRender = refineHeKeepsSizeScreenScore(host, heKeepsSizeSource, abc, songId, options, interiorRender,
        { requestedScale: scale, scoreWidth: width, transpose, stanzasPerGroup });
      const openingRender = reflowAllCreaturesOpeningScreenScore(host, abc, songId, options, sizeRender,
        allCreaturesGroupingSource, scale, width, stanzasPerGroup);
      let rendered = reflowPsalterGroupedOpeningScreenScore(host, openingSource, abc, songId, options, openingRender,
        { requestedScale: scale, scoreWidth: width, transpose, stanzasPerGroup });
      if (groupedBeat && openingSource) rendered = reflowOpeningBeats({ diagnosticHost: host, host,
        source: openingSource, prepared: abc, options, original: rendered, song: songId!,
        settings: openingSettings, frame: openingFrame, current });
      openingFrame = undefined;
      restoreHymnResponseRows(rendered[0]);
      tune = rendered[0];
      preserveBlankLyricRows(host);
      presentPsalter81DottedRests(tune, abc, dottedRests81);
      presentSourceHeads(tune, sourceHeads);
      presentSourceLayers(tune, sourceLayers);
      if (abc.includes('[K:') && !keysRecognized143 && !keysRecognized226) removeInlineKeySignatureArtifacts(host);
      containScreenSvgSystems(host);
      if (tune) {
        const unregister = registerVisible?.({ host, tune, source: abc, copy, supported: trackingSupported });
        if (!groupedBeat) return unregister;
        return () => {
          tune = undefined;
          openingFrame = undefined;
          openingGeneration.current++;
          clearOpeningBeatReflow(host);
          unregister?.();
        };
      }
    } catch (error) {
      openingGeneration.current++;
      openingFrame = undefined;
      tune = undefined;
      clearOpeningBeatReflow(host);
      clearPsalterGroupedOpeningWrap(host);
      clearRollInteriorReflow(host);
      host.replaceChildren();
      const alert = document.createElement('p');
      alert.setAttribute('role', 'alert');
      alert.textContent = error instanceof Error ? `Unable to render this score: ${error.message}` : 'Unable to render this score.';
      host.appendChild(alert);
    } finally { releaseRollInteriorFrame(rollSession); }
  }, [openingSession, openingSettings, abc, songId, rollGroupingSource, rollSession, rollGeneration, rollMetricsRevision, allCreaturesGroupingSource, heKeepsSizeSource, openingSource, lyricExtenders, hymnSlurClearance, hymnAboveResponse, hymnBelowResponse, dottedRests81, sourceHeads, sourceLayers, sharedRests133, sharedQuarterRests, keySignatures143, keySignatures226, repeatLyricSpacing, scale, transpose, width, stanzasPerGroup, registerVisible, trackingSupported, copy]);

  return <div className="score-canvas" ref={hostRef} role="img" aria-label={accessibleLabel} />;
}

/** Give a coincident attack ownership of a half-open timing boundary before
 * checking note interiors. Different tuplet sums can straddle that boundary
 * by a few floating-point bits; use the same tolerance as lyric-slot matching.
 */
function eventAtLyricOnset<T extends { onset: number; duration: number }>(events: readonly T[], onset: number): T | undefined {
  return events.find((event) => Math.abs(event.onset - onset) < 1e-8)
    ?? events.find((event) => event.onset <= onset && onset < event.onset + event.duration);
}

/** Build a real reduced score: hiding SVG voice classes also hides staff lines and lyrics. */
export function selectScoreVoices(
  abc: string,
  visibleVoiceIndexes: readonly number[],
  repeatRows?: { model: RepeatUnderlay; stanzaNumbers?: readonly number[] },
  presentation: { lyricRecipientPriority?: readonly string[]; transferLyrics?: boolean; underlayIdentity?: UnderlayIdentityWitness } = {},
) {
  const lines = abc.split(/\r?\n/);
  const ids = [...new Set(lines.flatMap((line) => {
    const match = /^V:[ \t]*([^\s]+)/.exec(line);
    return match ? [match[1]] : [];
  }))];
  if (!ids.length || visibleVoiceIndexes.length === ids.length) return abc;
  const selected = new Set(visibleVoiceIndexes.map((index) => ids[index]).filter(Boolean));
  if (!selected.size) return '';

  let currentVoice = '';
  let inBody = false;
  let orphanedLyricsVoice = '';
  const output: { line: string; voice?: string; musicSegment?: number }[] = [];
  const orphanedLyrics = new Map<number, string[]>();
  const orphanedLyricLineIndexes = new Map<number, number[]>();
  const orphanedLyricsByVoice = new Map<string, Map<number, string[]>>();
  const orphanedLyricLineIndexesByVoice = new Map<string, Map<number, number[]>>();
  const selectedLyrics = new Set<string>();
  const nextMusicSegment = new Map<string, number>();
  const lastMusicSegment = new Map<string, number>();
  const voiceDefinitions = new Map<string, string>();
  const voiceMusic = new Map<string, Map<number, string[]>>();
  const voiceDirectives = new Map<string, Map<number, string[]>>();
  const globalHeaders: string[] = [];
  let originalStaffGroups: string[][] = [];
  const selectedTargetVoice = presentation.lyricRecipientPriority?.find((id) => selected.has(id))
    ?? ids.find((id) => selected.has(id));
  const segmentKey = (voice: string, segment: number) => `${voice}\0${segment}`;
  const repeatRowKeysBySegment = new Map<number, string[]>();
  const repeatStanzaNumbers = new Set(repeatRows?.stanzaNumbers ?? repeatRows?.model.stanzaNumbers ?? []);
  if (repeatRows) {
    for (const event of repeatRows.model.events) {
      if (!repeatStanzaNumbers.has(event.stanzaNumber)) continue;
      const keys = repeatRowKeysBySegment.get(event.musicSegment) ?? [];
      const key = `${event.stanzaNumber}:${event.repeatPass}`;
      if (!keys.includes(key)) keys.push(key);
      repeatRowKeysBySegment.set(event.musicSegment, keys);
    }
  }
  const repeatCarrierLineIndexesBySegment = new Map<number, number[]>();
  const repeatRowKeyByLineIndex = new Map<number, string>();
  const storeMusic = (line: string, voice: string, musicSegment: number) => {
    const music = line.replace(/^\s*\[V:[^\]]+\]\s*/, '');
    const segments = voiceMusic.get(voice) ?? new Map<number, string[]>();
    segments.set(musicSegment, [...(segments.get(musicSegment) ?? []), music]);
    voiceMusic.set(voice, segments);
  };
  const storeDirective = (line: string, voice: string) => {
    const musicSegment = nextMusicSegment.get(voice) ?? 0;
    const directives = voiceDirectives.get(voice) ?? new Map<number, string[]>();
    directives.set(musicSegment, [...(directives.get(musicSegment) ?? []), line]);
    voiceDirectives.set(voice, directives);
  };
  const pushMusic = (line: string, voice: string) => {
    const musicSegment = nextMusicSegment.get(voice) ?? 0;
    nextMusicSegment.set(voice, musicSegment + 1);
    lastMusicSegment.set(voice, musicSegment);
    output.push({ line, voice, musicSegment });
    storeMusic(line, voice, musicSegment);
  };
  const isMusicLine = (line: string) => {
    const content = line.trim();
    return content.length > 0 && !content.startsWith('%') && !/^[A-Z]:/.test(content);
  };

  for (const [sourceLineIndex, line] of lines.entries()) {
    const match = /^V:[ \t]*([^\s]+)(.*)$/.exec(line);
    if (match) {
      // Voice declarations have clef/name attributes; bare V: lines start music.
      inBody = !match[2].trim();
      currentVoice = match[1];
      voiceDefinitions.set(currentVoice, line);
      if (selected.has(currentVoice)) output.push({ line });
      continue;
    }
    const inlineVoice = /^(\s*)\[V:[ \t]*([^\]\s]+)([^\]]*)\](.*)$/.exec(line);
    if (inlineVoice) {
      currentVoice = inlineVoice[2];
      inBody = true;
      if (!voiceDefinitions.has(currentVoice)) voiceDefinitions.set(currentVoice, `V:${currentVoice}`);
      if (isMusicLine(inlineVoice[4])) {
        if (selected.has(currentVoice)) pushMusic(line, currentVoice);
        else {
          const musicSegment = nextMusicSegment.get(currentVoice) ?? 0;
          nextMusicSegment.set(currentVoice, musicSegment + 1);
          lastMusicSegment.set(currentVoice, musicSegment);
          storeMusic(line, currentVoice, musicSegment);
        }
      } else if (selected.has(currentVoice)) output.push({ line });
      continue;
    }
    if (line.startsWith('%%score')) {
      // Keep surviving voices on their original staves. Expanding each voice
      // into its own group splits the shared tenor/bass staff when soprano is
      // disabled and changes the score's layout instead of only its parts.
      const groups = line.slice('%%score'.length).match(/\([^)]*\)|[^\s{}[\]|()]+/g) ?? [];
      originalStaffGroups = groups.map((group) => group.replace(/[()]/g, '').trim().split(/\s+/).filter(Boolean));
      const retained = groups.flatMap((group) => {
        const voices = group.replace(/[()]/g, '').trim().split(/\s+/).filter((id) => selected.has(id));
        return voices.length ? [`(${voices.join(' ')})`] : [];
      });
      const staves = retained.join(' ');
      output.push({ line: `%%score ${line.includes('{') && retained.length > 1 ? `{ ${staves} }` : staves}` });
    } else if (inBody && /^w:/.test(line)) {
      const musicSegment = lastMusicSegment.get(currentVoice);
      if (repeatRows && currentVoice === repeatRows.model.voiceId && musicSegment !== undefined) {
        const lineIndexes = repeatCarrierLineIndexesBySegment.get(musicSegment) ?? [];
        lineIndexes.push(sourceLineIndex);
        repeatCarrierLineIndexesBySegment.set(musicSegment, lineIndexes);
      }
      if (selected.has(currentVoice)) {
        if (musicSegment !== undefined) selectedLyrics.add(segmentKey(currentVoice, musicSegment));
        output.push({ line });
      } else if (musicSegment !== undefined) {
        if (!orphanedLyricsVoice) orphanedLyricsVoice = currentVoice;
        const voiceLyrics = orphanedLyricsByVoice.get(currentVoice) ?? new Map<number, string[]>();
        const segmentLyrics = voiceLyrics.get(musicSegment) ?? [];
        segmentLyrics.push(line);
        voiceLyrics.set(musicSegment, segmentLyrics);
        orphanedLyricsByVoice.set(currentVoice, voiceLyrics);
        const voiceLineIndexes = orphanedLyricLineIndexesByVoice.get(currentVoice) ?? new Map<number, number[]>();
        const lineIndexes = voiceLineIndexes.get(musicSegment) ?? [];
        lineIndexes.push(sourceLineIndex);
        voiceLineIndexes.set(musicSegment, lineIndexes);
        orphanedLyricLineIndexesByVoice.set(currentVoice, voiceLineIndexes);
        if (orphanedLyricsVoice === currentVoice) {
          orphanedLyrics.set(musicSegment, segmentLyrics);
          orphanedLyricLineIndexes.set(musicSegment, lineIndexes);
        }
      }
    } else if (inBody && currentVoice && isMusicLine(line)) {
      if (selected.has(currentVoice)) pushMusic(line, currentVoice);
      else {
        const musicSegment = nextMusicSegment.get(currentVoice) ?? 0;
        nextMusicSegment.set(currentVoice, musicSegment + 1);
        lastMusicSegment.set(currentVoice, musicSegment);
        storeMusic(line, currentVoice, musicSegment);
      }
    } else if (inBody && currentVoice && /^[A-Z]:/.test(line)) {
      storeDirective(line, currentVoice);
      if (selected.has(currentVoice)) output.push({ line });
    } else if (!inBody || !currentVoice || selected.has(currentVoice)) {
      output.push({ line });
      if (!inBody && !line.startsWith('%%score')) globalHeaders.push(line);
    }
  }

  // Generated repeat rows have no explicit stanza label on every line. Attach
  // their identities by the model's stable row order, and only when each
  // carrier segment has the exact expected number of rows.
  for (const [musicSegment, rowKeys] of repeatRowKeysBySegment) {
    const lineIndexes = repeatCarrierLineIndexesBySegment.get(musicSegment) ?? [];
    if (lineIndexes.length !== rowKeys.length) continue;
    lineIndexes.forEach((lineIndex, index) => repeatRowKeyByLineIndex.set(lineIndex, rowKeys[index]));
  }

  // Underlay may exist on only one part. Keep selected-voice rows authoritative;
  // source and target line breaks need not match because transfer uses absolute
  // ABCJS event onsets across each complete voice.
  // Validate a supplied witness before either transfer path, including the
  // identical-timeline shortcut and any display-only note preparation. Never
  // donate partially recognized source rows through legacy ordinal inference.
  const reviewedUnderlayModel = presentation.underlayIdentity
    ? extractUnderlayModel(abc, presentation.underlayIdentity) : undefined;
  const reviewedIdentityValid = !reviewedUnderlayModel || (!reviewedUnderlayModel.ambiguous &&
    reviewedUnderlayModel.rows.length === lines.filter(line => /^\s*w:/.test(line)).length);
  const canTransferLyrics = presentation.transferLyrics !== false && reviewedIdentityValid && orphanedLyricsVoice !== '' && selectedTargetVoice !== undefined &&
    orphanedLyricsByVoice.size > 0 && !!voiceMusic.get(selectedTargetVoice)?.size;
  // A reduced part can need a different printed lyric donor on later systems.
  // Prefer hidden voices sharing the selected part's original staff; this is
  // important when an arrangement changes underlay between systems.
  const selectedStaff = originalStaffGroups.find((group) => group.includes(selectedTargetVoice ?? '')) ?? [];
  const donorPreference = [
    ...selectedStaff.filter((voice) => voice !== selectedTargetVoice && !selected.has(voice)),
    ...[...orphanedLyricsByVoice.keys()].filter((voice) => !selectedStaff.includes(voice) && !selected.has(voice)),
  ];

  const parseVoice = (voiceId: string, lyricSegments: ReadonlyMap<number, readonly string[]> = new Map()) => {
    const segments = voiceMusic.get(voiceId);
    if (!segments?.size) return undefined;
    const header = globalHeaders.filter((line) => !/^%%score\b/.test(line));
    const definition = voiceDefinitions.get(voiceId) ?? `V:${voiceId}`;
    const sourceLines = [...header, `%%score (${voiceId})`, definition];
    const ranges = new Map<number, { start: number; end: number }>();
    const lineRanges: { segment: number; lineIndex: number; start: number; end: number }[] = [];
    let sourceLength = sourceLines.join('\n').length + 1;
    for (const [musicSegment, musicLines] of [...segments.entries()].sort(([left], [right]) => left - right)) {
      for (const directive of voiceDirectives.get(voiceId)?.get(musicSegment) ?? []) {
        sourceLines.push(directive);
        sourceLength += directive.length + 1;
      }
      const start = sourceLength;
      for (const [lineIndex, music] of musicLines.entries()) {
        const lineStart = sourceLength;
        sourceLines.push(music);
        sourceLength += music.length + 1;
        lineRanges.push({ segment: musicSegment, lineIndex, start: lineStart, end: sourceLength - 1 });
      }
      ranges.set(musicSegment, { start, end: sourceLength - 1 });
      for (const lyric of lyricSegments.get(musicSegment) ?? []) {
        sourceLines.push(lyric);
        sourceLength += lyric.length + 1;
      }
    }
    const source = sourceLines.join('\n');
    try {
      const tune = abcjs.parseOnly(source)[0];
      type ParsedNote = abcjs.VoiceItemNote & {
        lyric?: Array<{ syllable: string; divider: ' ' | '-' | '_' }>;
        grace?: boolean;
        gracenotes?: abcjs.AbcElemGraceNote[];
        startTriplet?: number;
        tripletMultiplier?: number;
        endTriplet?: true;
      };
      const events = tune?.lines.flatMap((tuneLine) => tuneLine.staff?.flatMap((staff) =>
        staff.voices?.flatMap((voice) => voice.filter((event): event is ParsedNote => event.el_type === 'note')) ?? [],
      ) ?? []) ?? [];
      let onset = 0;
      let tripletMultiplier = 1;
      return events.flatMap((event) => {
        const musicSegment = [...ranges.entries()].find(([, range]) => event.startChar >= range.start && event.startChar < range.end)?.[0];
        if (musicSegment === undefined) return [];
        if (event.startTriplet && event.tripletMultiplier) tripletMultiplier = event.tripletMultiplier;
        const sourceLine = lineRanges.find((range) => event.startChar >= range.start && event.startChar < range.end);
        const timed = {
          event,
          onset,
          duration: (event.duration ?? 0) * tripletMultiplier,
          tripletMultiplier,
          musicSegment,
          sourceLineIndex: sourceLine?.lineIndex,
          sourceLineOffset: sourceLine ? event.startChar - sourceLine.start : undefined,
        };
        onset += (event.duration ?? 0) * tripletMultiplier;
        if (event.endTriplet) tripletMultiplier = 1;
        return [timed];
      });
    } catch {
      return undefined;
    }
  };

  const transferredLyrics = new Map<number, string[]>();
  const syntheticLyricAnchorOnsets = new Set<number>();
  if (canTransferLyrics && orphanedLyricsVoice && selectedTargetVoice) {
    if (typeof abcjs.parseOnly !== 'function') {
      if (import.meta.env.MODE === 'test') {
        for (const [segment, rows] of orphanedLyrics) transferredLyrics.set(segment, rows);
      } else {
        console.error(`ScoreRenderer: ABCJS parseOnly is unavailable for ${orphanedLyricsVoice}/${selectedTargetVoice}; score underlay was omitted in this part view. The full lyric transcript remains available.`);
      }
      } else {
        let targetEvents = parseVoice(selectedTargetVoice);
      if (!targetEvents) {
        console.error(`ScoreRenderer: could not parse ${selectedTargetVoice} voice events for lyric transfer; score underlay was omitted in this part view. The full lyric transcript remains available.`);
      } else {
        const targetRanges = new Map<number, { start: number; end: number }>();
        for (const event of targetEvents) {
          const range = targetRanges.get(event.musicSegment);
          targetRanges.set(event.musicSegment, {
            start: Math.min(range?.start ?? event.onset, event.onset),
            end: Math.max(range?.end ?? event.onset + event.duration, event.onset + event.duration),
          });
        }
        const sourceEventsByVoice = new Map<string, NonNullable<ReturnType<typeof parseVoice>>>();
        for (const voice of donorPreference) {
          const events = parseVoice(voice);
          if (events) sourceEventsByVoice.set(voice, events);
        }
        const rangeBySegment = (events: NonNullable<ReturnType<typeof parseVoice>>) => {
          const ranges = new Map<number, { start: number; end: number }>();
          for (const event of events) {
            const range = ranges.get(event.musicSegment);
            ranges.set(event.musicSegment, {
              start: Math.min(range?.start ?? event.onset, event.onset),
              end: Math.max(range?.end ?? event.onset + event.duration, event.onset + event.duration),
            });
          }
          return ranges;
        };
        const sourceRangesByVoice = new Map([...sourceEventsByVoice].map(([voice, events]) => [voice, rangeBySegment(events)]));
        const donorsByTargetSegment = new Map<number, { start: number; end: number; voice: string; sourceSegments: number[] }[]>();
        for (const [targetSegment, targetRange] of targetRanges) {
          if (targetRange.end <= targetRange.start) continue;
          const candidatesByVoice = new Map(donorPreference.map((voice) => {
            const lyricSegments = new Set(orphanedLyricsByVoice.get(voice)?.keys() ?? []);
            return [voice, [...(sourceRangesByVoice.get(voice) ?? [])]
              .filter(([sourceSegment, range]) => lyricSegments.has(sourceSegment) && range.start < targetRange.end && targetRange.start < range.end)
              .sort(([left], [right]) => left - right)];
          }));
          const boundaries = new Set([targetRange.start, targetRange.end]);
          for (const candidates of candidatesByVoice.values()) for (const [, range] of candidates) {
            boundaries.add(Math.max(targetRange.start, range.start));
            boundaries.add(Math.min(targetRange.end, range.end));
          }
          const sortedBoundaries = [...boundaries].sort((left, right) => left - right);
          const fragments: { start: number; end: number; voice: string; sourceSegments: number[] }[] = [];
          for (let index = 0; index < sortedBoundaries.length - 1; index++) {
            const start = sortedBoundaries[index];
            const end = sortedBoundaries[index + 1];
            if (end <= start) continue;
            let selectedDonor: { voice: string; sourceSegments: number[] } | undefined;
            for (const voice of donorPreference) {
              const coveringSegments = (candidatesByVoice.get(voice) ?? [])
                .filter(([, range]) => range.start <= start + 1e-8 && range.end >= end - 1e-8)
                .map(([segment]) => segment);
              if (coveringSegments.length) {
                selectedDonor = { voice, sourceSegments: coveringSegments };
                break;
              }
            }
            if (!selectedDonor) continue;
            const prior = fragments.at(-1);
            if (prior && prior.end >= start - 1e-8 && prior.voice === selectedDonor.voice &&
              prior.sourceSegments.join(',') === selectedDonor.sourceSegments.join(',')) prior.end = end;
            else fragments.push({ start, end, ...selectedDonor });
          }
          donorsByTargetSegment.set(targetSegment, fragments);
        }
        const donorVoices = new Set([...donorsByTargetSegment.values()].flatMap((fragments) => fragments.map((donor) => donor.voice)));
        const sourceEvents = donorVoices.size === 1 ? parseVoice([...donorVoices][0]) : undefined;
        // If a source syllable falls inside an ordinary sustained target note,
        // add an engraving-only tie boundary at that onset. The original ABC
        // and full score used for audio are not changed. Limit this to simple
        // single-pitch notes outside tuplets, grace notes, and existing ties.
        const sourceAnchorOnsets = new Set<number>();
        const targetSegmentAtOnset = (events: NonNullable<typeof targetEvents>, anchorOnset: number) =>
          eventAtLyricOnset(events, anchorOnset)?.musicSegment;
        const targetHasAuthoritativeLyricsAtOnset = (events: NonNullable<typeof targetEvents>, anchorOnset: number) => {
          const segment = targetSegmentAtOnset(events, anchorOnset);
          return segment !== undefined && selectedLyrics.has(segmentKey(selectedTargetVoice, segment));
        };
        const isOrdinarySplitNote = (timed: NonNullable<typeof targetEvents>[number], allowTies = false) =>
          !timed.event.rest && timed.event.pitches?.length === 1 &&
          (allowTies || (!timed.event.pitches[0].endTie && !timed.event.pitches[0].startTie)) &&
          !timed.event.startTriplet && !timed.event.endTriplet && timed.tripletMultiplier === 1 &&
          timed.event.grace !== true && !timed.event.gracenotes?.length && (timed.event.duration ?? 0) > 0;
        for (const [targetSegment, fragments] of donorsByTargetSegment) {
          for (const donor of fragments) {
            const lyricSegments = orphanedLyricsByVoice.get(donor.voice);
            for (const segment of donor.sourceSegments) {
              const rows = lyricSegments?.get(segment) ?? [];
              const rowEvents = parseVoice(donor.voice, new Map([[segment, rows]]));
              for (const { event, onset, musicSegment } of rowEvents ?? []) {
                if (musicSegment === segment && onset >= donor.start - 1e-8 && onset < donor.end - 1e-8 &&
                  targetSegmentAtOnset(targetEvents, onset) === targetSegment &&
                !event.rest && event.lyric?.some((lyric) => lyric.syllable) &&
                !targetHasAuthoritativeLyricsAtOnset(targetEvents, onset)) sourceAnchorOnsets.add(onset);
              }
            }
          }
        }
        const eventHasAttackAt = (events: NonNullable<typeof targetEvents>, onset: number) => events.some(({ event, onset: eventOnset }) =>
          Math.abs(eventOnset - onset) < 1e-8 && !event.rest && !event.pitches?.every((pitch) => pitch.endTie),
        );
        const splitPointsByEvent = new Map<NonNullable<typeof targetEvents>[number], number[]>();
        for (const anchorOnset of sourceAnchorOnsets) {
          if (eventHasAttackAt(targetEvents, anchorOnset)) continue;
          const sustained = targetEvents.find((timed) =>
            isOrdinarySplitNote(timed, true) && timed.onset < anchorOnset &&
            anchorOnset < timed.onset + (timed.event.duration ?? 0),
          );
          if (sustained) {
            const points = splitPointsByEvent.get(sustained) ?? [];
            points.push(anchorOnset);
            splitPointsByEvent.set(sustained, points);
          }
        }
        type LyricAnchorReplacement = { offset: number; length: number; replacement: string; onsets: number[] };
        type BrokenRhythmPair = {
          first: NonNullable<typeof targetEvents>[number];
          second: NonNullable<typeof targetEvents>[number];
          firstPitch: string;
          secondPitch: string;
          firstFactor: number;
          secondFactor: number;
          offset: number;
          length: number;
          lineIndex: number;
          segment: number;
        };
        const replacementsBySegment = new Map<number, Map<number, LyricAnchorReplacement[]>>();
        const replacementRangesByLine = new Map<string, { start: number; end: number }[]>();
        const pairByEvent = new Map<NonNullable<typeof targetEvents>[number], BrokenRhythmPair>();
        const brokenRhythmEvents = new Set<NonNullable<typeof targetEvents>[number]>();
        const unsupportedBrokenRhythmEvents = new Set<NonNullable<typeof targetEvents>[number]>();
        const markUnsupportedBrokenRhythm = (first: NonNullable<typeof targetEvents>[number], second: NonNullable<typeof targetEvents>[number]) => {
          unsupportedBrokenRhythmEvents.add(first);
          unsupportedBrokenRhythmEvents.add(second);
        };
        const brokenRhythmCandidates: BrokenRhythmPair[] = [];
        const parseWrittenNote = (token: string) => {
          const match = /^([_=^]*[A-Ga-g][,']*)(?:(\d+)?(\/+)(\d*)|(\d+))?$/.exec(token);
          if (!match) return undefined;
          const prefixNumerator = match[2] ? Number(match[2]) : undefined;
          const integerLength = match[5] ? Number(match[5]) : undefined;
          const slashCount = match[3]?.length ?? 0;
          const explicitDenominator = match[4] ? Number(match[4]) : undefined;
          if (slashCount > 1 && explicitDenominator !== undefined) return undefined;
          const numerator = integerLength ?? prefixNumerator ?? 1;
          const denominator = explicitDenominator ?? (slashCount ? 2 ** slashCount : 1);
          const factor = numerator / denominator;
          return Number.isFinite(factor) && factor > 0 ? { pitch: match[1], factor } : undefined;
        };
        const asAbcLength = (factor: number) => {
          if (Math.abs(factor - 1) < 1e-8) return '';
          if (Number.isInteger(factor)) return String(factor);
          for (let denominator = 2; denominator <= 64; denominator++) {
            const numerator = Math.round(factor * denominator);
            if (Math.abs(factor - numerator / denominator) < 1e-8) return `${numerator}/${denominator}`;
          }
          return undefined;
        };
        const defaultLengthLine = globalHeaders.find((line) => /^L:\s*/.test(line));
        const defaultLengthMatch = defaultLengthLine && /^L:\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(defaultLengthLine);
        const defaultUnit = defaultLengthMatch
          ? Number(defaultLengthMatch[1]) / Number(defaultLengthMatch[2])
          : undefined;
        // Detect the written operator from the adjacent source span, not from
        // either parsed note's length. ABCJS applies the factor to the pair,
        // including the seemingly ordinary second note after `<`.
        for (let index = 0; index < targetEvents.length - 1; index += 1) {
          const first = targetEvents[index];
          const second = targetEvents[index + 1];
          const segmentLines = voiceMusic.get(selectedTargetVoice)?.get(first.musicSegment);
          const lineIndex = first.sourceLineIndex;
          const firstOffset = first.sourceLineOffset;
          const secondOffset = second.sourceLineOffset;
          const firstCharLength = (first.event.endChar ?? 0) - (first.event.startChar ?? 0);
          const secondCharLength = (second.event.endChar ?? 0) - (second.event.startChar ?? 0);
          if (!segmentLines || lineIndex === undefined || firstOffset === undefined || firstCharLength <= 0) continue;
          const originalMusic = segmentLines[lineIndex];
          const firstRawText = originalMusic.slice(firstOffset, firstOffset + firstCharLength);
          const hasBrokenRhythm = /[<>]/.test(firstRawText);
          if (hasBrokenRhythm) {
            brokenRhythmEvents.add(first);
            brokenRhythmEvents.add(second);
          }
          if (first.musicSegment !== second.musicSegment || first.sourceLineIndex !== second.sourceLineIndex ||
            secondOffset === undefined || secondCharLength <= 0) {
            if (hasBrokenRhythm) markUnsupportedBrokenRhythm(first, second);
            continue;
          }
          const rawPair = originalMusic.slice(firstOffset, secondOffset + secondCharLength);
          // The operator must be written after the first note. A marker in
          // the second note's span belongs to a later pair and must not make
          // an ordinary note immediately before that pair look rhythmic.
          if (!hasBrokenRhythm) continue;
          const pairMatch = /^\s*([_=^]*[A-Ga-g][,']*(?:\d+)?(?:\/+\d*)?)[ \t]*([<>])[ \t]*([_=^]*[A-Ga-g][,']*(?:\d+)?(?:\/+\d*)?)\s*$/.exec(rawPair);
          if (!pairMatch ||
            !isOrdinarySplitNote(first) || !isOrdinarySplitNote(second) ||
            defaultUnit === undefined || !Number.isFinite(defaultUnit) || defaultUnit <= 0 ||
            Math.abs(second.onset - (first.onset + first.duration)) > 1e-8) {
            markUnsupportedBrokenRhythm(first, second);
            continue;
          }
          const firstWritten = parseWrittenNote(pairMatch[1]);
          const secondWritten = parseWrittenNote(pairMatch[3]);
          if (!firstWritten || !secondWritten) {
            markUnsupportedBrokenRhythm(first, second);
            continue;
          }
          const firstMultiplier = pairMatch[2] === '>' ? 1.5 : 0.5;
          const secondMultiplier = 2 - firstMultiplier;
          const firstFactor = firstWritten.factor * firstMultiplier;
          const secondFactor = secondWritten.factor * secondMultiplier;
          if (Math.abs(first.duration - defaultUnit * firstFactor) > 1e-8 ||
            Math.abs(second.duration - defaultUnit * secondFactor) > 1e-8) {
            markUnsupportedBrokenRhythm(first, second);
            continue;
          }
          const leadingWhitespace = rawPair.length - rawPair.trimStart().length;
          const trimmedPair = rawPair.trim();
          brokenRhythmCandidates.push({
            first,
            second,
            firstPitch: firstWritten.pitch,
            secondPitch: secondWritten.pitch,
            firstFactor,
            secondFactor,
            offset: firstOffset + leadingWhitespace,
            length: trimmedPair.length,
            lineIndex,
            segment: first.musicSegment,
          });
        }
        // Adjacent operators form a chain. Keep those events marked as broken
        // rhythm so neither side can fall through to the ordinary-note path.
        const candidateCounts = new Map<NonNullable<typeof targetEvents>[number], number>();
        for (const pair of brokenRhythmCandidates) {
          candidateCounts.set(pair.first, (candidateCounts.get(pair.first) ?? 0) + 1);
          candidateCounts.set(pair.second, (candidateCounts.get(pair.second) ?? 0) + 1);
        }
        for (const pair of brokenRhythmCandidates) {
          if (candidateCounts.get(pair.first) !== 1 || candidateCounts.get(pair.second) !== 1) {
            brokenRhythmEvents.add(pair.first);
            brokenRhythmEvents.add(pair.second);
            markUnsupportedBrokenRhythm(pair.first, pair.second);
            continue;
          }
          if (unsupportedBrokenRhythmEvents.has(pair.first) || unsupportedBrokenRhythmEvents.has(pair.second)) continue;
          pairByEvent.set(pair.first, pair);
          pairByEvent.set(pair.second, pair);
        }
        const renderSplitNote = (
          pitch: string,
          factor: number,
          timed: NonNullable<typeof targetEvents>[number],
          points: readonly number[],
          lengthForSplit = asAbcLength,
          allowExplicitThirds = false,
        ) => {
          const duration = timed.event.duration ?? 0;
          const splitPoints = [...new Set(points)].filter((point) =>
            point > timed.onset + 1e-8 && point < timed.onset + duration - 1e-8,
          ).sort((left, right) => left - right);
          const boundaries = [timed.onset, ...splitPoints, timed.onset + duration];
          const rawLengths = boundaries.slice(1).map((end, index) => factor * (end - boundaries[index]) / duration);
          const isEqualThirds = allowExplicitThirds && rawLengths.length === 3 &&
            rawLengths.every((length) => Math.abs(length - rawLengths[0]) < 1e-8) &&
            Math.abs(rawLengths[0] * 3 - Math.round(rawLengths[0] * 3)) < 1e-8 &&
            Math.abs(rawLengths[0] - Math.round(rawLengths[0])) >= 1e-8;
          const lengths = rawLengths.map((length) => lengthForSplit(isEqualThirds ? Math.round(length * 3) / 2 : length));
          if (lengths.some((length) => length === undefined)) return undefined;
          const tiedText = `${isEqualThirds ? '(3:2:3' : ''}${lengths.map((length) => `${pitch}${length}`).join('-')}`;
          const outgoingTie = timed.event.pitches?.[0]?.startTie ? '-' : '';
          return { text: `${tiedText}${outgoingTie}`, onsets: splitPoints };
        };
        const scheduleReplacement = (segment: number, lineIndex: number, replacement: LyricAnchorReplacement) => {
          const key = `${segment}:${lineIndex}`;
          const ranges = replacementRangesByLine.get(key) ?? [];
          const end = replacement.offset + replacement.length;
          if (ranges.some((range) => replacement.offset < range.end && range.start < end)) return false;
          ranges.push({ start: replacement.offset, end });
          replacementRangesByLine.set(key, ranges);
          const lineReplacements = replacementsBySegment.get(segment) ?? new Map<number, LyricAnchorReplacement[]>();
          const replacements = lineReplacements.get(lineIndex) ?? [];
          replacements.push(replacement);
          lineReplacements.set(lineIndex, replacements);
          replacementsBySegment.set(segment, lineReplacements);
          return true;
        };
        const handledBrokenRhythmPairs = new Set<BrokenRhythmPair>();
        for (const [sustained, points] of splitPointsByEvent) {
          if (brokenRhythmEvents.has(sustained)) {
            if (unsupportedBrokenRhythmEvents.has(sustained)) continue;
            const pair = pairByEvent.get(sustained);
            if (!pair || handledBrokenRhythmPairs.has(pair)) continue;
            const compactHalfLength = (factor: number) => asAbcLength(factor) === '1/2' ? '/' : asAbcLength(factor);
            const first = renderSplitNote(pair.firstPitch, pair.firstFactor, pair.first, splitPointsByEvent.get(pair.first) ?? [], compactHalfLength);
            const second = renderSplitNote(pair.secondPitch, pair.secondFactor, pair.second, splitPointsByEvent.get(pair.second) ?? [], compactHalfLength);
            if (!first || !second) continue;
            const onsets = [...first.onsets, ...second.onsets];
            if (scheduleReplacement(pair.segment, pair.lineIndex, {
              offset: pair.offset,
              length: pair.length,
              replacement: `${first.text} ${second.text}`,
              onsets,
            })) handledBrokenRhythmPairs.add(pair);
            continue;
          }

          const segmentLines = voiceMusic.get(selectedTargetVoice)?.get(sustained.musicSegment);
          const lineIndex = sustained.sourceLineIndex;
          const offset = sustained.sourceLineOffset;
          const charLength = (sustained.event.endChar ?? 0) - (sustained.event.startChar ?? 0);
          if (!segmentLines || lineIndex === undefined || offset === undefined || charLength <= 0) continue;
          const originalMusic = segmentLines[lineIndex];
          const rawEventText = originalMusic.slice(offset, offset + charLength);
          const leadingWhitespace = rawEventText.length - rawEventText.trimStart().length;
          const eventOffset = offset + leadingWhitespace;
          const eventToken = rawEventText.trim();
          // Broken-rhythm notes without a validated simple pair must fail
          // closed rather than being split using their written token length.
          if (/[<>]/.test(rawEventText) || !isOrdinarySplitNote(sustained, true)) continue;
          const slurMatch = /^(\(*)([^()]*)(\)*)$/.exec(eventToken);
          if (!slurMatch) continue;
          const note = parseWrittenNote(slurMatch[2].replace(/-$/, ''));
          if (!note) continue;
          const split = renderSplitNote(note.pitch, note.factor, sustained, points, asAbcLength, true);
          if (!split) continue;
          scheduleReplacement(sustained.musicSegment, lineIndex, {
            offset: eventOffset,
            length: eventToken.length,
            replacement: `${slurMatch[1]}${split.text}${slurMatch[3]}`,
            onsets: split.onsets,
          });
        }
        for (const [segment, lineReplacements] of replacementsBySegment) {
          const segmentLines = voiceMusic.get(selectedTargetVoice)?.get(segment);
          if (!segmentLines) continue;
          for (const [lineIndex, replacements] of lineReplacements) {
            let updatedLine = segmentLines[lineIndex];
            for (const replacement of replacements.sort((left, right) => right.offset - left.offset)) {
              updatedLine = `${updatedLine.slice(0, replacement.offset)}${replacement.replacement}${updatedLine.slice(replacement.offset + replacement.length)}`;
              replacement.onsets.forEach((point) => syntheticLyricAnchorOnsets.add(point));
            }
            segmentLines[lineIndex] = updatedLine;
            const outputEntry = output.find((entry) => entry.voice === selectedTargetVoice && entry.musicSegment === segment);
            if (outputEntry) {
              const inlineVoice = /^(\s*\[V:[^\]]+\]\s*)/.exec(outputEntry.line)?.[1] ?? '';
              outputEntry.line = `${inlineVoice}${updatedLine}`;
            }
          }
        }
        if (splitPointsByEvent.size) {
          const reparsedTargetEvents = parseVoice(selectedTargetVoice);
          if (reparsedTargetEvents) targetEvents = reparsedTargetEvents;
          else console.error(`ScoreRenderer: could not reparse ${selectedTargetVoice} after adding display-only lyric anchors.`);
        }
        const resolvedTargetEvents = targetEvents;
        if (!resolvedTargetEvents) {
          console.error(`ScoreRenderer: could not parse ${selectedTargetVoice} voice events after lyric-anchor preparation; score underlay was omitted in this part view. The full lyric transcript remains available.`);
        } else {
        const eventSignature = (events: typeof resolvedTargetEvents) => events.map(({ event, onset, musicSegment }) => [
          onset,
          event.duration ?? 0,
          !!event.rest,
          (event.pitches ?? []).map((pitch) => [!!pitch.endTie, !!pitch.startTie]),
          musicSegment,
        ]);
        const identicalFragmentBoundaries = [...donorsByTargetSegment].every(([targetSegment, fragments]) =>
          fragments.length === 1 && fragments[0].sourceSegments.length === 1 && fragments[0].sourceSegments[0] === targetSegment,
        );
        const identicalTimeline = donorVoices.size === 1 && identicalFragmentBoundaries && sourceEvents &&
          JSON.stringify(eventSignature(sourceEvents ?? [])) === JSON.stringify(eventSignature(resolvedTargetEvents));
        if (identicalTimeline) {
          // When the engraved parts have exactly the same event timeline and
          // system boundaries, preserve the source w: bytes rather than
          // re-serializing equivalent lyrics (which can alter hyphen spacing).
          for (const [targetSegment, fragments] of donorsByTargetSegment) {
            const donor = fragments[0];
            const rows = donor?.sourceSegments.flatMap((segment) => orphanedLyricsByVoice.get(donor.voice)?.get(segment) ?? []) ?? [];
            if (!selectedLyrics.has(segmentKey(selectedTargetVoice, targetSegment))) transferredLyrics.set(targetSegment, rows);
          }
        } else {
        // Keep rests in the target slot sequence. ABCJS consumes explicit `*`
        // tokens on rests while automatically skipping rests for syllables.
        const targetLyricEvents = resolvedTargetEvents;
        const targetSegmentAtOnset = (onset: number) => eventAtLyricOnset(targetLyricEvents, onset)?.musicSegment;
        const targetHasAuthoritativeLyricsAtOnset = (onset: number) => {
          const segment = targetSegmentAtOnset(onset);
          return segment !== undefined && selectedLyrics.has(segmentKey(selectedTargetVoice, segment));
        };
        // A written tied continuation is a valid engraving slot even though
        // it is not a new sounding attack. ABCJS consumes a syllable there;
        // rejecting it would discard an otherwise exactly timed lyric row.
        const targetIndexAtOnset = (onset: number) => targetLyricEvents.findIndex(({ event, onset: targetOnset }) =>
          !event.rest && Math.abs(targetOnset - onset) < 1e-8,
        );
        const sourceRowsByKey = new Map((reviewedUnderlayModel ?? extractUnderlayModel(abc)).rows
          .map((row) => [`${row.voiceId}\0${row.sourceLineIndex}`, row] as const));
        const sourceRows: { targetSegment: number; targetStart: number; targetEnd: number; musicSegment: number; sourceVoice: string; sourceText: string; stanzaNumber: number | string }[] = [];
        let precedingStanzaNumbers: (number | string)[] = [];
        for (const [targetSegment, fragments] of [...donorsByTargetSegment.entries()].sort(([left], [right]) => left - right)) {
          for (const donor of fragments) for (const segment of donor.sourceSegments) {
            const sourceVoice = donor.voice;
            const rows = orphanedLyricsByVoice.get(sourceVoice)?.get(segment) ?? [];
            const lineIndexes = orphanedLyricLineIndexesByVoice.get(sourceVoice)?.get(segment) ?? [];
            const repeatStanzas = lineIndexes.map((lineIndex) => repeatRowKeyByLineIndex.get(lineIndex));
            const allRepeatRowsMapped = repeatStanzas.length === rows.length && repeatStanzas.every((key) => key !== undefined);
            const parsedStanzas = !presentation.underlayIdentity && allRepeatRowsMapped
              ? repeatStanzas
              : lineIndexes.map((lineIndex) => {
                const row = sourceRowsByKey.get(`${sourceVoice}\0${lineIndex}`);
                // Source-reviewed chorus lanes can carry distinct fragments
                // or echoes; shared verse membership does not merge lanes.
                return row?.role === 'chorus' ? (row.chorusRow === undefined ? 'chorus' : `chorus:${row.chorusRow}`) : row?.repeatPass !== undefined
                  ? `${row.stanzaNumber}:${row.repeatPass}` : row?.stanzaNumber;
              });
            const allRowsParsed = parsedStanzas.length === rows.length && parsedStanzas.every((number) => number !== undefined);
            let stanzaNumbers: (number | string)[];
            if (allRowsParsed) {
              stanzaNumbers = parsedStanzas as (number | string)[];
              precedingStanzaNumbers = stanzaNumbers;
            } else if (presentation.underlayIdentity) {
              // A reviewed source cannot fall back to inherited/ordinal rows,
              // even if a later donor fragment violates the validated shape.
              console.error(`ScoreRenderer: reviewed lyric identity is incomplete for ${sourceVoice} in music segment ${segment}; source underlay was not transferred.`);
              continue;
            } else if (precedingStanzaNumbers.length === rows.length) {
              stanzaNumbers = precedingStanzaNumbers;
            } else if (!precedingStanzaNumbers.length) {
              stanzaNumbers = rows.map((_, index) => index + 1);
              precedingStanzaNumbers = stanzaNumbers;
            } else {
              stanzaNumbers = lineIndexes.map((lineIndex) => -lineIndex - 1);
              console.error(`ScoreRenderer: cannot determine stanza identity for unnumbered ${sourceVoice} rows in music segment ${segment}; preserving their lyric text as separate unresolved rows.`);
            }
            rows.forEach((row, index) => sourceRows.push({
              targetSegment,
              targetStart: donor.start,
              targetEnd: donor.end,
              musicSegment: segment,
              sourceVoice,
              sourceText: row.replace(/^\s*w:\s*/, ''),
              stanzaNumber: stanzaNumbers[index],
            }));
          }
        }
        const assignmentsByStanza = new Map<number | string, { index: number; syllable: string; divider: ' ' | '-' | '_'; token: string }[]>();

        // Parse each source row independently. ABCJS compresses each note's
        // lyric array to the rows present on that line, so a multi-row parse
        // cannot reliably recover which original w: row supplied a syllable.
        // extractUnderlayModel also gives continuation rows their stanza number,
        // allowing source lines to be merged when the target wraps differently.
        for (const sourceRow of sourceRows) {
          if (sourceRow.musicSegment < 0) continue;
          const rowEvents = parseVoice(sourceRow.sourceVoice, new Map([[sourceRow.musicSegment, [`w:${sourceRow.sourceText}`]]]));
          if (!rowEvents) {
            console.error(`ScoreRenderer: could not parse a source lyric row for ${sourceRow.sourceVoice}; leaving it out of this part view.`);
            continue;
          }
          const stanzaAssignments: { index: number; syllable: string; divider: ' ' | '-' | '_'; token: string }[] = [];
          let failed = false;
          for (const { event, onset } of rowEvents) {
            const lyric = event.lyric?.[0];
            if (event.rest || !lyric?.syllable || onset < sourceRow.targetStart - 1e-8 || onset >= sourceRow.targetEnd - 1e-8 ||
              targetSegmentAtOnset(onset) !== sourceRow.targetSegment) continue;
            if (targetHasAuthoritativeLyricsAtOnset(onset)) continue;
            const targetIndex = targetIndexAtOnset(onset);
            if (targetIndex < 0) {
              console.error(`ScoreRenderer: lyric onset ${onset} from ${sourceRow.sourceVoice} has no exact lyric slot in ${selectedTargetVoice}; leaving stanza ${sourceRow.stanzaNumber} out of the part view instead of shifting it.`);
              failed = true;
              break;
            }
            const syllable = lyric.syllable.replace(/\\/g, '\\\\').replace(/[-_*|~]/g, '\\$&').replace(/\u00a0/g, '~');
            const divider = lyric.divider === '-' ? '-' : lyric.divider === '_' ? '_' : '';
            stanzaAssignments.push({ index: targetIndex, syllable, divider: lyric.divider, token: `${syllable}${divider}` });
          }
          if (!failed && stanzaAssignments.length) {
            const assignments = assignmentsByStanza.get(sourceRow.stanzaNumber) ?? [];
            assignments.push(...stanzaAssignments);
            assignmentsByStanza.set(sourceRow.stanzaNumber, assignments);
          }
        }

        // Assign each row's mapped syllables to selected-voice systems. A
        // written tie continuation consumes an explicit `*` slot; an `_`
        // divider itself consumes its following slot, so do not emit a second
        // skip for that event. Do not let an underscore consume a populated
        // next slot or cross a selected-voice line boundary.
        for (const assignments of assignmentsByStanza.values()) {
          const byTargetIndex = new Map(assignments.map((assignment) => [assignment.index, assignment.token]));
          const assignmentAtIndex = new Map(assignments.map((assignment) => [assignment.index, assignment]));
          const firstIndex = Math.min(...byTargetIndex.keys());
          const lastIndex = Math.max(...byTargetIndex.keys());
          const firstSegment = targetLyricEvents[firstIndex]?.musicSegment;
          const lastSegment = targetLyricEvents[lastIndex]?.musicSegment;
          if (firstSegment === undefined || lastSegment === undefined) continue;
          for (const segment of [...new Set(targetLyricEvents.map((event) => event.musicSegment))].filter((value) => value >= firstSegment && value <= lastSegment)) {
            const segmentEvents = targetLyricEvents.filter((event) => event.musicSegment === segment);
            const tokens: string[] = [];
            let implicitSkipIndex: number | undefined;
            segmentEvents.forEach((event) => {
              const index = targetLyricEvents.indexOf(event);
              if (index === implicitSkipIndex) {
                implicitSkipIndex = undefined;
                return;
              }
              const assignment = assignmentAtIndex.get(index);
              const next = targetLyricEvents[index + 1];
              const nextIsSameLine = next?.musicSegment === segment;
              const nextHasSyllable = byTargetIndex.has(index + 1);
              const consumesFollowingSlot = assignment?.divider === '_' && nextIsSameLine && !nextHasSyllable;
              const token = assignment
                ? `${assignment.syllable}${assignment.divider === '_' && nextHasSyllable && nextIsSameLine ? '' : assignment.divider === ' ' ? '' : assignment.divider}`
                : '*';
              tokens.push(token);
              if (consumesFollowingSlot) implicitSkipIndex = index + 1;
            });
            if (tokens.length) {
              const rows = transferredLyrics.get(segment) ?? [];
              rows.push(`w:${tokens.join(' ')}`);
              transferredLyrics.set(segment, rows);
            }
          }
        }
        }
        }
      }
    }
  }

  const rendered: string[] = [];
  for (const entry of output) {
    rendered.push(entry.line);
    if (!entry.voice || entry.voice !== selectedTargetVoice || entry.musicSegment === undefined) continue;
    const key = segmentKey(entry.voice, entry.musicSegment);
    if (selectedLyrics.has(key)) continue;
    rendered.push(...(transferredLyrics.get(entry.musicSegment) ?? []));
  }
  return rendered.join('\n');
}

/** Keep presentation-only carrier suppression out of canonical/playback ABC. */
export function selectEngravedScoreVoices(
  abc: string,
  visibleVoiceIndexes: readonly number[],
  repeatRows?: { model: RepeatUnderlay; stanzaNumbers?: readonly number[] },
  presentation: {
    carrier?: CarrierWitness;
    underlayIdentity?: UnderlayIdentityWitness;
    reviewedUnderlay?: ReviewedUnderlay;
    duplicateCarriers?: ReportedDuplicateCarriers;
    carrier31?: Psalter31CarrierWitness;
    carrier99?: boolean;
    carrier142?: boolean;
    carrier226?: Psalter226CarrierSource;
    sharedFermatas?: boolean;
    mixedFermata366?: boolean;
    sharedFermata411?: boolean;
    reviewedFermatas?: ReviewedFermataSource;
  } = {},
) {
  const ids = [...new Set(abc.split(/\r?\n/).flatMap((line) => {
    const match = /^V:[ \t]*([^\s]+)/.exec(line);
    return match ? [match[1]] : [];
  }))];
  const visibleIds = visibleVoiceIndexes.map((index) => ids[index]).filter(Boolean);
  const chorusAbc = presentReviewedChorus(abc, visibleIds, presentation.reviewedUnderlay);
  const sharedCarrierAbc = presentPsalter99Carrier(chorusAbc, visibleIds, presentation.carrier99 ?? false);
  const selected = selectScoreVoices(sharedCarrierAbc, visibleVoiceIndexes, repeatRows, {
    lyricRecipientPriority: presentation.carrier142 ? psalter142RecipientPriority : undefined,
    // 226 carries only reviewed harmony words; its other lanes include organ.
    transferLyrics: !presentation.carrier226,
    underlayIdentity: presentation.underlayIdentity,
  });
  const carrierAbc = presentPsalter31Carrier(
    presentCombinedCarrier(presentReportedDuplicateCarriers(selected, presentation.duplicateCarriers), visibleIds, presentation.carrier, extractUnderlayModel),
    visibleIds, presentation.carrier31, extractUnderlayModel,
  );
  return presentReviewedFermatas(presentPsalter411Fermatas(
    presentPsalter366Fermata(
      presentSharedFermatas(carrierAbc, presentation.sharedFermatas ?? false),
      presentation.mixedFermata366 ?? false,
    ),
    presentation.sharedFermata411 ?? false,
  ), presentation.reviewedFermatas);
}

// Preserve Error identity and one consistent fallback across preparation paths.
function scorePreparationError(error: unknown) {
  return error instanceof Error ? error : new Error('Unable to prepare this score.');
}

/** Direct renderer callers cannot bypass the known-edition loading boundary. */
export function ScoreRenderer(props: ScoreRendererProps) {
  const ready = isSourceTimingReady(props.songId, props.sourceTimingContext);
  useEffect(() => {
    if (ready) return;
    props.onRendered(undefined);
    props.onScreenAbc?.(undefined);
    props.onScreenFit?.(undefined);
    props.onPrintReady?.('This score could not be loaded.');
  }, [ready, props.onRendered, props.onScreenAbc, props.onScreenFit, props.onPrintReady]);
  return ready ? <ReadyScoreRenderer {...props} />
    : <p className="notice error" role="alert">This score could not be loaded.</p>;
}

function ReadyScoreRenderer({ abc, songId, sourceTimingContext, accessibleLabel, scale, transpose, learnerAccidentals = false, stanzasPerGroup = 5, printStanzaNumbers, showOriginalLyrics, visibleVoiceIndexes, repeatUnderlay, onRendered, onScreenAbc, onScreenFit, onNoteClick, onPrintReady, registerVisible }: ScoreRendererProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const printHostRef = useRef<HTMLDivElement>(null);
  const onPrintReadyRef = useRef(onPrintReady);
  onPrintReadyRef.current = onPrintReady;
  const onNoteClickRef = useRef(onNoteClick);
  const onScreenFitRef = useRef(onScreenFit);
  onScreenFitRef.current = onScreenFit;
  useEffect(() => () => { onScreenFitRef.current?.(undefined); }, []);
  const fullTuneRef = useRef<{ key: string; tune: abcjs.TuneObject } | null>(null);
  const [width, setWidth] = useState(900);
  const [renderError, setRenderError] = useState<string | undefined>();
  const visibleKey = visibleVoiceIndexes.join(',');
  // Only this arrangement requests the optional repair. Import failure retains
  // the ordinary renderer, and a newer song/unmount retires the pending load.
  const [psalter433Opening, setPsalter433Opening] = useState<typeof import('./lordsPrayerOpeningWrap')>();
  useEffect(() => {
    if (songId !== 'psalter433' || psalter433Opening) return;
    let active = true;
    void import('./lordsPrayerOpeningWrap').then(module => {
      if (active) setPsalter433Opening(module);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [songId, psalter433Opening]);
  const beatOpening = ([ALL_CREATURES_OPENING_ID, HIDETH_OPENING_ID, GOD_LEADS_OPENING_ID, MIGHTY_FORTRESS_OPENING_ID, SAVIORS_LOVE_OPENING_ID, PSALTER39_OPENING_ID, PSALTER46_LYRIC_ID, OH_HOW_OPENING_ID, HE_LEADETH_OPENING_ID, CHURCH_OPENING_ID, THOUSAND_OPENING_ID, PSALTER_BEAT_ID] as readonly (string | undefined)[]).includes(songId);
  const rollInterior = hasRollGroupingSource(songId, abc) && visibleKey === '0,1,2,3' && transpose === 0 && !learnerAccidentals && stanzasPerGroup === 1 && scale === 1;
  const oLoveInterior = hasOLoveOpeningSource(songId, abc) && visibleKey === '0,1,2,3' && transpose === 0 && !learnerAccidentals && stanzasPerGroup === 4 && scale === 1;
  const heKeepsDefault = hasHeKeepsSizeSource(songId, abc) && visibleKey === '0,1,2,3' && transpose === 0 && !learnerAccidentals && stanzasPerGroup === 5 && scale === 1;
  const ordinaryOwner = !beatOpening && !oLoveInterior && !heKeepsDefault;
  const oLoveSession = useMemo(newOLoveSession, [abc, songId, transpose, learnerAccidentals, visibleKey, stanzasPerGroup, scale, showOriginalLyrics]);
  useEffect(() => () => disposeOLoveSession(oLoveSession), [oLoveSession]);
  const coalesceScoreResize = beatOpening || rollInterior || oLoveInterior || heKeepsDefault;
  const settleScoreResize = useMemo(() => hasMightyFortressOpeningSource(songId, abc) || heKeepsDefault, [songId, abc, heKeepsDefault]);
  const rollSession = useMemo(newRollInteriorSession, [abc, songId, transpose, learnerAccidentals, visibleKey, stanzasPerGroup, scale, showOriginalLyrics]);
  useEffect(() => () => disposeRollInteriorSession(rollSession), [rollSession]);
  const beatSession = useMemo(newOpeningBeatSession, [abc, songId, transpose, learnerAccidentals, visibleKey, stanzasPerGroup, showOriginalLyrics]);
  const beatGeneration = useRef(0);
  const [beatMetricsRevision, setBeatMetricsRevision] = useState(0);
  const lyricProjection = useMemo(() => showOriginalLyrics === undefined ? undefined
    : projectHymnLyrics(songId, abc, showOriginalLyrics), [songId, abc, showOriginalLyrics]);
  const lyricFiltered = !!lyricProjection && lyricProjection.status !== 'original';
  const musicOnly = stanzasPerGroup === 0 || (lyricFiltered && lyricProjection.allowedStanzaNumbers.length === 0);
  // Bind the original edition before any part, stanza, or display transform.
  const ohHowPickupSource = useMemo(() => hasOhHowPickupSource(songId, abc), [songId, abc]);
  const hymnAboveResponse = hasHymnAboveResponseSource(songId, abc);
  const hymnBelowResponse = hasHymnBelowResponseSource(songId, abc);
  const lyricExtenders = hasDoesJesusLyricExtenderSource(songId, abc);
  const hymnSlurClearance = useMemo(() => getHymnSlurClearance(songId, abc), [songId, abc]);
  const completeInTheeWidth = (hasCompleteInTheeWidthSource(songId, abc) ||
    (hasOLoveWidthSource(songId, abc) && stanzasPerGroup >= 4) ||
    (hasWhateerWidthSource(songId, abc) && stanzasPerGroup >= 5) ||
    (hasSoftlyWidthSource(songId, abc) && stanzasPerGroup === 1 && scale >= 0.95 && scale <= 1.75) ||
    (hasOldRuggedCrossWidthSource(songId, abc) && stanzasPerGroup === 1 && scale >= 0.95 && scale <= 1.25)) && !musicOnly && !learnerAccidentals &&
    transpose === 0 && visibleKey === '0,1,2,3';
  const combinedCarrier = hasCarrierWitness(songId ?? '', abc, psalter26UnderlayCarrier) ? psalter26UnderlayCarrier : undefined;
  const carrier31 = hasPsalter31CarrierSource(songId ?? '', abc, psalter31UnderlayCarrier) ? psalter31UnderlayCarrier : undefined;
  const carrier99 = hasPsalter99CarrierSource(songId ?? '', abc);
  const carrier142 = hasPsalter142CarrierSource(songId ?? '', abc);
  const timingCarrier = sourceBoundTimingId(songId ?? '', abc, sourceTimingContext);
  const dottedRests81 = hasPsalter81DottedRestSource(songId ?? '', abc);
  const sourceHeads = sourceHeadWitness(songId ?? '', abc);
  const sourceLayers = sourceLayerWitness(songId ?? '', abc);
  const sharedRests133 = hasPsalter133SharedRestSource(songId ?? '', abc);
  const sharedQuarterRests = sharedQuarterRestSource(songId ?? '', abc);
  const preparation143 = useMemo(() => {
    try { return { display: preparePsalter143Display(songId ?? '', abc, transpose) }; }
    catch (error) { return { error: scorePreparationError(error) }; }
  }, [abc, songId, transpose]);
  const preparation226 = useMemo(() => {
    try { return { display: preparePsalter226Display(songId ?? '', abc, transpose) }; }
    catch (error) { return { error: scorePreparationError(error) }; }
  }, [abc, songId, transpose]);
  const keySignatures143 = preparation143.display;
  const keySignatures226 = preparation226.display;
  const editorialUnderlay = useMemo(() => getEditorialStanzaUnderlay(songId, abc), [songId, abc]);
  const publishedVariant = useMemo(() => getPublishedStanzaVariant(songId, abc), [songId, abc]);
  const renderingAbc = withHymnVocalPlacement(
    withInheritedHymnClefs(keySignatures143?.abc ?? keySignatures226?.abc ?? editorialUnderlay?.abc ?? publishedVariant?.abc ?? abc, songId), songId,
  );
  const engravingTranspose = keySignatures143 || keySignatures226 ? 0 : transpose;
  const sourceReviewedUnderlay = useMemo(() => lyricFiltered ? undefined : getReviewedUnderlay(songId, abc), [songId, abc, lyricFiltered]);
  const reviewedUnderlay = qualifyAllCreaturesUnderlayParts(songId, sourceReviewedUnderlay, visibleVoiceIndexes);
  const duplicateCarriers = useMemo(() => getReportedDuplicateCarriers(songId, abc), [songId, abc]);
  const underlayIdentity = lyricFiltered ? lyricProjection.identity : reviewedUnderlay?.identity;
  // Identity-only witnesses qualify rows on the pristine source, while the
  // engraving copy still needs its inherited clefs and local vocal placement.
  const underlayAbc = lyricFiltered
    ? withHymnVocalPlacement(withInheritedHymnClefs(lyricProjection.projectedABC, songId), songId)
    : reviewedUnderlay?.lineSegmentation
    ? withHymnVocalPlacement(withInheritedHymnClefs(reviewedUnderlay.abc, songId), songId)
    : reviewedUnderlay?.identityOnly ? renderingAbc
    : reviewedUnderlay?.abc ?? withPsalter99StanzaIdentities(songId ?? '', renderingAbc);
  const carrier226 = useMemo(() => bindPsalter226CarrierSource(
    songId ?? '', abc, notationAbc(renderingAbc, songId),
  ), [songId, abc, renderingAbc]);
  const sharedFermatas = hasSharedFermataSource(songId ?? '', abc);
  const mixedFermata366 = hasPsalter366FermataSource(songId ?? '', abc);
  const sharedFermata411 = hasPsalter411FermataSource(songId ?? '', abc);
  const reviewedFermatas = getReviewedFermataSource(songId ?? '', abc);
  // Preview mapping intentionally declines source-role and display-key presentations.
  // Exact identity-only lyric classification leaves the existing note/timing
  // projection checks authoritative; it does not introduce a new layout veto.
  // These native-part carriers only relocate reviewed lyrics; all original
  // events survive. #3 still has the separate source-head tracking veto below.
  // Keep the existing written-projection and rendered-head checks authoritative.
  const timingTrackingSupported = !timingCarrier || ['psalter3', 'psalter8', 'psalter17b', 'psalter23b', 'psalter43', 'psalter55', 'psalter56', 'hymn-aperio-wayfaring-stranger'].includes(timingCarrier);
  const trackingSupported = !combinedCarrier && !carrier31 && !carrier99 && !carrier142 && timingTrackingSupported && !sourceHeads && !sourceLayers && !carrier226 && !sharedRests133 && !sharedQuarterRests && !keySignatures143 && !keySignatures226 && (!reviewedUnderlay || reviewedUnderlay.identityOnly === true) && !repeatUnderlay && !dottedRests81;
  const repeatActive = !!repeatUnderlay && hasRepeatUnderlaySource(abc, repeatUnderlay);
  const repeatGroups: UnderlaidAbcGroup[] = repeatActive && repeatUnderlay && repeatUnderlay.stanzaNumbers.length > stanzasPerGroup && stanzasPerGroup > 0
    ? Array.from({ length: Math.ceil(repeatUnderlay.stanzaNumbers.length / stanzasPerGroup) }, (_, index) => {
      const stanzaNumbers = repeatUnderlay.stanzaNumbers.slice(index * stanzasPerGroup, (index + 1) * stanzasPerGroup);
      return { firstStanza: stanzaNumbers[0], lastStanza: stanzaNumbers.at(-1)!, stanzaNumbers: [...stanzaNumbers], abc: withRepeatUnderlay(abc, repeatUnderlay, stanzaNumbers) };
    })
    : [];
  const underlaidGroups = lyricFiltered && !lyricProjection.underlaySelectionSupported ? []
    : repeatGroups.length ? repeatGroups : splitUnderlaidStanzas(underlayAbc, stanzasPerGroup, underlayIdentity);
  const groupedUnderlaid = underlaidGroups.length > 0;
  const grouped = !preparation143.error && !preparation226.error && groupedUnderlaid;
  // Pass actual UI state, even though openingSource separately proves these
  // settings eligible. Never label an enabled option false to admit reflow.
  const groupRepeatUnderlay = !!repeatUnderlay, groupReviewedUnderlay = !!reviewedUnderlay;
  const groupOpeningSettings = useMemo<HymnOpeningSettings>(() => ({
    requestedScale: scale, scoreWidth: width, transpose: engravingTranspose,
    learnerAccidentals, visibleKey, stanzasPerGroup, grouped, musicOnly,
    repeatUnderlay: groupRepeatUnderlay, reviewedUnderlay: groupReviewedUnderlay,
  }), [scale, width, engravingTranspose, learnerAccidentals, visibleKey,
    stanzasPerGroup, grouped, musicOnly, groupRepeatUnderlay, groupReviewedUnderlay]);
  // This edition's ambiguous-underlay fallback keeps every source row.
  // ScoreViewer clamps every positive verse preference to this effective 1.
  const ohHowPickup = ohHowPickupSource && !musicOnly && !learnerAccidentals && transpose === 0 &&
    visibleKey === '0,1,2,3' && stanzasPerGroup === 1 && !repeatUnderlay && !reviewedUnderlay && !grouped;
  // Day's source has legitimate short partial bars. This conservative pilot
  // keeps all three source stanzas and supplemental voices, and only joins
  // separately measured adjacent short systems near the default screen size.
  const dayByDayWrap = hasDayByDayWrapSource(songId, abc) && !musicOnly && !learnerAccidentals &&
    transpose === 0 && visibleKey === '0,1,2,3' && stanzasPerGroup === 3 && !grouped &&
    !repeatUnderlay && !reviewedUnderlay && scale >= 0.95 && scale <= 1.05;
  // Screen engraving and ABC export consume these exact same prepared inputs.
  // Print-only verse selection deliberately does not enter this snapshot.
  const screenPreparation = useMemo(() => {
    try {
      if (preparation143.error) throw preparation143.error;
      if (preparation226.error) throw preparation226.error;
      const prepare = (source: string, stanzaNumbers?: readonly number[], useReviewedUnderlay = true) => {
        const timingAbc = presentPsalter226Carrier(
          withSourceLayerHeads(withSourceHeads(presentSourceBoundTimingCarrier(notationAbc(source, songId), visibleVoiceIndexes, timingCarrier, sourceTimingContext), sourceHeads), sourceLayers), visibleVoiceIndexes, carrier226,
        );
        return withSelectedSourceLayers(selectEngravedScoreVoices(
          learnerAccidentals ? addLearnerAccidentals(timingAbc) : timingAbc,
          visibleVoiceIndexes,
          repeatActive && repeatUnderlay ? { model: repeatUnderlay, stanzaNumbers } : undefined,
          { carrier: combinedCarrier, underlayIdentity: useReviewedUnderlay ? underlayIdentity : undefined,
            reviewedUnderlay: useReviewedUnderlay ? reviewedUnderlay : undefined,
            duplicateCarriers, carrier31, carrier99, carrier142, carrier226, sharedFermatas, mixedFermata366, sharedFermata411, reviewedFermatas },
        ), sourceLayers, learnerAccidentals);
      };
      // The source split is needed only to separate verses. Keep the original
      // screen line/lyric transfer path when every verse remains together,
      // including music-only views; print selection still uses the witness.
      const unsplitScreen = reviewedUnderlay?.lineSegmentation && !grouped;
      const singleAbc = prepare(repeatActive && repeatUnderlay ? withRepeatUnderlay(notationAbc(renderingAbc, songId), repeatUnderlay)
        : unsplitScreen ? renderingAbc : underlayAbc, undefined, !unsplitScreen);
      const groups = underlaidGroups.map(group => ({ ...group, abc: prepare(group.abc, group.stanzaNumbers) }));
      const prepared: PreparedScreenAbc = {
        sourceAbc: abc, songId, transpose, learnerAccidentals, stanzasPerGroup,
        ...(editorialUnderlay ? { editorialUnderlay: editorialUnderlay.info } : {}),
        ...(publishedVariant ? { publishedVariant: publishedVariant.info, lyricSourceAbc: publishedVariant.abc } : {}),
        ...(lyricProjection ? { showOriginalLyrics, lyricSourceAbc: lyricProjection.projectedABC,
          hiddenStanzaNumbers: lyricFiltered ? lyricProjection.hiddenStanzaNumbers : [] } : {}),
        referenceAbc: selectScoreVoices(renderingAbc, visibleVoiceIndexes, undefined, { transferLyrics: false }),
        visibleVoiceIndexes: [...visibleVoiceIndexes], engravingTranspose, musicOnly,
        ...(sourceHeads || sourceLayers ? { unsupportedReason: 'This score uses special cue-note or source-layer roles that cannot yet be preserved in a portable ABC file. No file was downloaded.' } : {}),
        groups: grouped ? groups : [{ abc: singleAbc, stanzaNumbers: [] }],
      };
      return { singleAbc, groups, prepared };
    } catch (error) {
      return { error: scorePreparationError(error) };
    }
    // All source witnesses and underlay groups above derive from these inputs.
  }, [abc, songId, transpose, learnerAccidentals, stanzasPerGroup, visibleKey, repeatUnderlay, showOriginalLyrics, lyricProjection]);
  useEffect(() => { onScreenAbc?.(screenPreparation.prepared); }, [onScreenAbc, screenPreparation]);
  const printStanzaKey = printStanzaNumbers?.join(',') ?? '';
  onNoteClickRef.current = onNoteClick;

  useEffect(() => {
    const host = measureRef.current;
    if (!host) return;
    let active = true, queued: number | undefined, latestWidth = width, dpr = window.devicePixelRatio;
    let invalidateMetrics = false;
    const commitLatestWidth = () => {
      queued = undefined;
      if (!active) return;
      setWidth(latestWidth);
      if (invalidateMetrics) { invalidateMetrics = false; setBeatMetricsRevision(value => value + 1); }
    };
    const schedule = (next: number, invalidate = false) => {
      if (!active) return;
      const effectiveWidth = Math.max(320, next);
      if (!coalesceScoreResize) { setWidth(effectiveWidth); return; }
      if (effectiveWidth === latestWidth && !invalidate) return;
      latestWidth = effectiveWidth;
      invalidateMetrics ||= invalidate;
      beatGeneration.current++;
      if (queued !== undefined) {
        if (!settleScoreResize) return;
        window.clearTimeout(queued);
      }
      // These exact editions can require multiple complete engraving passes.
      // One shared slot holds the latest-width job after a 100 ms quiet period.
      queued = settleScoreResize ? window.setTimeout(commitLatestWidth, 100)
        : requestAnimationFrame(commitLatestWidth);
    };
    const observer = new ResizeObserver(([entry]) => schedule(entry.contentRect.width));
    const fonts = () => schedule(host.getBoundingClientRect().width, true);
    const zoom = () => { if (dpr !== window.devicePixelRatio) { dpr = window.devicePixelRatio; fonts(); } };
    observer.observe(host);
    if (coalesceScoreResize) {
      document.fonts.addEventListener('loadingdone', fonts);
      window.addEventListener('resize', zoom);
      if (document.fonts.status === 'loading') void document.fonts.ready.then(() => { if (active) fonts(); });
    }
    return () => {
      active = false; observer.disconnect(); beatGeneration.current++;
      if (queued !== undefined) {
        if (settleScoreResize) window.clearTimeout(queued);
        else cancelAnimationFrame(queued);
      }
      document.fonts.removeEventListener('loadingdone', fonts); window.removeEventListener('resize', zoom);
    };
    // Scope scheduling to the admitted profiles and cancel queued generations whenever
    // its source/parts/scale/underlay configuration changes or unmounts.
  }, [coalesceScoreResize, settleScoreResize, coalesceScoreResize ? beatSession : null, oLoveInterior ? oLoveSession : null, coalesceScoreResize ? scale : null]);

  useEffect(() => {
    const host = hostRef.current;
    const probeHost = measureRef.current;
    const generation = beatGeneration.current;
    let currentRenderedTune: abcjs.TuneObject | undefined;
    let beatFrame: BeatFrame | undefined;
    let ordinaryFrameSealed = false;
    releaseOLoveFrame(oLoveSession);
    clearOLoveReflow(host);
    clearHeKeepsDefaultWrap(host);
    clearOpeningBeatReflow(probeHost);
    const probeSettings = { requestedScale: scale, scoreWidth: width, transpose, learnerAccidentals, visibleKey,
      stanzasPerGroup, grouped, musicOnly, repeatUnderlay: !!repeatUnderlay, reviewedUnderlay: !!reviewedUnderlay };
    clearSizeOpeningWraps(probeHost);
    // Clear stale source-bound reflow evidence for unsupported/grouped states too.
    observeSaviorWidthProbe(probeHost, null, abc, undefined, songId, undefined, undefined, probeSettings);
    for (const report of [
      reportNearPickupSettings, reportHymnOpeningSettings, reportOLoveOpeningSettings,
      reportHidethOpeningSettings, reportFaithOpeningSettings, reportSaviorsLoveOpeningSettings,
      reportMelitaOpeningSettings, reportCoronationOpeningSettings, reportMightyFortressOpeningSettings,
      reportOnlyTrustOpeningSettings, reportHeLeadethOpeningSettings, reportSweetHourOpeningSettings,
      reportGodLeadsOpeningSettings, reportItIsWellOpeningSettings, reportSandsOpeningSettings,
      reportOhHowOpeningSettings,
    ]) report(probeHost, songId, probeSettings);
    // Only this synchronous screen render can publish a current limit. The
    // requested preference and independent print render are never changed.
    onScreenFitRef.current?.(undefined);
    if (!host && !grouped) return;
    setRenderError(undefined);
    if (host) clearPsalterGroupedOpeningWrap(host);
    clearSoftlyMusicOnlyWrap(host);
    host?.replaceChildren();
    try {
      if (preparation143.error) throw preparation143.error;
      if (preparation226.error) throw preparation226.error;
      // The app heading already presents these fields. Omitting their duplicate
      // engraving also prevents long source credits from colliding on phones.
      const cleanNotationAbc = notationAbc(renderingAbc, songId);
      const fullNotationAbc = learnerAccidentals ? addLearnerAccidentals(cleanNotationAbc) : cleanNotationAbc;
      const fullTuneKey = `${fullNotationAbc}\0${transpose}${keySignatures143 || keySignatures226 ? `\0${scale}\0${width}` : ''}`;
      if (screenPreparation.error) throw screenPreparation.error;
      const notationOnlyAbc = screenPreparation.singleAbc;
      if (!notationOnlyAbc) {
        onRendered(fullTuneRef.current?.key === fullTuneKey ? fullTuneRef.current.tune : undefined);
        return;
      }
      if (grouped) {
        if (fullTuneRef.current?.key !== fullTuneKey) {
          if (keySignatures143 || keySignatures226) fullTuneRef.current = null;
          const detached = document.createElement('div');
          const full = abcjs.renderAbc(detached, fullNotationAbc, {
            accentAbove: true,
            add_classes: true,
            ...SCORE_SVG_OPTIONS,
            staffwidth: width / scale,
            visualTranspose: engravingTranspose,
            viewportHorizontal: false,
            wrap: { minSpacing: 1.5, maxSpacing: 2.7, preferredMeasuresPerLine: 0 },
          });
          if (full[0]) fullTuneRef.current = { key: fullTuneKey, tune: full[0] };
        }
        onRendered(fullTuneRef.current?.key === fullTuneKey ? fullTuneRef.current.tune : undefined);
        return;
      }
      const renderOptions = {
        ...(registerVisible ? { selectionColor: 'currentColor', dragColor: 'currentColor' } : {}),
        accentAbove: true,
        add_classes: true,
        clickListener: (element: abcjs.AbcElem) => {
          if (element.el_type !== 'note' || element.startChar === undefined || element.startChar < 0) return;
          const tune = currentRenderedTune;
          if (tune) onNoteClickRef.current?.(tune, element.startChar);
        },
        ...SCORE_SVG_OPTIONS,
        staffwidth: width / scale,
        visualTranspose: engravingTranspose,
        viewportHorizontal: false,
        // Zero lets abcjs choose line breaks from the available width instead
        // of imposing a fixed number of measures per system.
        wrap: { minSpacing: repeatActive ? 1.6 : 1.5, maxSpacing: repeatActive ? 3.2 : 2.7, preferredMeasuresPerLine: 0 },
      };
      let keysRecognized143 = false;
      let keysRecognized226 = false;
      let screenFit: CompleteInTheeScreenFit | undefined;
      const screenOptions = withDoesJesusLyricExtenders(host!, notationOnlyAbc, {
        ...renderOptions,
        // ABCJS measures wrapping before afterParsing removes engraving lyrics.
        ...(musicOnly ? { format: { vocalfont: '0' } } : {}),
        afterParsing: (tune, _number, source) => {
          presentSharedQuarterRests(
            presentPsalter133SharedRests(tune, source, sharedRests133), source, sharedQuarterRests,
          );
          prepareSourceHeads(tune, source, sourceHeads);
          prepareSourceLayers(tune, source, sourceLayers);
          keysRecognized143 = presentPsalter143KeySignatures(tune, source, keySignatures143);
          keysRecognized226 = presentPsalter226KeySignatures(tune, source, keySignatures226);
          if (keySignatures226 && !keysRecognized226) throw new Error('Unable to validate the Psalter 226 display keys.');
          if (musicOnly) omitEngravedLyrics(tune);
          prepareHymnResponseRows(tune, hymnAboveResponse, hymnBelowResponse);
          reserveHymnSlurClearance(tune, hymnSlurClearance);
          if (beatOpening && !ordinaryFrameSealed) beatFrame = captureOpeningBeatFrame(beatSession, tune, source, notationOnlyAbc, songId);
          if (oLoveInterior && !ordinaryFrameSealed) captureOLoveFrame(oLoveSession, tune, source, notationOnlyAbc);
          return tune;
        },
      }, lyricExtenders);
      let rendered = renderCompleteInTheeScreenScore(host!, notationOnlyAbc, songId, screenOptions,
        completeInTheeWidth, ohHowPickup, fit => { screenFit = fit; });
      // Freeze the last ordinary parse frame before any display-candidate
      // adapter can invoke this shared callback with provisional boundaries.
      ordinaryFrameSealed = true;
      rendered = reflowSoftlyMusicOnlyScreenScore(host!, abc, notationOnlyAbc, songId, screenOptions, rendered,
        { ...probeSettings, defaultLyricPolicy: lyricProjection?.status === 'filtered' && lyricProjection.sourceSupported });
      rendered = reflowDayByDayScreenScore(host!, notationOnlyAbc, songId, screenOptions, rendered, dayByDayWrap);
      rendered = reflowDayByDayEndingScreenScore(host!, notationOnlyAbc, songId, screenOptions, rendered, dayByDayWrap);
      rendered = reflowOLoveOpeningScreenScore(probeHost, host!, abc, notationOnlyAbc, songId, screenOptions, rendered, probeSettings, screenFit);
      restoreHymnResponseRows(rendered[0]);
      rendered = reflowFaithOpeningScreenScore(probeHost, host!, abc, notationOnlyAbc, songId, screenOptions, rendered, probeSettings);
      preserveBlankLyricRows(host!);
      presentPsalter81DottedRests(rendered[0], notationOnlyAbc, dottedRests81);
      presentSourceHeads(rendered[0], sourceHeads);
      presentSourceLayers(rendered[0], sourceLayers);
      if (notationOnlyAbc.includes('[K:') && !keysRecognized143 && !keysRecognized226) removeInlineKeySignatureArtifacts(host!);
      containScreenSvgSystems(host!);
      rendered = reflowPsalter46OpeningScreenScore(probeHost, host!, abc, notationOnlyAbc, songId, screenOptions, rendered, probeSettings);
      if (psalter433Opening) rendered = psalter433Opening.reflowPsalter433OpeningScreenScore(probeHost, host!, abc, notationOnlyAbc, songId, screenOptions, rendered, probeSettings);
      const beforeChurchSize = rendered, beforeChurchFrame = beatFrame;
      // This synchronous source-bound repair may accept a new whole-bar
      // partition. Capture its clean parse, but retain that frame only on
      // acceptance. Rejected probes cannot replace the sealed ordinary frame.
      ordinaryFrameSealed = false;
      rendered = refineChurchSizeScreenScore(probeHost, host!, abc, notationOnlyAbc, songId, screenOptions, rendered, probeSettings);
      ordinaryFrameSealed = true;
      if (rendered === beforeChurchSize) beatFrame = beforeChurchFrame;
      // Preserve the existing synchronous order and pass each result to the next adapter.
      for (const reflow of [
        refineTwoHymnSizeScreenScore, reflowSaviorScreenScore, reflowNearScreenScore,
        reflowHymnOpeningScreenScore, reflowHidethOpeningScreenScore, reflowSaviorsLoveOpeningScreenScore,
        reflowMelitaOpeningScreenScore, reflowCoronationOpeningScreenScore, reflowMightyFortressOpeningScreenScore,
        reflowOnlyTrustOpeningScreenScore, reflowHeLeadethOpeningScreenScore, reflowSweetHourOpeningScreenScore,
        reflowGodLeadsOpeningScreenScore, reflowItIsWellOpeningScreenScore, reflowSandsOpeningScreenScore,
        reflowOhHowOpeningScreenScore,
      ]) rendered = reflow(probeHost, host!, abc, notationOnlyAbc, songId, screenOptions, rendered, probeSettings);
      if ((['psalter50', 'psalter28', 'psalter25', 'psalter26'] as readonly (string | undefined)[]).includes(songId)) rendered = reflowPsalterGroupedOpeningScreenScore(host!, abc, notationOnlyAbc, songId, screenOptions, rendered, probeSettings);
      const ordinaryRendered = rendered;
      // All three synchronous transactions use the same latest-frame predicate.
      const currentScreen = () => generation === beatGeneration.current && host === hostRef.current && host!.isConnected &&
          !!probeHost && Math.abs(Math.max(320, probeHost.getBoundingClientRect().width) - width) <= 1 / 32;
      if (heKeepsDefault) rendered = reflowHeKeepsDefault({ host: host!, source: abc, prepared: notationOnlyAbc,
        songId, options: screenOptions, original: ordinaryRendered, settings: probeSettings,
        current: currentScreen });
      if (oLoveInterior) {
        rendered = reflowOLove({ host: host!, canonical: abc, prepared: notationOnlyAbc, options: screenOptions,
          original: ordinaryRendered, fit: screenFit, session: oLoveSession, settings: probeSettings,
          current: currentScreen });
        // The stronger accepted candidate fits the requested size. Do not feed
        // the old indivisible-bar ceiling back into the Size preference UI.
        if (rendered !== ordinaryRendered) screenFit = undefined;
      }
      let restSelectionView: abcjs.TuneObject | undefined;
      if (beatOpening) rendered = reflowOpeningBeats({ diagnosticHost: probeHost, host: host!, source: abc,
        prepared: notationOnlyAbc, options: screenOptions, original: ordinaryRendered, settings: probeSettings,
        frame: beatFrame, song: songId,
        onRestProjection: tune => { restSelectionView = tune; },
        current: currentScreen });
      beatFrame = undefined;
      currentRenderedTune = rendered[0];
      if (screenFit?.accepted && screenFit.limited && host?.isConnected && host === hostRef.current &&
        !host.querySelector('[data-screen-horizontal-overflow="true"]')) {
        onScreenFitRef.current?.({ abc, songId, requestedScale: scale, transpose, learnerAccidentals,
          visibleKey, stanzasPerGroup, width, effectiveScale: width / screenFit.effectiveStaffwidth });
      }
      if (!musicOnly && !lyricExtenders && notationOnlyAbc === fullNotationAbc && rendered[0] && !sharedRests133 && !sharedQuarterRests && !keySignatures143 && !keySignatures226 && !sourceHeads && !sourceLayers) {
        // The fragment is display-only. Resize keeps the same ordinary audio
        // owner and clock; it never sends the fragmented Tune to onRendered.
        if (ordinaryOwner || fullTuneRef.current?.key !== fullTuneKey)
          fullTuneRef.current = { key: fullTuneKey, tune: ordinaryRendered[0] };
      } else if (fullTuneRef.current?.key !== fullTuneKey) {
        if (keySignatures143 || keySignatures226) fullTuneRef.current = null;
        const detached = document.createElement('div');
        const full = abcjs.renderAbc(detached, fullNotationAbc, renderOptions);
        if (full[0]) fullTuneRef.current = { key: fullTuneKey, tune: full[0] };
      }
      onRendered(fullTuneRef.current?.key === fullTuneKey ? fullTuneRef.current.tune : sharedRests133 || sharedQuarterRests || keySignatures143 || keySignatures226 || reviewedFermatas || timingCarrier || sourceHeads || sourceLayers || lyricExtenders ? undefined : ordinaryRendered[0]);
      let unregister = currentRenderedTune && registerVisible?.({ host: host!, tune: restSelectionView ?? currentRenderedTune, source: notationOnlyAbc, copy: 0, supported: trackingSupported });
      if (ordinaryOwner) return unregister;
      return () => {
        // The persistent ordinary owner retains this click listener. Retire
        // its display slot so a later width cannot retain an obsolete candidate.
        currentRenderedTune = undefined;
        beatFrame = undefined;
        releaseOLoveFrame(oLoveSession);
        try { unregister?.(); } finally { unregister = undefined; }
      };
    } catch (error) {
      currentRenderedTune = undefined;
      beatFrame = undefined;
      clearOLoveReflow(host);
      clearHeKeepsDefaultWrap(host);
      clearOpeningBeatReflow(probeHost);
      clearSizeOpeningWraps(probeHost);
      for (const clear of [
        clearSaviorWidthProbe, clearNearPickupWrap, clearHymnOpeningWrap,
        clearOLoveOpeningWrap, clearHidethOpeningWrap, clearFaithOpeningWrap,
        clearSaviorsLoveOpeningWrap, clearMelitaOpeningWrap, clearCoronationOpeningWrap,
        clearMightyFortressOpeningWrap, clearOnlyTrustOpeningWrap, clearHeLeadethOpeningWrap,
        clearSweetHourOpeningWrap, clearGodLeadsOpeningWrap, clearItIsWellOpeningWrap,
        clearSandsOpeningWrap, clearOhHowOpeningWrap,
      ]) clear(probeHost);
      host?.removeAttribute('data-psalter26-terminal-wrap');
      host?.removeAttribute('data-psalter28-opening-wrap');
      host?.removeAttribute('data-psalter50-opening-wrap');
      clearSoftlyMusicOnlyWrap(host);
      host?.replaceChildren();
      onScreenFitRef.current?.(undefined);
      if (keySignatures143 || keySignatures226 || preparation143.error || preparation226.error) fullTuneRef.current = null;
      setRenderError(error instanceof Error ? `Unable to render this score: ${error.message}` : 'Unable to render this score.');
      onRendered(undefined);
    } finally { releaseOLoveFrame(oLoveSession); }
  }, [abc, songId, grouped, musicOnly, lyricProjection, stanzasPerGroup, completeInTheeWidth, dayByDayWrap, ohHowPickup, hymnAboveResponse, hymnBelowResponse, lyricExtenders, hymnSlurClearance, timingCarrier, sourceTimingContext, sourceHeads, sourceLayers, carrier226, sharedRests133, sharedQuarterRests, keySignatures143, keySignatures226, preparation143.error, preparation226.error, renderingAbc, underlayAbc, underlayIdentity, reviewedUnderlay, duplicateCarriers, engravingTranspose, learnerAccidentals, onRendered, repeatActive, repeatUnderlay, scale, transpose, visibleKey, width, registerVisible, trackingSupported, beatOpening, beatSession, beatMetricsRevision, oLoveInterior, oLoveSession, psalter433Opening]);

  useEffect(() => {
    const host = printHostRef.current;
    if (!host) { onPrintReadyRef.current?.('The printable score container is unavailable.'); return; }
    host.replaceChildren();
    // The viewer verifies transcript content for a deliberately part-free entry.
    if (visibleVoiceIndexes.length === 0) { onPrintReadyRef.current?.(); return; }
    const preparationError = preparation143.error ?? preparation226.error;
    if (preparationError) {
      host.textContent = `Unable to render this score for printing: ${preparationError.message}`;
      onPrintReadyRef.current?.(host.textContent);
      return;
    }
    try {
      const reviewedPrintEnding = getReviewedPrintEndingSource(songId, abc);
      const model = extractUnderlayModel(underlayAbc, underlayIdentity);
      // Verse selection controls the transcript only in music-only mode.
      const engravedPrintStanzas = musicOnly ? undefined : printStanzaNumbers;
      // Only a source-reviewed prose/underlay distinction may remove text-only
      // selections from score grouping. The viewer retains the full selection
      // for prose, while these numbers govern note-aligned words and endings.
      const selectedNumbers = engravedPrintStanzas ? new Set(reviewedUnderlay?.textOnlyStanzaNumbers
        ? engravedPrintStanzas.filter(number => model.stanzaNumbers.includes(number))
        : engravedPrintStanzas) : undefined;
      // A complete, ungrouped print needs no source split either. Selected
      // verses and grouped copies continue using the exact shared-refrain rows.
      const unsplitPrint = reviewedUnderlay?.lineSegmentation && !grouped && (!selectedNumbers ||
        (selectedNumbers.size === model.stanzaNumbers.length && model.stanzaNumbers.every(number => selectedNumbers.has(number))));
      const printIdentity = unsplitPrint ? undefined : underlayIdentity;
      const noPrintLyrics = !!lyricProjection && printStanzaNumbers?.length === 0;
      const printAbc = noPrintLyrics ? underlayAbc.replace(/^\s*w:[^\r\n]*(?:\r?\n|$)/gm, '')
        : unsplitPrint ? renderingAbc : selectedNumbers && !model.ambiguous
        ? underlayAbc.split(/\r?\n/).filter((line, index) => !/^\s*w:/.test(line) || model.rows.some((row) => row.sourceLineIndex === index && ((row.role === 'chorus' && selectedNumbers.size > 0) || selectedNumbers.has(row.stanzaNumber)))).join('\n')
        : underlayAbc;
      const cleanPrintAbc = notationAbc(repeatActive && repeatUnderlay ? withRepeatUnderlay(printAbc, repeatUnderlay, engravedPrintStanzas) : printAbc, songId);
      const timingPrintAbc = presentPsalter226Carrier(
        withSourceLayerHeads(withSourceHeads(presentSourceBoundTimingCarrier(cleanPrintAbc, visibleVoiceIndexes, timingCarrier, sourceTimingContext), sourceHeads), sourceLayers), visibleVoiceIndexes, carrier226,
      );
      const selectedAbc = withSelectedSourceLayers(selectEngravedScoreVoices(
        learnerAccidentals ? addLearnerAccidentals(timingPrintAbc) : timingPrintAbc,
        visibleVoiceIndexes,
        repeatActive && repeatUnderlay ? { model: repeatUnderlay, stanzaNumbers: engravedPrintStanzas } : undefined,
        { carrier: combinedCarrier, underlayIdentity: printIdentity, reviewedUnderlay: unsplitPrint ? undefined : reviewedUnderlay,
          duplicateCarriers, carrier31, carrier99, carrier142, carrier226, sharedFermatas, mixedFermata366, sharedFermata411, reviewedFermatas },
      ), sourceLayers, learnerAccidentals);
      if (!selectedAbc) throw new Error('The selected parts have no printable notation.');
      const printGroups = repeatActive && repeatUnderlay && printStanzaNumbers && printStanzaNumbers.length > stanzasPerGroup && stanzasPerGroup > 0
        ? Array.from({ length: Math.ceil(printStanzaNumbers.length / stanzasPerGroup) }, (_, index) => ({
          stanzaNumbers: printStanzaNumbers.slice(index * stanzasPerGroup, (index + 1) * stanzasPerGroup),
          abc: withRepeatUnderlay(printAbc, repeatUnderlay, printStanzaNumbers.slice(index * stanzasPerGroup, (index + 1) * stanzasPerGroup)),
        }))
        : lyricFiltered && !lyricProjection.underlaySelectionSupported ? [] : splitUnderlaidStanzas(printAbc, stanzasPerGroup, printIdentity);
      // Prepare the current song ahead of the print dialog. A phone's measured
      // screen width and zoom must never determine the printed system breaks.
      // Responsive SVGs then scale this desktop engraving to the paper width.
      let keysRecognized143 = false;
      let keysRecognized226 = false;
      const options: abcjs.AbcVisualParams = {
        // Match the screen's lyric-free measurement without changing source ABC.
        ...(musicOnly ? { format: { vocalfont: '0' } } : {}),
        afterParsing: (tune, _number, source) => {
          presentSharedQuarterRests(
            presentPsalter133SharedRests(tune, source, sharedRests133), source, sharedQuarterRests,
          );
          prepareSourceHeads(tune, source, sourceHeads);
          prepareSourceLayers(tune, source, sourceLayers);
          keysRecognized143 = presentPsalter143KeySignatures(tune, source, keySignatures143);
          keysRecognized226 = presentPsalter226KeySignatures(tune, source, keySignatures226);
          if (keySignatures226 && !keysRecognized226) throw new Error('Unable to validate the Psalter 226 display keys.');
          if (musicOnly) omitEngravedLyrics(tune);
          prepareHymnResponseRows(tune, hymnAboveResponse, hymnBelowResponse);
          reserveHymnSlurClearance(tune, hymnSlurClearance);
          return tune;
        },
        accentAbove: true,
        add_classes: true,
        ...SCORE_SVG_OPTIONS,
        staffwidth: 900,
        visualTranspose: engravingTranspose,
        viewportHorizontal: false,
        wrap: { minSpacing: 1.1, maxSpacing: 2.7, preferredMeasuresPerLine: 0 },
      };
      if (printGroups.length) {
        for (const group of printGroups) {
          const part = document.createElement('div');
          part.className = 'print-score-group';
          // ABCJS measures its host while engraving. Attach each group first;
          // rendering a detached node produces SVGs with a zero-height viewBox.
          host.appendChild(part);
          const cleanGroupAbc = notationAbc(group.abc, songId);
          const timingGroupAbc = presentPsalter226Carrier(
            withSourceLayerHeads(withSourceHeads(presentSourceBoundTimingCarrier(cleanGroupAbc, visibleVoiceIndexes, timingCarrier, sourceTimingContext), sourceHeads), sourceLayers), visibleVoiceIndexes, carrier226,
          );
          const groupAbc = withSelectedSourceLayers(selectEngravedScoreVoices(
            learnerAccidentals ? addLearnerAccidentals(timingGroupAbc) : timingGroupAbc,
            visibleVoiceIndexes,
            repeatActive && repeatUnderlay ? { model: repeatUnderlay, stanzaNumbers: group.stanzaNumbers } : undefined,
            { carrier: combinedCarrier, underlayIdentity, reviewedUnderlay, duplicateCarriers, carrier31, carrier99, carrier142, carrier226, sharedFermatas, mixedFermata366, sharedFermata411, reviewedFermatas },
          ), sourceLayers, learnerAccidentals);
          keysRecognized143 = false;
          keysRecognized226 = false;
          const rendered = abcjs.renderAbc(part, groupAbc, withDoesJesusLyricExtenders(part, groupAbc, options, lyricExtenders));
          restoreHymnResponseRows(rendered[0]);
          if (!rendered[0] || !part.querySelector('svg')) throw new Error('A selected verse group could not be engraved.');
          preserveBlankLyricRows(part);
          presentPsalter81DottedRests(rendered[0], groupAbc, dottedRests81);
          presentSourceHeads(rendered[0], sourceHeads);
          presentSourceLayers(rendered[0], sourceLayers);
          if (groupAbc.includes('[K:') && !keysRecognized143 && !keysRecognized226) removeInlineKeySignatureArtifacts(part);
          keepReviewedPrintEndingWithPrevious(part, rendered[0], reviewedPrintEnding);
        }
      } else {
        const rendered = abcjs.renderAbc(host, selectedAbc, withDoesJesusLyricExtenders(host, selectedAbc, options, lyricExtenders));
        restoreHymnResponseRows(rendered[0]);
        preserveBlankLyricRows(host);
        presentPsalter81DottedRests(rendered[0], selectedAbc, dottedRests81);
        presentSourceHeads(rendered[0], sourceHeads);
        presentSourceLayers(rendered[0], sourceLayers);
        if (selectedAbc.includes('[K:') && !keysRecognized143 && !keysRecognized226) removeInlineKeySignatureArtifacts(host);
        keepReviewedPrintEndingWithPrevious(host, rendered[0], reviewedPrintEnding);
      }
      containPrintSvgSystems(host);
      const printSvgs = [...host.querySelectorAll('svg')];
      if (onPrintReadyRef.current && (printSvgs.length === 0 || printSvgs.some(svg => {
        const box = svg.getAttribute('viewBox')?.trim().split(/\s+/).map(Number);
        return !box || box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0;
      }))) throw new Error('The printable score has empty or invalid dimensions.');
      onPrintReadyRef.current?.();
    } catch (error) {
      host.replaceChildren();
      host.textContent = error instanceof Error ? `Unable to render this score for printing: ${error.message}` : 'Unable to render this score for printing.';
      onPrintReadyRef.current?.(host.textContent);
    }
  }, [abc, songId, musicOnly, hymnAboveResponse, hymnBelowResponse, lyricExtenders, hymnSlurClearance, timingCarrier, sourceTimingContext, sourceHeads, sourceLayers, carrier226, sharedRests133, sharedQuarterRests, keySignatures143, keySignatures226, preparation143.error, preparation226.error, underlayAbc, underlayIdentity, reviewedUnderlay, duplicateCarriers, engravingTranspose, learnerAccidentals, printStanzaKey, repeatActive, repeatUnderlay, stanzasPerGroup, transpose, visibleKey, lyricProjection, lyricFiltered]);

  return (
    <>
      <div className={grouped ? 'score-verse-groups' : undefined} ref={measureRef}>
      {grouped ? (
        <div key="grouped-score">
          {visibleVoiceIndexes.length > 0 && screenPreparation.groups?.map((group, index) => {
            const first = group.firstStanza || index + 1;
            const last = group.lastStanza || first;
            try {
              const groupAbc = group.abc;
              return <section className="score-verse-group" key={`${first}-${index}`} aria-label={`Tune and stanzas ${first} through ${last}`}>
                <ScoreGroupCanvas
                  abc={groupAbc}
                  songId={songId}
                  rollGroupingSource={hasRollGroupingSource(songId, abc) && visibleKey === '0,1,2,3' &&
                    transpose === 0 && !learnerAccidentals && !repeatUnderlay && !lyricFiltered &&
                    (stanzasPerGroup === 1 || stanzasPerGroup === 2) ? abc : undefined}
                  rollSession={rollInterior ? rollSession : undefined}
                  rollGeneration={rollInterior ? beatGeneration : undefined}
                  rollMetricsRevision={rollInterior ? beatMetricsRevision : undefined}
                  stanzasPerGroup={stanzasPerGroup}
                  heKeepsSizeSource={hasHeKeepsSizeSource(songId, abc) && visibleKey === '0,1,2,3' &&
                    transpose === 0 && !learnerAccidentals && !repeatUnderlay && !lyricFiltered &&
                    stanzasPerGroup === 1 && scale === 1 ? abc : undefined}
                  openingSettings={groupOpeningSettings}
                  openingSource={hasPsalterGroupedOpeningSource(songId, abc) && visibleKey === '0,1,2,3' &&
                    transpose === 0 && !learnerAccidentals && !repeatUnderlay && !lyricFiltered && !reviewedUnderlay &&
                    stanzasPerGroup === (songId === 'psalter44' ? 1 : 5) ? abc : undefined}
                  allCreaturesGroupingSource={publishedVariant && reviewedUnderlay && visibleVoiceIndexes.length === 4 &&
                    [0, 1, 2, 3].every(part => visibleVoiceIndexes.includes(part)) &&
                    transpose === 0 && !learnerAccidentals && !repeatUnderlay && !lyricFiltered ? abc : undefined}
                  lyricExtenders={lyricExtenders}
                  hymnSlurClearance={hymnSlurClearance}
                  accessibleLabel={`${accessibleLabel}, stanzas ${first} through ${last}`}
                  scale={scale}
                  transpose={engravingTranspose}
                  width={width}
                  repeatLyricSpacing={repeatActive}
                  hymnAboveResponse={hymnAboveResponse}
                  hymnBelowResponse={hymnBelowResponse}
                  dottedRests81={dottedRests81}
                  sourceHeads={sourceHeads}
                  sourceLayers={sourceLayers}
                  sharedRests133={sharedRests133}
                  sharedQuarterRests={sharedQuarterRests}
                  keySignatures143={keySignatures143}
                  keySignatures226={keySignatures226}
                  onNoteClick={onNoteClick}
                  registerVisible={registerVisible}
                  trackingSupported={trackingSupported}
                  copy={index}
                />
              </section>;
            } catch (error) {
              return <section className="score-verse-group" key={`${first}-${index}`}>
                <p role="alert">{error instanceof Error ? `Unable to render this score: ${error.message}` : 'Unable to render this score.'}</p>
              </section>;
            }
          })}
        </div>
      ) : (
        <div key="single-score" className="score-canvas" ref={hostRef} role={renderError || !visibleVoiceIndexes.length ? undefined : 'img'} aria-label={renderError || !visibleVoiceIndexes.length ? undefined : accessibleLabel} />
      )}
      </div>
      <div className="print-score-canvas" ref={printHostRef} aria-hidden="true" />
      {screenPreparation.error && grouped && <p role="alert">Unable to prepare this score: {screenPreparation.error.message}</p>}
      {!renderError && visibleVoiceIndexes.length === 0 && <p className="notice" role="status">Select a part to display its notation.</p>}
      {renderError && <p role="alert">{renderError}</p>}
    </>
  );
}
