// Harbour Lights — the pictures themselves.
//
// Every scene is drawn twice from the same painter: once as the original and
// once with `changed` true, which applies the level's seven differences.
// Nothing is loaded from disk — all art is canvas paths, so the game plays
// with the network off. Each painter works in panel coordinates: the panel
// is 600 wide and 560 tall, with its own origin at the panel's top-left.

import { PANEL } from './levels.js';

const W = PANEL.width;
const H = PANEL.height;

// ------------------------------------------------------------ small helpers

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function rect(ctx, x, y, w, h) {
  ctx.fillRect(x, y, w, h);
}

/** A soft vertical gradient filling the whole panel. */
function sky(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (const [at, colour] of stops) g.addColorStop(at, colour);
  ctx.fillStyle = g;
  rect(ctx, 0, 0, W, H);
}

/** A few four-point stars scattered in the upper sky. */
function stars(ctx, list) {
  ctx.fillStyle = '#fff8d6';
  for (const [x, y, r] of list) {
    circle(ctx, x, y, r);
    circle(ctx, x, y, r * 0.35);
  }
}

/** A puffy cloud made of three overlapping ellipses. */
function cloud(ctx, x, y, scale, colour) {
  ctx.fillStyle = colour;
  ellipse(ctx, x, y, 42 * scale, 16 * scale);
  ellipse(ctx, x - 30 * scale, y + 6 * scale, 28 * scale, 12 * scale);
  ellipse(ctx, x + 32 * scale, y + 6 * scale, 30 * scale, 13 * scale);
}

/** A little seagull: two arcs like a shallow "m". */
function gull(ctx, x, y, scale) {
  ctx.strokeStyle = '#2b2b3a';
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.quadraticCurveTo(x - 6 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 6 * scale, y - 8 * scale, x + 12 * scale, y);
  ctx.stroke();
}

/** A sitting cat, drawn from a body ellipse, head, ears and tail. */
function cat(ctx, x, y, scale, colour) {
  ctx.fillStyle = colour;
  ellipse(ctx, x, y, 13 * scale, 17 * scale); // body
  circle(ctx, x + 2 * scale, y - 20 * scale, 9 * scale); // head
  poly(ctx, [ // ears
    [x - 4 * scale, y - 26 * scale], [x - 1 * scale, y - 34 * scale], [x + 2 * scale, y - 26 * scale],
  ]);
  poly(ctx, [
    [x + 4 * scale, y - 27 * scale], [x + 9 * scale, y - 34 * scale], [x + 11 * scale, y - 26 * scale],
  ]);
  ctx.strokeStyle = colour; // tail curling up
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(x + 12 * scale, y + 12 * scale);
  ctx.quadraticCurveTo(x + 24 * scale, y + 8 * scale, x + 22 * scale, y - 6 * scale);
  ctx.stroke();
}

// ------------------------------------------------------------ level 1: harbour

