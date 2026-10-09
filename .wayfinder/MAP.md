# Wayfinder Map: Synthagma Curriculum Expansion

## Destination

Decide and implement the next sections of piano lessons for Synthagma, a Duolingo-style piano learning app. Each section bundles lessons, exercises, and a quiz. No fixed endpoint — the curriculum grows organically.

## Notes

- **Domain**: Piano pedagogy for complete beginners, app-based, gamified (XP, mascot, unlockable songs).
- **Tech**: Expo React Native (v57), TypeScript. Sections/lessons/songs defined in `src/constants/`.
- **Skills**: grilling, domain-modeling, prototype.
- **Style**: Duolingo approach — short lessons, progressive difficulty, quiz at section end.

## Decisions so far

- **Next three sections** — Three new sections in order: "Black Keys: Flats" (complete the note palette), then "Left Hand Independence" (bass lines, accompaniment patterns), then "Your First Chords" (triads, harmony). Each section is separate; not combined. _(Decided during charting; no separate ticket.)_
- **`isFlat` data model** — Added `isFlat?: boolean` to the `Note` type. Flat notes use `'b'` notation in sheetNotes strings (e.g. `'Db4'`). Enharmonic comparison uses semitone-based matching. Updated Piano, SheetMusic, soundEngine, and lesson screen. _(Implemented 2026-07-22.)_
- **"Black Keys: Flats" section** — 4 lessons (11–14): D♭ & E♭, G♭/A♭/B♭, enharmonics review, song with flats. 5-question quiz. Section order 4. _(Implemented 2026-07-22.)_
- **"Left Hand Independence" section** — 4 lessons (15–18): left hand walking bass, hands-apart coordination, left-hand melody, two-hand duet. 5-question quiz. Section order 5. _(Implemented 2026-07-22.)_
- **"Your First Chords" section** — 4 lessons (19–22): C major triad, F & G chords, chord progressions (I-IV-V), song with chord accompaniment. 5-question quiz. Section order 6. _(Implemented 2026-07-22.)_

## Not yet specified

- **Songs for new sections** — add new unlockable songs to the song library for flats, left hand, and chords sections.
- **Section 7+** — beyond chords: other keys (G major, F major), rhythm/timing, more repertoire, bass clef reading, scales, arpeggios, inversions.

## Out of scope

_(nothing yet)_
