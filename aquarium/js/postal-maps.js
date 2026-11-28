const themes = [
  { grass: '#a3b981', road: '#e4d6ba', shoulder: '#c8b998', edge: '#82956b' },
  { grass: '#a5b997', road: '#e5ddcf', shoulder: '#c7bdad', edge: '#809780' },
  { grass: '#b9b982', road: '#e5cdad', shoulder: '#c6ad8c', edge: '#9b9c70' },
  { grass: '#9fb895', road: '#d8d5c4', shoulder: '#b9baa7', edge: '#799578' },
  { grass: '#bcb48c', road: '#ead9b6', shoulder: '#d0b995', edge: '#a29a74' },
  { grass: '#a5b78c', road: '#dfdbd2', shoulder: '#bab8ad', edge: '#809477' },
  { grass: '#b2b38d', road: '#e3cdab', shoulder: '#c6ad8b', edge: '#919473' },
];

// Rows run north to south. Each group of turnoffs joins two consecutive streets.
// The west and east tails control where the street continues past its last turnoff.
const plans = [
  { id: 'willow', width: 2630, height: 1490, theme: 0, main: 1,
    columns: [322, 902, 1515, 2102], turnoffs: [[0, 1, 2], [1, 3], [0, 1, 3]], tails: [[160, 487], [0, 0], [155, 177], [167, 280]] },
  { id: 'stonewall', width: 2500, height: 1506, theme: 2, main: 2,
    columns: [345, 907, 1456, 1993], turnoffs: [[1, 2, 3], [0, 2, 3], [0, 1, 2]], tails: [[510, 153], [121, 210], [0, 0], [190, 500]] },
  { id: 'chestnut', width: 2810, height: 1520, theme: 3, main: 1,
    columns: [343, 1074, 1689, 2245], turnoffs: [[0, 2, 3], [0, 1, 3], [1, 2]], tails: [[184, 167], [0, 0], [110, 210], [365, 660]] },
  { id: 'persimmon', width: 2660, height: 1480, theme: 4, main: 2,
    columns: [275, 893, 1586, 2075], turnoffs: [[0, 1], [0, 2, 3], [1, 2, 3]], tails: [[109, 620], [135, 186], [0, 0], [551, 241]] },
  { id: 'ginkgo', width: 2870, height: 1548, theme: 6, main: 1,
    columns: [399, 1031, 1698, 2239], turnoffs: [[1, 2, 3], [0, 1, 2], [0, 3]], tails: [[558, 248], [0, 0], [188, 278], [182, 218]] },
  { id: 'apricot', width: 2460, height: 1460, theme: 1, main: 2,
    columns: [326, 875, 1417, 1922], turnoffs: [[0, 2, 3], [1, 2, 3], [0, 1]], tails: [[195, 173], [468, 150], [0, 0], [197, 740]] },
  { id: 'reeds', width: 2750, height: 1530, theme: 5, main: 1,
    columns: [384, 986, 1614, 2120], turnoffs: [[1, 3], [0, 2, 3], [0, 1, 2]], tails: [[566, 311], [0, 0], [260, 230], [193, 498]] },
  { id: 'sunflower', width: 2610, height: 1514, theme: 4, main: 2,
    columns: [316, 929, 1529, 2049], turnoffs: [[0, 1, 3], [1, 2, 3], [0, 2]], tails: [[149, 169], [583, 187], [0, 0], [180, 720]] },
  { id: 'pine', width: 2790, height: 1540, theme: 3, main: 1,
    columns: [340, 1042, 1677, 2173], turnoffs: [[0, 2, 3], [0, 1, 2], [1, 3]], tails: [[205, 237], [0, 0], [147, 192], [548, 253]] },
  { id: 'plum', width: 2570, height: 1488, theme: 1, main: 2,
    columns: [293, 876, 1496, 2021], turnoffs: [[0, 2], [0, 1, 3], [1, 2, 3]], tails: [[179, 535], [145, 183], [0, 0], [525, 149]] },
  { id: 'bluehill', width: 2900, height: 1544, theme: 0, main: 1,
    columns: [429, 1095, 1674, 2293], turnoffs: [[0, 1, 3], [0, 2, 3], [1, 2, 3]], tails: [[244, 202], [0, 0], [257, 258], [562, 207]] },
  { id: 'bamboo', width: 2670, height: 1518, theme: 5, main: 2,
    columns: [309, 970, 1604, 2081], turnoffs: [[1, 2], [0, 1, 3], [0, 2, 3]], tails: [[470, 585], [171, 265], [0, 0], [167, 212]] },
  { id: 'oaks', width: 2550, height: 1480, theme: 2, main: 1,
    columns: [328, 903, 1474, 1990], turnoffs: [[0, 2, 3], [1, 2], [0, 1, 3]], tails: [[146, 165], [0, 0], [201, 186], [199, 225]] },
  { id: 'morning', width: 2820, height: 1540, theme: 4, main: 2,
    columns: [368, 1051, 1735, 2215], turnoffs: [[0, 1, 2], [0, 2, 3], [1, 2, 3]], tails: [[221, 661], [184, 198], [0, 0], [573, 139]] },
  { id: 'meadow', width: 2510, height: 1473, theme: 0, main: 1,
    columns: [341, 899, 1479, 1966], turnoffs: [[0, 1, 3], [0, 2, 3], [0, 2]], tails: [[195, 165], [0, 0], [164, 169], [200, 663]] },
  { id: 'magnolia', width: 2860, height: 1530, theme: 1, main: 2,
    columns: [433, 1061, 1714, 2207], turnoffs: [[1, 2, 3], [0, 1, 2], [0, 1, 3]], tails: [[645, 192], [195, 267], [0, 0], [245, 155]] },
  { id: 'crescent', width: 2680, height: 1506, theme: 6, main: 1,
    columns: [343, 966, 1557, 2131], turnoffs: [[0, 3], [1, 2, 3], [0, 1, 2]], tails: [[188, 207], [0, 0], [175, 190], [147, 668]] },
  { id: 'camellia', width: 2720, height: 1498, theme: 3, main: 2,
    columns: [362, 972, 1623, 2177], turnoffs: [[0, 1, 3], [0, 2], [1, 3]], tails: [[206, 213], [172, 142], [0, 0], [553, 179]] },
  { id: 'brick', width: 2490, height: 1475, theme: 2, main: 1,
    columns: [291, 862, 1433, 1975], turnoffs: [[0, 2, 3], [0, 1, 3], [1, 2]], tails: [[148, 147], [0, 0], [139, 161], [520, 640]] },
  { id: 'orchard', width: 2830, height: 1538, theme: 5, main: 2,
    columns: [377, 1024, 1696, 2242], turnoffs: [[0, 1, 3], [1, 2, 3], [0, 2, 3]], tails: [[230, 193], [611, 196], [0, 0], [150, 145]] },
  { id: 'beech', width: 2770, height: 1528, theme: 6, main: 1,
    columns: [336, 1003, 1656, 2158], turnoffs: [[0, 1, 2], [0, 2, 3], [1, 2, 3]], tails: [[195, 620], [0, 0], [152, 181], [583, 172]] },
];

