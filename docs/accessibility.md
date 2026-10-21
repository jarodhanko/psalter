# Accessibility status and release checks

The viewer is designed to remain usable with keyboard navigation, screen readers, magnification, reduced-motion preferences, and narrow displays. Accessibility is a release requirement, not a substitute for preserving the score accurately.

## Implemented behavior

- On supported secure browsers, opening or returning to the foreground requests a screen wake lock for up to ten minutes. Song changes and other in-app actions do not extend it. Hiding or leaving the page releases it immediately; after the deadline, normal device screen timeout applies. Browser rejection, battery saving, or system revocation are respected without retry loops. This does not change device settings or prevent manual locking.
- The compact lookup field searches as you type. In the Psalter, whole-number submission opens numbers 1–450; blank, out-of-range, signed, decimal, or exponent-form numeric input never silently clamps. Text such as “Psalm 23” remains search. Hymnbooks use title-led search and alphabetical previous/next controls, with a full title selector above the score.
- Search results, previous/next navigation, and tune changes move focus to the new score heading. Browser history restores the book, selection, and focus context.
- Tune alternatives use one native radio group, and voice visibility/audio choices use native checkboxes. Each voice also has a named `Show only …` action so a single visible and audible part does not require clearing every other checkbox.
- The responsive SVG score has a concise accessible name. A separate readable lyrics transcript removes ABC syllable-joining markers while preserving stanza text.
- Loading, score changes, piano playback, completion, stopping, and failures are announced through status or alert regions.
- The playback button exposes its pressed state, and every icon-only transpose control has an explicit name.
- A two-color focus indicator remains visible against both the dark header and light paper surfaces.
- Programmatic scrolling switches from smooth to immediate movement when `prefers-reduced-motion: reduce` is active.

- The menu opens a modal drawer with an accessible name, focus entry into the active section, cyclic Tab navigation, and an inert background. Escape, Close, or the backdrop dismisses it and returns focus to the opener. Escape inside a Print/Share/ABC or Add-to-list panel closes that panel first. Section changes focus the new heading. Hidden sections and closed disclosures are excluded from the focus loop.
- The drawer retains local drafts and uses stable action/settings portals: opening, switching, and closing do not remount the score or audio owner. Book/song navigation closes it and focuses the score instead of its old opener; Back/Forward restores the appropriate score/search context.
- Body scroll locking preserves the measured page width, scroll position, and previous inline styles, and is cleaned up on dismissal, navigation, and unmount. Focus return runs after background inertness is removed. Print suppresses the drawer and resets fixed body positioning for the print document.
- Play/Stop, score size, and Follow stay in one compact strip. The gear opens settings directly in one tap. Generic note and keyboard help is in settings; selected-note start/reset and genuine warnings remain with the music. When audio is loading or playing, a Stop button also remains reachable in the drawer header, using the same playback owner.
- Only the compact primary toolbar becomes sticky while audio is loading or playing. Paused following exposes Resume without stopping or seeking audio; stop, completion, or an error restores normal page layout.

## Historical automated coverage (suite removed 2026-10-16)

- Axe checks cover the initial app, dynamic search, and the opened library drawer. Color contrast is disabled only in jsdom because it has no layout engine.
- Component and real-ABCJS tests cover score-render failure, rerendered part subsets with shared staff groups and unchanged musical events, accessible score naming, readable transcript output, local piano playback, playback announcements, and completion.
- Navigation tests cover strict unified lookup, retained result scroll/query and browser history, native tune selection, repeated modal open/close, Escape/backdrop, inertness, measured-width/body-style restoration, section focus, navigation dismissal, and cleanup on unmount. Viewer tests cover action-panel focus and uninterrupted active audio through drawer use, plus the drawer Stop action.

These retained historical records are not current test-run requirements. Automated checks did not prove screen-reader quality, color contrast, zoom behavior, musical correctness, or hardware audio behavior.

Historical browser observations are not a current accessibility certification. Run the manual matrix against the exact final artifact; automated tests do not substitute for assistive-technology testing.

## Manual release gate

Before a public release, test the production build with:

1. Keyboard-only navigation at desktop and narrow-phone widths, including search, number jump, previous/next, tune radios, every viewer control, transcript, and update notices.
2. At least one current Windows screen reader and one mobile screen reader. Confirm that score changes, errors, and playback state are announced once and in context.
3. Browser zoom at 200% and 400%, high-contrast/forced-colors mode, reduced motion, and text-size enlargement.
4. Single-part and combined-part display/playback for ordinary SATB and exceptional voice arrangements.
5. Light/dark operating-system themes and the supported browser/device matrix.

Record the browser, operating system, assistive technology version, setting tested, result, and any follow-up issue. Keep the corresponding items in `docs/release-checklist.md` open until this manual matrix passes.