function paintHarbour(ctx, changed) {
  sky(ctx, [[0, '#2c2350'], [0.45, '#7a4a72'], [0.62, '#e8835a'], [0.75, '#f7b267'], [1, '#3a2b4d']]);
  stars(ctx, [[40, 36, 2], [150, 24, 1.6], [330, 30, 2], [520, 44, 1.8], [560, 90, 1.4], [90, 90, 1.4]]);

  // Setting sun and its shimmer on the water.
  ctx.fillStyle = '#ffb347';
  circle(ctx, 470, 128, 34);
  ctx.fillStyle = 'rgba(255, 179, 71, 0.5)';
  for (let i = 0; i < 5; i++) ellipse(ctx, 470, 340 + i * 26, 60 - i * 8, 5);
  cloud(ctx, 130, 66, 1, 'rgba(255, 205, 180, 0.55)');
  cloud(ctx, 330, 48, 0.8, 'rgba(255, 205, 180, 0.45)');
  cloud(ctx, 520, 96, 0.7, 'rgba(255, 205, 180, 0.4)');

  // Headland with the lighthouse on the left.
  ctx.fillStyle = '#241d33';
  poly(ctx, [[0, 300], [0, 210], [60, 170], [150, 200], [170, 300]]);
  ctx.fillStyle = '#e8dcc8'; // lighthouse tower
  poly(ctx, [[82, 236], [92, 158], [108, 158], [118, 236]]);
  ctx.fillStyle = '#c65a4e';
  rect(ctx, 80, 224, 40, 12);
  rect(ctx, 86, 192, 28, 12);
  ctx.fillStyle = '#2c2350'; // lamp room
  rect(ctx, 90, 142, 20, 16);
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, 100, 150, 7);
  if (!changed) {
    // The beam sweeping out to sea — gone in the changed picture.
    const beam = ctx.createLinearGradient(110, 150, 300, 130);
    beam.addColorStop(0, 'rgba(255, 233, 168, 0.75)');
    beam.addColorStop(1, 'rgba(255, 233, 168, 0)');
    ctx.fillStyle = beam;
    poly(ctx, [[110, 142], [300, 104], [300, 168], [110, 158]]);
  }
  ctx.fillStyle = '#2c2350'; // little roof
  poly(ctx, [[86, 142], [100, 128], [114, 142]]);

  // The cottage on the right shore, one window lit.
  ctx.fillStyle = '#5d3a52';
  rect(ctx, 400, 210, 130, 90);
  ctx.fillStyle = '#3a2b4d';
  poly(ctx, [[390, 212], [465, 168], [540, 212]]);
  ctx.fillStyle = changed ? '#241d33' : '#ffd76a'; // window: lit, or dark
  rect(ctx, 448, 238, 26, 30);
  ctx.fillStyle = '#241d33';
  rect(ctx, 500, 250, 18, 50); // door
  circle(ctx, 516, 278, 2);

  // The sea.
  ctx.fillStyle = '#2e4a6b';
  rect(ctx, 0, 300, W, H - 300);
  ctx.fillStyle = '#3d6284';
  for (let i = 0; i < 8; i++) ellipse(ctx, 60 + i * 70, 330 + (i % 3) * 40, 46, 5);
  ctx.fillStyle = '#2e4a6b';
  for (let i = 0; i < 6; i++) ellipse(ctx, 120 + i * 80, 420 + (i % 2) * 60, 60, 5);

  // The wooden pier, planks and posts.
  ctx.fillStyle = '#7a5233';
  rect(ctx, 40, 306, 520, 16);
  ctx.fillStyle = '#8d6238';
  for (let x = 48; x < 560; x += 26) rect(ctx, x, 306, 3, 16);
  ctx.fillStyle = '#5d3a26';
  for (const x of [70, 180, 290, 400, 520]) rect(ctx, x, 322, 12, 44);
  ctx.fillStyle = '#a8763e';
  circle(ctx, 76, 322, 4);
  circle(ctx, 296, 322, 4);

  // Crates stacked on the pier; the changed picture gains one more.
  ctx.fillStyle = '#b98a4a';
  rect(ctx, 96, 282, 26, 24);
  ctx.fillStyle = '#a1763c';
  rect(ctx, 96, 282, 26, 4);
  rect(ctx, 122, 288, 22, 18);
  if (changed) {
    ctx.fillStyle = '#b98a4a';
    rect(ctx, 146, 292, 22, 14);
    ctx.fillStyle = '#a1763c';
    rect(ctx, 146, 292, 22, 3);
  }

  // The pier cat — missing in the changed picture.
  if (!changed) cat(ctx, 308, 300, 0.9, '#1d1a24');

  // The sailboat: white sail, or a red one in the changed picture.
  ctx.fillStyle = '#4a2f23';
  poly(ctx, [[150, 420], [230, 420], [218, 398], [162, 398]]);
  ctx.fillStyle = '#6b4630';
  rect(ctx, 186, 330, 5, 70);
  ctx.fillStyle = changed ? '#c65a4e' : '#f5efdd';
  poly(ctx, [[192, 336], [192, 394], [232, 394]]);
  ctx.fillStyle = changed ? '#d97b6a' : '#efe6c8';
  poly(ctx, [[186, 344], [186, 394], [158, 394]]);
  ctx.fillStyle = '#ffb347';
  circle(ctx, 190, 404, 4);

  // The little fishing boat, and the buoy bobbing past it.
  ctx.fillStyle = '#31435c';
  poly(ctx, [[400, 452], [478, 452], [464, 430], [414, 430]]);
  ctx.fillStyle = '#c65a4e';
  rect(ctx, 428, 414, 22, 16);
  ctx.fillStyle = '#e8dcc8';
  circle(ctx, 439, 410, 8);
  ctx.fillStyle = changed ? '#3f9e5f' : '#d94f3d'; // buoy: red, or green
  circle(ctx, 522, 468, 12);
  ctx.fillStyle = '#f5efdd';
  rect(ctx, 518, 462, 8, 12);
  ctx.fillStyle = '#2e4a6b';
  ellipse(ctx, 522, 480, 16, 4);

  // Three gulls over the water — one fewer in the changed picture.
  gull(ctx, 150, 96, 1);
  if (!changed) gull(ctx, 226, 74, 1.1);
  gull(ctx, 300, 108, 0.9);
}