const officeSize = { width: 184, height: 145 };
const plotWidth = 142;
const houseDepth = 119;
const neighborGap = 11;
const propSizes = {
  recycling: { width: 72, height: 41 },
  bench: { width: 60, height: 32 },
  lamppost: { width: 22, height: 64 },
  cat: { width: 36, height: 32 },
  flowers: { width: 34, height: 21 },
  shrubs: { width: 38, height: 26 },
  tree: { width: 82, height: 78 },
};

function road(x1, y1, x2, y2, width) {
  return { x1, y1, x2, y2, width };
}

function roadBounds({ x1, y1, x2, y2, width }) {
  const half = width / 2;
  return { left: x1 - half, right: x2 + half, top: y1 - half, bottom: y2 + half };
}

function plotBounds({ x, y, width, height }) {
  return { left: x, right: x + width, top: y, bottom: y + height };
}

function spriteBounds({ x, y }, { width, height }) {
  return { left: x - width / 2, right: x + width / 2, top: y - height, bottom: y };
}

function intersects(a, b, gap = 0) {
  return a.left < b.right + gap && a.right > b.left - gap
    && a.top < b.bottom + gap && a.bottom > b.top - gap;
}

function insideVillage(bounds, village) {
  return bounds.left >= 16 && bounds.right <= village.width - 16
    && bounds.top >= 16 && bounds.bottom <= village.height - 16;
}

