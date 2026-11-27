import {drawExplorer} from './heroes.js?v=155';
import {drawPlayerAction,loadPlayerActions} from './player-actions.js';
import {POSTAL_BIKE_STANDS,POSTAL_HARU_MOUNT_FRAME_ENDS,POSTAL_MAIL_SLOT_Y,POSTAL_PEDAL_DISTANCE,POSTAL_VIEW,POSTAL_WALK_SPEED,postalDepartureMountTime} from './postal-core.js?v268';
import {drawPostalCat,postalCatPose} from './postal-cats.js?v268';
import {drawPostalMap} from './postal-route-map.js?v268';
import {drawPostalHouseProjection} from './postal-house-projection.js?v268';

const DIRS = ['down', 'up', 'right', 'left'];
const ACTION_CELL = 144;
const RIDER_CELL = 192;
const RIDER_OVERSAMPLE = 1.8;
const RIDE_FRAMES = 16;
const MOUNT_FRAMES = 12;
// The approved sheet and its parked bicycle use the same planted-foot anchor.
const HARU_MOUNT_ANCHOR = [155 / 256, 205 / 256];
const SPRITE_SCALE = .78;
const LOCKED_CAMERA = {x: 0, y: 0};
const HOUSE_STYLES = 8;
const HOUSES = Array.from({length: HOUSE_STYLES * 2}, (_, i) => `house-${i}`);
const STREET_ART = [...HOUSES, 'office', 'tree', 'recycling', 'mailbox', 'bench', 'parked-bike',
  'village-cats', 'flowers', 'shrubs', 'lamppost'];
const STREET_SIZES = {
  tree: [77, 78], recycling: [72, 41], bench: [60, 32], cat: [36, 28],
  lamppost: [22, 64], flowers: [34, 21], shrubs: [38, 26],
};

function image(url) {
  return new Promise((resolve, reject) => {
    const asset = new Image();
    asset.onload = () => resolve(asset);
    asset.onerror = () => reject(new Error(`Could not load ${url}`));
    asset.src = url;
  });
}

let scenery;
export async function loadPostalAssets(character) {
  scenery ||= Promise.all(STREET_ART.map(async key => [key, await image(`./assets/postal/${key}.webp?v265`)]))
    .then(Object.fromEntries).catch(error => { scenery = null; throw error; });
  const isHaru = character.id === 'haru';
  const [objects, rider, mail, idle, walk, haruMount, haruMountBike, haruSideRide, haruAxisRide,
    haruAxisMount, haruAxisBike, haruActions] = await Promise.all([
    scenery,
    isHaru ? null : image(`./assets/postal/${character.id}-courier.webp?v258`),
    isHaru ? null : image(`./assets/postal/${character.id}-mail.webp?v258`),
    image(`./assets/hero-v153/${character.id}-idle.webp`),
    image(`./assets/hero-v153/${character.id}-walk.webp`),
    isHaru ? image('./assets/postal/haru-approved-mount.webp') : null,
    isHaru ? image('./assets/postal/haru-parked-grips.webp') : null,
    isHaru ? image('./assets/postal/haru-side-ride.webp') : null,
    isHaru ? image('./assets/postal/haru-axis-ride.webp?v263') : null,
    isHaru ? image('./assets/postal/haru-axis-mount.webp?v263') : null,
    isHaru ? image('./assets/postal/haru-axis-bike.webp') : null,
    isHaru ? loadPlayerActions({}, character) : null,
  ]);
  return {...objects, rider, mail, haruMount, haruMountBike, haruSideRide, haruAxisRide,
    haruAxisMount, haruAxisBike, ...haruActions,
    [`${character.id}-idle.webp`]: idle, [`${character.id}-walk.webp`]: walk};
}

function panel(c, x, y, width, height, fill, radius = 7) {
  c.beginPath();
  c.roundRect(x, y, width, height, radius);
  c.fillStyle = fill;
  c.fill();
}

function ellipse(c, x, y, width, height, fill) {
  c.beginPath();
  c.ellipse(x, y, width, height, 0, 0, 2 * Math.PI);
  c.fillStyle = fill;
  c.fill();
}

