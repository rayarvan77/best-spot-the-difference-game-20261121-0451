// Harbour Lights — spot the difference. Level data.
//
// Each level is one hand-drawn scene painted twice: the left picture is the
// original, the right picture is the same scene with seven small changes.
// A difference is a spot on the picture: its centre in panel coordinates
// (the panel is 600 wide and 560 tall), a click radius, and a short label
// shown when the player finds it.

export const PANEL = { width: 600, height: 560 };

export const LEVELS = [
  {
    id: 'harbour',
    name: 'Harbour at Dusk',
    tagline: 'Fishing boats come home as the lighthouse wakes up.',
    scene: 'harbour',
    differences: [
      { x: 226, y: 74, r: 30, label: 'A seagull flew away' },
      { x: 96, y: 176, r: 34, label: 'The lighthouse beam went dark' },
      { x: 188, y: 392, r: 40, label: 'The sail changed colour' },
      { x: 308, y: 322, r: 30, label: 'The pier cat wandered off' },
      { x: 158, y: 318, r: 30, label: 'An extra crate appeared' },
      { x: 462, y: 246, r: 26, label: 'The cottage window went dark' },
      { x: 522, y: 468, r: 28, label: 'The buoy changed colour' },
    ],
  },
  {
    id: 'garden',
    name: 'Garden Morning',
    tagline: 'Dew on the grass, bees already at work.',
    scene: 'garden',
    differences: [
      { x: 356, y: 418, r: 28, label: 'The butterfly fluttered away' },
      { x: 250, y: 322, r: 28, label: 'The bird left the fence' },
      { x: 182, y: 452, r: 32, label: 'The watering can is gone' },
      { x: 446, y: 446, r: 28, label: 'A red tulip turned blue' },
      { x: 122, y: 196, r: 26, label: 'The bee buzzed off' },
      { x: 512, y: 250, r: 26, label: 'The cottage curtains closed' },
      { x: 300, y: 516, r: 26, label: 'An extra stepping stone' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'Lanterns, oranges and one very full cat.',
    scene: 'market',
    differences: [
      { x: 150, y: 128, r: 28, label: 'A lantern went out' },
      { x: 528, y: 296, r: 34, label: 'A balloon floated away' },
      { x: 452, y: 402, r: 30, label: 'The stall cat slipped off' },
      { x: 486, y: 82, r: 36, label: 'The moon turned into a crescent' },
      { x: 168, y: 218, r: 36, label: 'The awning stripes changed colour' },
      { x: 300, y: 168, r: 26, label: 'The star fell off the sign' },
      { x: 118, y: 402, r: 32, label: 'The apple pile vanished' },
    ],
  },
];

/** How many differences a level has (seven, on every level). */
export const DIFFERENCES_PER_LEVEL = 7;