function subtract(interval, blockers) {
  const free = [];
  let start = interval[0];
  for (const [left, right] of blockers.sort((a, b) => a[0] - b[0])) {
    if (right <= start || left >= interval[1]) continue;
    if (left > start) free.push([start, left]);
    start = Math.max(start, right);
  }
  if (start < interval[1]) free.push([start, interval[1]]);
  return free;
}

function frontageGroups(village, streets, occupied) {
  const obstacles = [...village.roads.map(roadBounds), ...occupied];
  return streets.flatMap((street, row) => ['north', 'south'].flatMap(side => {
    const north = side === 'north';
    const y = street.y1 + (north ? -street.width / 2 - 8 - houseDepth : street.width / 2 + 8);
    const blockers = obstacles
      .filter(({ top, bottom }) => y < bottom + 4 && y + houseDepth > top - 4)
      .map(({ left, right }) => [Math.floor(left - 11), Math.ceil(right + 11)]);
    const from = street.x1 + 20;
    // Give opposite frontages slightly different setbacks at dead ends.
    const to = street.x2 - (north ? 39 : 21);
    const streetGroups = subtract([from, to], blockers).map(([left, right]) => ({
      street, row, side, y, left, right,
      count: Math.min(7, Math.floor((right - left + neighborGap) / (plotWidth + neighborGap))),
    }));
    return streetGroups.filter(group => group.count >= 3);
  }));
}

function housesForGroup(group, count, index) {
  const { street, side, y, left, right } = group;
  const occupiedWidth = count * plotWidth + (count - 1) * neighborGap;
  const inset = (right - left - occupiedWidth) * (side === 'north' ? 0.39 : 0.61);
  const north = side === 'north';
  const edge = street.width / 2 - 3;
  return Array.from({ length: count }, (_, spot) => {
    const plot = { x: Math.round(left + inset + spot * (plotWidth + neighborGap)), y, width: plotWidth, height: houseDepth };
    const x = plot.x + plot.width / 2;
    const mailboxX = x + (north ? -4 : 4);
    return {
      x, y: plot.y + plot.height - (north ? 29 : 9),
      art: (index * 5 + group.row * 3 + spot + Math.floor(spot / 3) + (north ? 0 : 4)) % 8,
      side, plot, stop: { x: mailboxX, y: street.y1 },
      box: { x: mailboxX, y: street.y1 + (north ? -edge : edge) },
    };
  });
}

function groupCenter(group) {
  return (group.left + group.right) / 2;
}