function roadLayer(c, village, border, color) {
  c.beginPath();
  for (const road of village.roads) {
    const half = road.width / 2 + border;
    const x = Math.min(road.x1, road.x2) - half;
    const y = Math.min(road.y1, road.y2) - half;
    c.roundRect(x, y, Math.abs(road.x2 - road.x1) + half * 2, Math.abs(road.y2 - road.y1) + half * 2, 12);
  }
  const {office} = village;
  const entryHalf = 34 + border;
  c.roundRect(office.x - entryHalf, office.y - 7, entryHalf * 2, office.bike.y - office.y + 13, 8);
  c.fillStyle = color;
  c.fill();
}

function randomFor(id) {
  let seed = [...id].reduce((n, char) => (n * 31 + char.charCodeAt(0)) >>> 0, 17);
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function sprite(c, asset, x, y, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / asset.width, maxHeight / asset.height);
  const width = asset.width * scale;
  const height = asset.height * scale;
  c.drawImage(asset, x - width / 2, y - height, width, height);
}

function drawPlot(c, art, house) {
  const style = house.art + (house.side === 'south' ? HOUSE_STYLES : 0);
  drawPostalHouseProjection(c, art[HOUSES[style]], style, house.plot);
}

function drawGarden(c, garden) {
  const {x, y, width, height, variant} = garden;
  panel(c, x - 3, y - 3, width + 6, height + 6, '#71865463', 19);
  panel(c, x, y, width, height, '#b8a17a', 16);
  const crop = ['#7a9851', '#91a554', '#6d9249'][variant];
  for (let row = 0; row < 3; row++) {
    const bed = y + 8 + row * 23;
    panel(c, x + 9, bed, width - 18, 17, '#8c714e', 7);
    for (let spot = x + 17; spot < x + width - 14; spot += 14) {
      const offset = 3 * Math.sin(spot * .19 + row);
      ellipse(c, spot, bed + 10 + offset, 5.5, 3.5, '#5b7545');
      ellipse(c, spot - 1, bed + 8 + offset, 4, 3, crop);
      ellipse(c, spot + 2, bed + 6 + offset, 2.5, 1.9, '#adb764');
    }
  }
}

export function paintPostalTerrain(c, village) {
  const {width, height, theme} = village;
  c.fillStyle = theme.grass;
  c.fillRect(0, 0, width, height);
  const daylight = c.createLinearGradient(0, 0, width * .5, height);
  daylight.addColorStop(0, '#f3eac53c');
  daylight.addColorStop(.65, '#e8e3bf08');
  daylight.addColorStop(1, '#354b3a36');
  c.fillStyle = daylight;
  c.fillRect(0, 0, width, height);

  const rand = randomFor(village.id);
  for (let i = 0; i < 5450; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const length = rand() * 6 + 2;
    c.fillStyle = i % 2 ? '#566d4931' : '#f9efc83e';
    c.fillRect(x, y, length, 1 + rand() * 1.1);
  }
  for (const garden of village.gardens) drawGarden(c, garden);
  for (const house of village.houses) {
    const {plot, box} = house;
    panel(c, plot.x + 4, plot.y + 6, plot.width - 1, plot.height - 2, '#45554534', 7);
    const edge = house.side === 'north' ? plot.y + plot.height : plot.y;
    panel(c, box.x - 9, Math.min(edge, box.y), 18, Math.abs(edge - box.y) + 2, theme.road, 2);
  }

  roadLayer(c, village, 6, theme.edge);
  roadLayer(c, village, 3, theme.shoulder);
  roadLayer(c, village, 0, theme.road);
  const main = village.roads[0];
  c.strokeStyle = '#fff8ed57';
  c.lineWidth = 1;
  c.setLineDash([11, 19]);
  c.beginPath();
  c.moveTo(main.x1, main.y1);
  c.lineTo(main.x2, main.y2);
  c.stroke();
  c.setLineDash([]);
  for (let i = 0; i < 450; i++) {
    const road = village.roads[i % village.roads.length];
    const u = rand();
    const spread = (rand() - .5) * (road.width - 8);
    const x = road.x1 + u * (road.x2 - road.x1) + (road.x1 === road.x2 ? spread : 0);
    const y = road.y1 + u * (road.y2 - road.y1) + (road.y1 === road.y2 ? spread : 0);
    ellipse(c, x, y, 1 + rand() * 2.4, .55, '#837d7330');
  }
}

