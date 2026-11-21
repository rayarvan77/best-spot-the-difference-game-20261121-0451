// Harbour Lights — the three screenshot scenes behind ?shot=start|play|end.
//
// Screenshots are real frames of the game, not mock-ups: each shot starts a
// fresh level 1 (Harbour at Dusk) and plays it forward to a fixed point, so
// the same URL always renders the same picture.
//   start — the level just opened: both pictures, no markers, 7 to find.
//   play  — three differences found and ringed, four still hiding, the
//           counter showing 4 remaining.
//   end   — all seven found, the level-complete panel on top.
// Any other value behaves like start.

/** Which differences the play shot has already found (spread across the picture). */
const PLAY_FOUND = [0, 2, 4];

/**
 * The shot's starting point: level index, which difference indexes are
 * already found, which screen to draw, and how many seconds the clock shows.
 */
export function shotSetup(name) {
  if (name === 'play') {
    return { levelIndex: 0, found: [...PLAY_FOUND], screen: 'play', elapsedSeconds: 74 };
  }
  if (name === 'end') {
    return { levelIndex: 0, found: [0, 1, 2, 3, 4, 5, 6], screen: 'win', elapsedSeconds: 148 };
  }
  return { levelIndex: 0, found: [], screen: 'play', elapsedSeconds: 0 };
}
