[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rayarvan77/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rayarvan77/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Harbour Lights — Spot the Difference

A complete spot-the-difference game that runs offline in a desktop browser
from plain static files, built for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) — and for [make.fun](https://make.fun) itself, where this entry was built and judged.

Two pictures hang side by side. Seven small things changed between them.
Click every change — on either picture — to ring it in gold before the
clock runs on. A wrong click costs 10 points; a hint costs 25.

## The three scenes

- **Harbour at Dusk** — fishing boats come home as the lighthouse wakes up.
  A seagull, a sail, a pier cat, a crate, a window, a buoy and a beam of
  light are not quite the same on the right.
- **Garden Morning** — dew on the grass and bees already at work. A
  butterfly, a bird, a watering can, a tulip, a bee, a curtain and a
  stepping stone hide the changes.
- **Night Market** — lanterns, oranges and one very full cat. A lantern, a
  balloon, the stall cat, the moon, an awning, a sign star and an apple
  pile are what to look for.

## How to play

- **Click** a difference on either picture to mark it. Found differences
  get a gold ring on both pictures, and the counter at the top counts down
  from 7 remaining.
- **H** asks for a hint: a pulsing ring appears on the right picture for a
  few seconds (−25 points).
- **R** restarts the level. **M** mutes the sounds. **1**, **2**, **3** jump
  to a scene. **Enter** starts or continues. **Esc** goes back to the title
  screen.
- Finish a level to earn up to three stars: fast, accurate and hint-free
  play earns three. Finish all three scenes to see your total time and
  score.
- Sounds are small WebAudio notes (a chime for a find, a buzz for a miss,
  a fanfare for a win) — no sound files, no network.

## Run it

Static files, no build step, no libraries. Any static server works:

```sh
node serve.ts        # then open http://localhost:8080
```

Or open `game/index.html` directly — it works with the network off.
Screenshot scenes are staged with a query string: `?shot=start`,
`?shot=play` and `?shot=end` show the first level at its start, part-way
through (three found, four remaining) and finished.

## Files

- `game/` — the playable game: `index.html` plus ES modules under `src/`
  (`main.js` for the screens and rules, `scene.js` for the three hand-drawn
  pictures, `levels.js` for the difference spots, `audio.js` for sounds,
  `shots.js` for the screenshot scenes).
- `main.ts` — the entry program (Node 22, standard library only): copies
  `game/` and `screenshots/` to the output directory and writes
  `dossier.json` with the vendored make.fun library.
- `screenshots/` — three real renders of the game's own code.
- `vendor/makefun-game.ts` — the make.fun dossier library, copied from the
  kit unchanged.
- `serve.ts` — a tiny static server for play-testing.

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/game, out/screenshots, out/dossier.json
```

## License

MIT — see [LICENSE](LICENSE).