// ------------------------------------------------------------ level 2: garden

function paintGarden(ctx, changed) {
  sky(ctx, [[0, '#7ec8e8'], [0.55, '#bfe6f2'], [1, '#eaf7d8']]);
  ctx.fillStyle = '#ffd94d';
  circle(ctx, 500, 92, 36);
  ctx.fillStyle = 'rgba(255, 217, 77, 0.35)';
  circle(ctx, 500, 92, 48);
  cloud(ctx, 120, 70, 1.1, 'rgba(255, 255, 255, 0.9)');
  cloud(ctx, 330, 52, 0.8, 'rgba(255, 255, 255, 0.85)');
  cloud(ctx, 470, 150, 0.7, 'rgba(255, 255, 255, 0.8)');

  // The old apple tree on the left.
  ctx.fillStyle = '#6b4630';
  rect(ctx, 92, 190, 26, 130);
  ctx.fillStyle = '#5d3a26';
  poly(ctx, [[96, 210], [70, 170], [84, 190]]);
  poly(ctx, [[114, 200], [140, 164], [126, 196]]);
  ctx.fillStyle = '#4e9e4a';
  circle(ctx, 105, 150, 62);
  circle(ctx, 60, 178, 42);
  circle(ctx, 152, 178, 44);
  circle(ctx, 105, 108, 40);
  ctx.fillStyle = '#d94f3d';
  circle(ctx, 70, 160, 6);
  circle(ctx, 130, 132, 6);
  circle(ctx, 148, 176, 6);
  circle(ctx, 88, 120, 5);

  // The cottage on the right with its round window.
  ctx.fillStyle = '#f2e3c2';
  rect(ctx, 400, 200, 150, 120);
  ctx.fillStyle = '#c65a4e';
  poly(ctx, [[392, 202], [475, 150], [558, 202]]);
  ctx.fillStyle = '#7a5233';
  rect(ctx, 462, 258, 26, 62);
  ctx.fillStyle = '#ffd94d';
  circle(ctx, 484, 290, 3);
  ctx.fillStyle = changed ? '#7a9e7a' : '#ffd76a'; // curtains: open (warm) or closed (green)
  circle(ctx, 520, 232, 20);
  ctx.strokeStyle = '#7a5233';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(520, 232, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(500, 232);
  ctx.lineTo(540, 232);
  ctx.moveTo(520, 212);
  ctx.lineTo(520, 252);
  ctx.stroke();

  // The lawn.
  ctx.fillStyle = '#6fb457';
  rect(ctx, 0, 320, W, H - 320);
  ctx.fillStyle = '#5da347';
  for (let i = 0; i < 10; i++) ellipse(ctx, 40 + i * 62, 350 + (i % 4) * 46, 52, 8);

  // The white picket fence across the lawn.
  ctx.fillStyle = '#f5efdd';
  rect(ctx, 0, 332, W, 8);
  for (let x = 12; x < W; x += 34) {
    rect(ctx, x, 306, 12, 36);
    poly(ctx, [[x, 306], [x + 6, 296], [x + 12, 306]]);
  }
  // A little bird on the fence — gone in the changed picture.
  if (!changed) {
    ctx.fillStyle = '#3a6ea8';
    ellipse(ctx, 250, 300, 14, 10);
    circle(ctx, 260, 290, 7);
    poly(ctx, [[266, 290], [274, 293], [266, 296]]);
    ctx.strokeStyle = '#3a6ea8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(244, 310);
    ctx.lineTo(238, 320);
    ctx.moveTo(252, 310);
    ctx.lineTo(252, 320);
    ctx.stroke();
  }

  // The flower bed along the bottom.
  const flowers = [
    [60, 420, '#e85a7a'], [120, 448, '#e85a7a'], [180, 424, '#f2a541'],
    [240, 452, '#e85a7a'], [300, 428, '#f2a541'], [360, 452, '#e85a7a'],
    [420, 424, '#f2a541'], [480, 448, '#e85a7a'], [540, 424, '#f2a541'],
  ];
  for (const [x, y, colour] of flowers) {
    ctx.strokeStyle = '#3f7d33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 44);
    ctx.stroke();
    ctx.fillStyle = colour;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 6);
    }
    ctx.fillStyle = '#ffd94d';
    circle(ctx, x, y, 6);
  }
  // One tulip in the changed picture bloomed blue instead of red.
  if (changed) {
    ctx.fillStyle = '#5a7ad9';
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, 446 + Math.cos(a) * 9, 446 + Math.sin(a) * 9, 6);
    }
    ctx.fillStyle = '#ffd94d';
    circle(ctx, 446, 446, 6);
  }

  // The watering can by the bed — missing in the changed picture.
  if (!changed) {
    ctx.fillStyle = '#5a7ad9';
    rect(ctx, 168, 440, 34, 26);
    poly(ctx, [[202, 444], [224, 452], [202, 456]]);
    ctx.strokeStyle = '#5a7ad9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(168, 452, 12, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#7fa8e8';
    ellipse(ctx, 224, 456, 8, 4);
  }

  // The butterfly over the flowers — gone in the changed picture.
  if (!changed) {
    ctx.fillStyle = '#b678e8';
    ellipse(ctx, 348, 414, 10, 14);
    ellipse(ctx, 364, 414, 10, 14);
    ctx.fillStyle = '#8a4fc0';
    ellipse(ctx, 350, 428, 7, 10);
    ellipse(ctx, 362, 428, 7, 10);
    ctx.strokeStyle = '#5d3a26';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(356, 402);
    ctx.lineTo(356, 412);
    ctx.stroke();
  }

  // The bee by the tree — gone in the changed picture.
  if (!changed) {
    ctx.fillStyle = '#ffd94d';
    ellipse(ctx, 122, 196, 9, 7);
    ctx.fillStyle = '#2b2b3a';
    rect(ctx, 118, 189, 3, 14);
    rect(ctx, 125, 189, 3, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ellipse(ctx, 118, 186, 6, 4);
  }

  // Stepping stones to the cottage door; the changed picture adds one.
  ctx.fillStyle = '#cfc4a8';
  for (const [x, y] of [[290, 470], [320, 500], [360, 486], [410, 510]]) ellipse(ctx, x, y, 26, 10);
  if (changed) ellipse(ctx, 300, 524, 26, 10);
}