function addHouses(village, streets, mainIndex, occupied, index) {
  const groups = frontageGroups(village, streets, occupied);
  const picked = new Set();
  const add = (group, count = group.count) => {
    const homes = housesForGroup(group, count, index);
    for (const home of homes) {
      const opposite = village.houses.find(house => house.stop.y === home.stop.y
        && house.side !== home.side && Math.abs(house.stop.x - home.stop.x) < 8);
      if (!opposite) continue;
      // Stagger opposing mailboxes so either can be selected from the center of the road.
      home.stop.x += home.stop.x < opposite.stop.x ? -8 : 8;
      home.box.x = home.stop.x;
    }
    picked.add(group);
    village.houses.push(...homes);
    occupied.push(...homes.map(house => plotBounds(house.plot)));
  };

  // Populate both sides of every street before filling the gaps between blocks.
  // Keep the nearest south-side row occupied when the camera first leaves the office.
  for (let row = 0; row < streets.length; row++) {
    for (const side of ['north', 'south']) {
      const center = ((row * 2 + index + (side === 'north' ? 0 : 1)) % 4 + 1) * village.width / 5;
      const order = groups.filter(group => group.row === row && group.side === side);
      if (row === mainIndex && side === 'south') order.sort((a, b) => b.right - a.right);
      else order.sort((a, b) => Math.abs(groupCenter(a) - center) - Math.abs(groupCenter(b) - center));
      if (order.length) add(order[0], Math.min(order[0].count, 5));
    }
  }

  while (village.houses.length < 46) {
    const remaining = groups.filter(group => !picked.has(group));
    const density = group => village.houses.filter(house => house.stop.y === group.street.y1).length;
    remaining.sort((a, b) => density(a) - density(b) || b.count - a.count || a.left - b.left);
    if (!remaining.length) break;
    add(remaining[0], Math.min(remaining[0].count, Math.max(3, 48 - village.houses.length)));
  }

  village.houses.sort((a, b) => a.stop.y - b.stop.y || b.stop.x - a.stop.x);
  village.houses.forEach((house, i) => { house.id = i + 1; });
  return groups.filter(group => !picked.has(group));
}

function chooseCandidates(village, streets, index) {
  const chosen = [];
  streets.forEach((street, row) => {
    const homes = village.houses.filter(house => house.stop.y === street.y1);
    const north = homes.filter(house => house.side === 'north');
    const south = homes.filter(house => house.side === 'south');
    const east = (row + index) % 2 === 0 ? north : south;
    const west = (row + index) % 2 === 0 ? south : north;
    const first = (east.length ? east : homes)[Math.min(1, Math.max(0, east.length - 1))];
    const last = west.findLast(house => house !== first) || homes.findLast(house => house !== first);
    chosen.push(first, last);
  });
  const extra = village.houses.find(house => house.stop.y === village.office.bike.y && !chosen.includes(house));
  return [...chosen, extra].map(house => house.id);
}

function makeRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function vergeLamp(road, along, side, setback, variant) {
  const kind = 'lamppost';
  const edge = road.width / 2 + setback;
  return road.y1 === road.y2
    ? { kind, x: along, y: road.y1 + edge * side, variant }
    : { kind, x: road.x1 + edge * side, y: along, variant };
}

function vergeRecycling(street, x, side, variant, setback) {
  const edge = street.width / 2 + setback;
  const y = street.y1 + edge * side + (side > 0 ? propSizes.recycling.height : 0);
  return { kind: 'recycling', x, y, variant };
}

function junctionsFor(road, roads) {
  if (road.y1 === road.y2) {
    return roads.filter(other => other.x1 === other.x2 && other.x1 >= road.x1 && other.x1 <= road.x2
      && other.y1 <= road.y1 && other.y2 >= road.y1).map(other => other.x1);
  }
  return roads.filter(other => other.y1 === other.y2 && other.y1 >= road.y1 && other.y1 <= road.y2
    && other.x1 <= road.x1 && other.x2 >= road.x1).map(other => other.y1);
}

function vergePositions(street, min, max, preferred) {
  const length = street.x2 - street.x1;
  const start = street.x1 + length * min;
  const end = street.x1 + length * max;
  const center = street.x1 + length * preferred;
  return Array.from({ length: Math.floor((end - start) / 28) + 1 }, (_, slot) => start + slot * 28)
    .sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
}

function deliveryClearances(village) {
  const mailboxes = village.houses.map(({ box }) => ({
    left: box.x - 23, right: box.x + 23, top: box.y - 32, bottom: box.y + 12,
  }));
  const { door, bike } = village.office;
  const officeApproach = { left: door.x - 36, right: door.x + 36, top: door.y - 8, bottom: bike.y + 5 };
  return [...mailboxes, officeApproach];
}