function drawHaruCell(c, asset, columns, frame, direction, x, y, scale) {
  const cell = asset.width / columns;
  const size = RIDER_CELL * scale / RIDER_OVERSAMPLE;
  c.save();
  c.translate(x, y);
  if (direction === 'left') c.scale(-1, 1);
  c.drawImage(asset, (frame % columns) * cell, Math.floor(frame / columns) * cell, cell, cell,
    -HARU_MOUNT_ANCHOR[0] * size, -HARU_MOUNT_ANCHOR[1] * size, size, size);
  c.restore();
}

const LETTER_INSERT_START = .50;
const LETTER_INSERT_END = .73;
function drawHaruMail(c, art, character, player, progress) {
  if (progress < .11 || progress >= .88) {
    drawExplorer(c, art, character, player);
    return;
  }
  const action = player.dir === 'up' ? 'investigateUp' : 'investigateDown';
  const frame = progress < .25 ? 0 : progress < LETTER_INSERT_START ? 2 : progress < LETTER_INSERT_END ? 3 : 1;
  drawPlayerAction(c, art, character, player, action, frame);
}

function insertLetter(c, box, progress) {
  if (progress < LETTER_INSERT_START || progress >= LETTER_INSERT_END) return;
  const remaining = (LETTER_INSERT_END - progress) / (LETTER_INSERT_END - LETTER_INSERT_START);
  const x = box.x - 3.2, y = box.y + POSTAL_MAIL_SLOT_Y - 1.4;
  const height = 3.4 * remaining;
  c.fillStyle = '#fff3d8';
  c.fillRect(x, y, 6.4, height);
  c.strokeStyle = '#bd9f70';
  c.lineWidth = .45;
  c.beginPath();
  c.moveTo(x, y);c.lineTo(x + 3.2, y + height * .64);c.lineTo(x + 6.4, y);
  c.stroke();
}

function drawPose(c, assets, mode, direction, progress, x, y, scale = SPRITE_SCALE) {
  const facing = DIRS.indexOf(direction);
  const frameAt = count => Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
  if (assets.haruMount && facing >= 2 && mode !== 'mail') {
    if (mode === 'bike') {
      drawHaruCell(c, assets.haruMountBike, 1, 0, direction, x, y, scale);
    } else if (mode === 'ride') {
      drawHaruCell(c, assets.haruSideRide, 4, frameAt(RIDE_FRAMES), direction, x, y, scale);
    } else {
      const ends = POSTAL_HARU_MOUNT_FRAME_ENDS;
      const time = (mode === 'dismount' ? 1 - progress : progress) * ends.at(-1);
      const next = ends.findIndex(end => time < end);
      drawHaruCell(c, assets.haruMount, 4, next < 0 ? ends.length - 1 : next, direction, x, y, scale);
    }
    return;
  }
  if (assets.haruAxisRide && facing < 2 && mode !== 'mail') {
    if (mode === 'bike') {
      drawHaruCell(c, assets.haruAxisBike, 1, facing, direction, x, y, scale);
    } else if (mode === 'ride') {
      drawHaruCell(c, assets.haruAxisRide, 8, facing * 8 + frameAt(8), direction, x, y, scale);
    } else {
      const frame = frameAt(8);
      drawHaruCell(c, assets.haruAxisMount, 8, facing * 8 + (mode === 'dismount' ? 7 - frame : frame),
        direction, x, y, scale);
    }
    return;
  }
  if (mode === 'bike' || mode === 'mail') {
    const parked = mode === 'bike';
    const asset = parked ? assets['parked-bike'] : assets.mail;
    const row = parked ? facing : Number(direction === 'up');
    const column = parked ? 0 : frameAt(RIDE_FRAMES);
    const size = ACTION_CELL * scale;
    c.drawImage(asset, column * ACTION_CELL, row * ACTION_CELL, ACTION_CELL, ACTION_CELL,
      x - 72 * scale, y - 120 * scale, size, size);
    return;
  }

  const riding = mode === 'ride';
  const row = Math.min(facing, 2) + (riding ? 0 : 3);
  const frame = frameAt(riding ? RIDE_FRAMES : MOUNT_FRAMES);
  const column = mode === 'dismount' ? MOUNT_FRAMES - 1 - frame : frame;
  const pixelScale = scale / RIDER_OVERSAMPLE;
  const size = RIDER_CELL * pixelScale;
  c.save();
  c.translate(x, y);
  if (direction === 'left') c.scale(-1, 1);
  c.drawImage(assets.rider, column * RIDER_CELL, row * RIDER_CELL, RIDER_CELL, RIDER_CELL,
    -96 * pixelScale, -164 * pixelScale, size, size);
  c.restore();
}