// ------------------------------------------------------------ level 3: market

function paintMarket(ctx, changed) {
  sky(ctx, [[0, '#141430'], [0.5, '#2c2350'], [1, '#4a2b52']]);
  stars(ctx, [[40, 40, 2], [120, 70, 1.6], [220, 30, 2], [330, 60, 1.5], [420, 36, 1.8], [560, 60, 1.6], [80, 120, 1.4], [260, 110, 1.5]]);

  // The moon: full, or a crescent in the changed picture.
  ctx.fillStyle = '#f5efdd';
  circle(ctx, 486, 82, 30);
  if (changed) {
    ctx.fillStyle = '#2c2350';
    circle(ctx, 498, 74, 26);
  }
  ctx.fillStyle = 'rgba(245, 239, 221, 0.6)';
  circle(ctx, 476, 76, 4);
  circle(ctx, 494, 92, 3);

  // String lights sagging across the top.
  ctx.strokeStyle = '#1d1a24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.quadraticCurveTo(150, 110, 300, 70);
  ctx.quadraticCurveTo(450, 110, 600, 60);
  ctx.stroke();
  const bulbs = [[60, 78], [120, 92], [180, 96], [240, 88], [300, 76], [360, 84], [420, 96], [480, 92], [540, 76]];
  for (const [x, y] of bulbs) {
    ctx.fillStyle = '#ffd76a';
    circle(ctx, x, y + 8, 6);
    ctx.fillStyle = 'rgba(255, 215, 106, 0.35)';
    circle(ctx, x, y + 8, 11);
  }

  // The wooden sign in the middle.
  ctx.fillStyle = '#7a5233';
  rect(ctx, 292, 140, 8, 60);
  ctx.fillStyle = '#a8763e';
  rect(ctx, 230, 128, 140, 44);
  ctx.strokeStyle = '#5d3a26';
  ctx.lineWidth = 3;
  ctx.strokeRect(230, 128, 140, 44);
  ctx.fillStyle = '#f5efdd';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PASAR', 300, 150);
  if (!changed) { // the little star on the sign — gone in the changed picture
    ctx.fillStyle = '#ffd94d';
    const sx = 300;
    const sy = 168;
    ctx.beginPath();
    for (let p = 0; p < 10; p++) {
      const a = -Math.PI / 2 + (p / 10) * Math.PI * 2;
      const r = p % 2 === 0 ? 7 : 3;
      const px = sx + Math.cos(a) * r;
      const py = sy + Math.sin(a) * r;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  // The cobbled ground.
  ctx.fillStyle = '#3a3348';
  rect(ctx, 0, 380, W, H - 380);
  ctx.fillStyle = '#453d57';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) ellipse(ctx, 40 + col * 74 + (row % 2) * 30, 410 + row * 38, 30, 12);
  }

  // The left stall: striped awning, fruit, and a lantern.
  ctx.fillStyle = '#6b4630';
  rect(ctx, 60, 260, 220, 140);
  ctx.fillStyle = '#f5efdd';
  rect(ctx, 60, 400, 220, 12);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? (changed ? '#3f9e5f' : '#c65a4e') : '#f5efdd';
    poly(ctx, [[60 + i * 44, 210], [104 + i * 44, 210], [96 + i * 44, 260], [68 + i * 44, 260]]);
  }
  ctx.fillStyle = '#7a5233';
  rect(ctx, 60, 254, 220, 8);
  // Oranges in a pyramid.
  ctx.fillStyle = '#f28c2e';
  for (const [x, y] of [[100, 388], [122, 388], [144, 388], [111, 372], [133, 372], [122, 356]]) circle(ctx, x, y, 11);
  ctx.fillStyle = '#3f7d33';
  ellipse(ctx, 122, 344, 8, 4);
  // The apple pile — vanished in the changed picture.
  if (!changed) {
    ctx.fillStyle = '#d94f3d';
    for (const [x, y] of [[200, 388], [222, 388], [244, 388], [211, 372], [233, 372], [222, 356]]) circle(ctx, x, y, 11);
  }
  // The lantern by the stall — dark in the changed picture.
  ctx.fillStyle = '#2c2350';
  rect(ctx, 148, 226, 4, 18);
  ctx.fillStyle = changed ? '#453d57' : '#ffd76a';
  ellipse(ctx, 150, 254, 12, 16);
  ctx.fillStyle = '#c65a4e';
  rect(ctx, 138, 236, 24, 4);
  rect(ctx, 138, 268, 24, 4);

  // The right stall: blue awning, bread, and the cat on the counter.
  ctx.fillStyle = '#31435c';
  rect(ctx, 360, 260, 200, 140);
  ctx.fillStyle = '#f5efdd';
  rect(ctx, 360, 400, 200, 12);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#3a6ea8' : '#f5efdd';
    poly(ctx, [[360 + i * 50, 210], [410 + i * 50, 210], [402 + i * 50, 260], [368 + i * 50, 260]]);
  }
  ctx.fillStyle = '#31435c';
  rect(ctx, 360, 254, 200, 8);
  // Bread loaves.
  ctx.fillStyle = '#d9a05b';
  for (const [x, y] of [[390, 386], [430, 386], [470, 386], [410, 368], [450, 368]]) ellipse(ctx, x, y, 18, 10);
  ctx.fillStyle = '#b98a4a';
  for (const [x, y] of [[390, 386], [430, 386], [470, 386]]) ellipse(ctx, x, y, 12, 4);
  // The stall cat — missing in the changed picture.
  if (!changed) cat(ctx, 500, 388, 0.8, '#e8dcc8');
  // A second lantern, always lit.
  ctx.fillStyle = '#ffd76a';
  ellipse(ctx, 540, 254, 11, 15);
  ctx.fillStyle = '#c65a4e';
  rect(ctx, 529, 238, 22, 4);
  rect(ctx, 529, 266, 22, 4);

  // A bunch of balloons tied to the right stall — one fewer in the changed picture.
  ctx.strokeStyle = '#f5efdd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(528, 300);
  ctx.lineTo(540, 380);
  ctx.stroke();
  ctx.fillStyle = '#e85a7a';
  ellipse(ctx, 516, 282, 14, 18);
  ctx.fillStyle = '#5a7ad9';
  ellipse(ctx, 540, 276, 14, 18);
  if (!changed) {
    ctx.fillStyle = '#f2a541';
    ellipse(ctx, 528, 258, 14, 18);
  }
  ctx.fillStyle = '#f5efdd';
  poly(ctx, [[516, 300], [520, 308], [512, 308]]);
  poly(ctx, [[540, 294], [544, 302], [536, 302]]);
}

// ------------------------------------------------------------ the dispatcher

const PAINTERS = { harbour: paintHarbour, garden: paintGarden, market: paintMarket };

/** Paint one panel of a level: `scene` is the level's scene id, `changed` picks the altered picture. */
export function paintPanel(ctx, scene, changed) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  PAINTERS[scene](ctx, changed);
  ctx.restore();
}