function terrainDetailBounds(village) {
  // Include the shadows painted outside the projected plots and garden beds.
  const yardShadows = village.houses.map(({ plot: { x, y, width, height } }) =>
    plotBounds({ x: x + 4, y: y + 6, width: width - 1, height: height - 2 }));
  const gardenEdges = village.gardens.map(({ x, y, width, height }) =>
    plotBounds({ x: x - 3, y: y - 3, width: width + 6, height: height + 6 }));
  return [...yardShadows, ...gardenEdges];
}

function addProps(village, streets, occupied, vacantFrontages, index) {
  const random = makeRandom(11239 + index * 7349);
  const roadAreas = village.roads.map(roadBounds);
  const rideableAreas = roadAreas.map(({ left, right, top, bottom }) => ({
    left: left + 9, right: right - 9, top: top + 9, bottom: bottom - 9,
  }));
  const place = (...pieces) => {
    const props = pieces.map(piece => ({ ...piece, x: Math.round(piece.x), y: Math.round(piece.y) }));
    const bounds = props.map(prop => {
      const { width, height } = propSizes[prop.kind];
      const area = spriteBounds(prop, { width: width + 2 * (prop.roam || 0), height });
      if (prop.kind === 'cat') area.bottom += 5;
      if (prop.kind === 'tree') area.bottom += 7;
      return area;
    });
    for (const [i, area] of bounds.entries()) {
      const prop = props[i];
      const lamp = prop.kind === 'lamppost';
      const gap = lamp ? 2 : 6;
      if (!insideVillage(area, village) || occupied.some(other => intersects(area, other, gap))
        || bounds.slice(0, i).some(other => intersects(area, other, gap))) return false;
      // The full lamp clears the scenery, while only its foot needs to clear the riding surface.
      if (lamp) {
        const foot = { left: prop.x - 9, right: prop.x + 9, top: prop.y - 4, bottom: prop.y };
        if (rideableAreas.some(road => intersects(foot, road))) return false;
      } else if (roadAreas.some(road => intersects(area, road, 7))) {
        return false;
      }
    }
    village.props.push(...props);
    occupied.push(...bounds);
    return true;
  };

  // Space lights along every street and alley, moving a lamp to the next clear verge if needed.
  const shifts = [0];
  for (let distance = 4; distance <= 152; distance += 4) shifts.push(-distance, distance);
  for (const [roadIndex, road] of village.roads.entries()) {
    const horizontal = road.y1 === road.y2;
    const start = (horizontal ? road.x1 : road.y1) + 64;
    const end = (horizontal ? road.x2 : road.y2) - 64;
    const count = Math.max(1, Math.ceil((end - start) / (roadIndex === 0 ? 310 : 350)));
    const junctions = junctionsFor(road, village.roads);
    const setbacks = horizontal ? [4, 1] : [13, 8, 4, 0];
    const placed = [];
    for (let slot = 0; slot < count; slot++) {
      const center = start + (slot + .5) * (end - start) / count;
      const side = (roadIndex + slot + index) % 2 ? -1 : 1;
      for (const shift of shifts) {
        const along = Math.round(center + shift);
        if (along < start || along > end || junctions.some(crossing => Math.abs(crossing - along) < 77)
          || placed.some(previous => Math.abs(previous - along) < 132)) continue;
        if ([side, -side].some(edge => setbacks.some(setback => place(vergeLamp(road, along, edge, setback, (index + slot) % 3))))) {
          placed.push(along);
          break;
        }
      }
    }
  }

  const parks = [];
  const recyclingStops = [];
  function plantPark(x, y, variant) {
    return place(
      { kind: 'tree', x: x - 79, y: y - 4, variant },
      { kind: 'tree', x: x + 81, y: y + 1, variant: (variant + 1) % 3 },
      { kind: 'bench', x, y, variant },
      { kind: 'flowers', x: x - 24, y: y + 35, variant },
      { kind: 'flowers', x: x + 24, y: y + 36, variant: (variant + 1) % 3 },
    );
  }

  function plantBenchGarden(x, y, variant) {
    return place(
      { kind: 'bench', x, y, variant },
      { kind: 'shrubs', x: x - 55, y: y - 9, variant },
      { kind: 'flowers', x: x + 54, y: y + 16, variant },
    );
  }

  for (const [row, street] of streets.entries()) {
    const side = (row + index) % 2 ? -1 : 1;
    const variant = (row + index) % 3;
    const frontages = vacantFrontages.filter(frontage => frontage.street === street);
    const parkSites = [
      ...frontages.flatMap(frontage => [frontage.left + 118, frontage.right - 118]),
      ...vergePositions(street, .07, .93, side < 0 ? .42 : .58),
    ];
    for (const park of [plantPark, plantBenchGarden]) {
      const sides = [side, -side];
      const compact = park === plantBenchGarden;
      const site = parkSites.flatMap(x => sides.map(verge => ({
        x, y: street.y1 + verge * (street.width / 2 + (verge < 0 ? (compact ? 33 : 53) : (compact ? 64 : 99))),
      }))).find(({ x, y }) => park(x, y, variant));
      if (!site) continue;
      parks.push(site);
      break;
    }

    // Give both halves of the district a collection point on an open roadside verge.
    const junctions = junctionsFor(street, village.roads);
    const halves = [[.02, .46, .23], [.54, .98, .77]];
    for (const [half, fractions] of halves.entries()) {
      const positions = vergePositions(street, ...fractions)
        .filter(along => junctions.every(crossing => Math.abs(along - crossing) >= 90));
      const verge = half ? -side : side;
      const stop = [17, 40, 64].flatMap(setback => positions.flatMap(along =>
        [verge, -verge].map(edge => vergeRecycling(street, along, edge, variant, setback)),
      )).find(candidate => place(candidate));
      if (stop) recyclingStops.push(stop);
    }
  }

  let groveCount = 0;
  function plantGrove(x, y, variant) {
    if (!place({ kind: 'tree', x: x - 48 - variant * 2, y: y - 15 + variant * 12, variant },
      { kind: 'tree', x: x + 48, y: y + 8 - variant * 7, variant: (variant + 1) % 3 })) return false;
    groveCount++;
    place({ kind: groveCount % 3 ? 'shrubs' : 'flowers', x, y: y + 49, variant });
    return true;
  }

  // Keep the planting in small stands at the outer edge and behind garden plots.
  village.gardens.forEach((garden, slot) => {
    const x = garden.x + garden.width / 2;
    const variant = (index + slot) % 3;
    [garden.y - 21, garden.y + garden.height + 104].some(y => plantGrove(x, y, variant));
  });
  for (let edge = 0; edge < 4; edge++) {
    for (let slot = 0; slot < 3; slot++) {
      for (let attempt = 0; attempt < 15; attempt++) {
        const fraction = (slot + .3 + random() * .4) / 3;
        const horizontal = edge < 2;
        const offset = random() * 27;
        const x = horizontal ? 124 + fraction * (village.width - 248) : edge === 2 ? 110 + offset : village.width - 110 - offset;
        const y = horizontal ? (edge === 0 ? 108 + offset : village.height - 40 - offset) : 150 + fraction * (village.height - 260);
        if (plantGrove(x, y, (index + slot + edge) % 3)) break;
      }
    }
  }

  // Reserve the full horizontal path so roaming cats stay clear of yards and rideable streets.
  for (const [slot, site] of [...parks, ...recyclingStops].entries()) {
    if (village.props.filter(prop => prop.kind === 'cat').length >= 5) break;
    const variant = (index + slot) % 4;
    const offsets = [[0, -100], [0, 67], [-139, 10], [139, 10], [-98, 48], [98, 48], [0, -55]];
    for (const [dx, dy] of offsets) {
      const roam = dy === -55 ? 18 : 25 + variant * 4;
      if (place({ kind: 'cat', x: site.x + dx, y: site.y + dy, variant, roam })) break;
    }
  }

  // Add a few stands to unoccupied blocks after the roadside spaces and paths are reserved.
  for (let attempt = 0; attempt < 100 && groveCount < 15; attempt++) {
    const street = streets[attempt % streets.length];
    const side = (Math.floor(attempt / streets.length) + index) % 2 ? -1 : 1;
    const x = 120 + random() * (village.width - 240);
    const y = street.y1 + side * (street.width / 2 + 71 + random() * 58);
    plantGrove(x, y, (index + attempt) % 3);
  }

  // Fill public green space last so the reserved roads, lots and existing
  // furniture and animal routes retain their original clearances.
  const groveTrees = village.props.filter(prop => prop.kind === 'tree');
  const propsBeforePlanting = village.props.length;
  const plantPublicTree = (x, y) => place({ kind: 'tree', x, y });
  for (let x = 125; x < village.width - 100; x += 130 + random() * 30) {
    plantPublicTree(x, 109 + random() * 32);
    plantPublicTree(x + 24, village.height - 37 - random() * 49);
  }
  for (const { x, y } of parks) {
    plantPublicTree(x - 149, y + 38);
    plantPublicTree(x + 144, y + 31);
    plantPublicTree(x - 121, y - 65);
    plantPublicTree(x + 114, y - 59);
  }
  for (let y = 283; y < village.height - 180; y += 112 + random() * 27) {
    plantPublicTree(73 + random() * 100, y);
    plantPublicTree(village.width - 78 - random() * 107, y + 37);
  }
  for (let i = 0; i < groveTrees.length * 3 && village.props.length - propsBeforePlanting < 25; i++) {
    const { x, y } = groveTrees[i % groveTrees.length];
    const angle = random() * 2 * Math.PI;
    const radius = 98 + random() * 84;
    plantPublicTree(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
}

function addGardens(village, vacantFrontages, occupied, index) {
  vacantFrontages.forEach((frontage, slot) => {
    const width = Math.min(258, frontage.right - frontage.left - 40);
    const height = 80;
    const x = Math.round(groupCenter(frontage) - width / 2);
    const y = frontage.y + (frontage.side === 'north' ? 26 : 14);
    const garden = {x, y, width, height, variant: (index + slot) % 3};
    const bounds = plotBounds(garden);
    if (width < 130 || occupied.some(area => intersects(bounds, area, 11))) return;
    occupied.push(bounds);
    village.gardens.push(garden);
  });
}

function buildVillage(plan, index) {
  const { id, width, height, main, columns, turnoffs, tails } = plan;
  const top = 204 + (index % 4) * 4;
  const bottom = height - 200 - (index % 3) * 5;
  const gap = (bottom - top) / 3;
  const rows = [top, Math.round(top + gap), Math.round(bottom - gap), bottom];
  const streets = rows.map((y, row) => {
    if (row === main) return road(107, y, width - 74, y, 92);
    const connected = [...(turnoffs[row - 1] || []), ...(turnoffs[row] || [])].map(column => columns[column]);
    const [west, east] = tails[row];
    return road(Math.max(100, Math.min(...connected) - west), y, Math.min(width - 108, Math.max(...connected) + east),
      y, 76 + ((row + index) % 3) * 2);
  });
  const alleys = turnoffs.flatMap((links, row) =>
    links.map(column => road(columns[column], rows[row], columns[column], rows[row + 1], 74 + (column % 2) * 4)));
  const mainY = rows[main];
  const officeX = width - 156;
  const officeY = mainY - 59;
  const office = { x: officeX, y: officeY, door: { x: officeX, y: officeY }, bike: { x: officeX, y: mainY } };
  const village = {
    id, width, height, roads: [streets[main], ...streets.filter((_, row) => row !== main), ...alleys],
    houses: [], candidateIds: [], office, props: [], gardens: [], theme: themes[plan.theme],
  };
  const occupied = [spriteBounds(office, officeSize)];
  const gaps = addHouses(village, streets, main, occupied, index);
  village.candidateIds = chooseCandidates(village, streets, index);
  addGardens(village, gaps, occupied, index);
  occupied.push(...deliveryClearances(village), ...terrainDetailBounds(village));
  addProps(village, streets, occupied, gaps, index);
  return village;
}

export const POSTAL_VILLAGES = plans.map(buildVillage);