function boundsInView({x, y}, camera) {
  return x > camera.x - 132 && x < camera.x + POSTAL_VIEW.width + 132
    && y > camera.y - 55 && y < camera.y + POSTAL_VIEW.height + 150;
}

export class PostalRenderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.assets = assets;
    this.effects = [];
  }

  draw(game, character, time, delta) {
    const c = this.context;
    const view = POSTAL_VIEW;
    const camera = game.camera || LOCKED_CAMERA;
    c.setTransform(2, 0, 0, 2, 0, 0);
    c.clearRect(0, 0, this.canvas.width / 2, this.canvas.height / 2);
    c.save();
    c.translate(0, view.top);
    c.beginPath();
    c.rect(0, 0, view.width, view.height);
    c.clip();
    c.save();
    c.translate(-camera.x, -camera.y);
    this.paintVillage(c, game, character);
    c.restore();

    this.effects = this.effects.filter(effect => effect.age < .8);
    for (const effect of this.effects) {
      c.save();
      c.globalAlpha = Math.max(0, 1 - effect.age / .8);
      ellipse(c, effect.x, effect.y - view.top - effect.age * 24, 4, 4, '#efd489');
      c.restore();
      if (!game.mapOpen) effect.age += delta || 0;
    }
    if (game.tutorialDemo && game.mapOpen) {
      c.fillStyle = '#233e3094';
      c.fillRect(0, 0, view.width, view.height);
      panel(c, 13, 131, 364, 240, '#f5f3e6', 13);
      c.font = 'bold 16px system-ui, sans-serif';
      c.fillStyle = '#28534b';
      c.textAlign = 'center';
      c.fillText('마을지도', 195, 157);
      drawPostalMap(c, game, 24, 168, 342, 187);
    } else if (game.tutorialDemo && game.tutorialCountdownUntil > time) {
      c.fillStyle = '#0d597246';
      c.fillRect(0, 0, view.width, view.height);
      c.textAlign = 'center';
      c.fillStyle = '#fff';
      c.font = '800 19px system-ui, sans-serif';
      c.fillText('2차 배달 시작', view.width / 2, 199);
      c.fillStyle = '#fff7d2';
      c.font = '900 90px system-ui, sans-serif';
      c.fillText(String(Math.ceil(game.tutorialCountdownUntil - time)), view.width / 2, 294);
    }
    c.restore();
  }

  paintVillage(c, game, character) {
    const {village, player: p, phase} = game;
    const camera = game.camera || LOCKED_CAMERA;
    const art = this.assets;
    const nearHouse = game.canMove ? game.nearHouse : null;
    if (this.terrainId !== village.id) {
      this.terrain = document.createElement('canvas');
      this.terrain.width = village.width;
      this.terrain.height = village.height;
      paintPostalTerrain(this.terrain.getContext('2d'), village);
      this.terrainId = village.id;
    }
    const {width, height} = POSTAL_VIEW;
    c.drawImage(this.terrain, camera.x, camera.y, width, height, camera.x, camera.y, width, height);
    const entries = [];
    const add = (x, y, draw) => { if (boundsInView({x, y}, camera)) entries.push({y, draw}); };
    const foreground = (x, y, width, height) => y > p.y && y - height < p.y - 18 && Math.abs(x - p.x) < width / 2 + 9;

    for (const house of village.houses) {
      const {plot} = house;
      add(house.x, plot.y + plot.height, () => {
        c.save();
        if (foreground(house.x, plot.y + plot.height, plot.width, plot.height)) c.globalAlpha = .69;
        drawPlot(c, art, house);
        c.restore();
      });
      add(house.box.x, house.box.y, () => {
        const {x, y} = house.box;
        if (nearHouse === house) {
          ellipse(c, x, y, 14, 6, '#fff3c9da');
          ellipse(c, x, y, 10, 3.9, '#ccb985');
        }
        sprite(c, art.mailbox, x, y + 1, 18, 26);
        if (art.playerActions && phase === 'mail' && game.delivery?.house.id === house.id) {
          insertLetter(c, house.box, game.poseProgress);
        }
      });
    }
    const office = village.office;
    add(office.x, office.y, () => {
      ellipse(c, office.x + 4, office.y, 82, 8, '#535d4448');
      sprite(c, art.office, office.x, office.y, 184, 145);
    });
    for (const prop of village.props) {
      const {y, kind} = prop;
      const catPose = kind === 'cat' ? postalCatPose(prop, game.animationTime) : null;
      const x = catPose?.x ?? prop.x;
      add(x, y, () => {
        const [width, height] = STREET_SIZES[kind];
        c.save();
        if (foreground(x, y, width, height)) c.globalAlpha = .57;
        if (kind === 'tree') ellipse(c, x + 12, y - 1, 28, 8, '#52664941');
        if (catPose) {
          ellipse(c, x, y, 14, 3, '#52664938');
          drawPostalCat(c, art['village-cats'], prop, catPose);
        } else {
          sprite(c, art[kind], x, y, width, height);
        }
        c.restore();
      });
    }

    const separateBike = ['walkout', 'approach', 'mail', 'return'].includes(phase);
    if (separateBike) add(game.bike.x, game.bike.y, () => drawPose(c, art, 'bike', game.bike.dir, 0, game.bike.x, game.bike.y));
    add(p.x, p.y + .1, () => {
      ellipse(c, p.x, p.y - 1, separateBike ? 12 : 24, 5, '#47463845');
      if (phase === 'mail' && art.playerActions) drawHaruMail(c, art, character, p, game.poseProgress);
      else if (phase === 'mail') drawPose(c, art, 'mail', p.dir, game.poseProgress, p.x, p.y);
      else if (separateBike) drawExplorer(c, art, character, p);
      else if (phase === 'mount' || phase === 'remount') drawPose(c, art, 'mount', p.dir, game.poseProgress, p.x, p.y);
      else if (phase === 'dismount') drawPose(c, art, 'dismount', p.dir, game.poseProgress, p.x, p.y);
      else drawPose(c, art, 'ride', p.dir, p.pedal, p.x, p.y);
    });
    entries.sort((a, b) => a.y - b.y).forEach(entry => entry.draw());
  }

  briefing(c, character, time) {
    const art = this.assets;
    const bike = {x: 106, y: 95};
    const scale = .58;
    const preview = scale / SPRITE_SCALE;
    const distanceToBike = 46;
    const walkTime = distanceToBike / POSTAL_WALK_SPEED;
    const mountTime = postalDepartureMountTime(character.id, 'left');
    const departure = walkTime + mountTime;
    const t = time % (departure + 1.6);
    panel(c, 19, 77, 142, 27, '#e7dac1', 12);
    sprite(c, art.office, 136, 85, 62, 55);
    sprite(c, art.tree, 39, 82, 28, 39);
    if (t < walkTime) {
      const [dx, dy] = POSTAL_BIKE_STANDS.left;
      drawPose(c, art, 'bike', 'left', 0, bike.x, bike.y, scale);
      drawExplorer(c, art, character, {
        x: bike.x + (dx + distanceToBike - t * POSTAL_WALK_SPEED) * preview,
        y: bike.y + dy * preview, dir: 'left', moving: true, walk: t, hammerAge: 99,
      }, preview);
    } else if (t < departure) {
      drawPose(c, art, 'mount', 'left', (t - walkTime) / mountTime, bike.x, bike.y, scale);
    } else {
      const travel = (t - departure) * 53;
      drawPose(c, art, 'ride', 'left', (travel / preview / POSTAL_PEDAL_DISTANCE) % 1, bike.x - travel, bike.y, scale);
    }
  }

  effect(type, x, y) {
    if (type === 'card' && Number.isFinite(x) && Number.isFinite(y)) this.effects.push({x, y, age: 0});
  }
}
