const LAND = '#edf0e6';
const ROAD_EDGE = '#a5aa9e';
const ROAD_SURFACE = '#fffefa';
const HOUSE_EDGE = '#617773';
const HOUSE_FILL = '#91a4a0';
const TARGET_RED = '#b83f37';
const OFFICE_GREEN = '#27594e';
const MAP_LABEL_FONT = '700 76px "Noto Sans CJK KR", "Malgun Gothic", system-ui, sans-serif';

function streetBox({x1, y1, x2, y2, width}, padding) {
  const half = width / 2 + padding;
  return {
    x: Math.min(x1, x2) - half,
    y: Math.min(y1, y2) - half,
    width: Math.abs(x2 - x1) + 2 * half,
    height: Math.abs(y2 - y1) + 2 * half,
  };
}

function officeEntryBox(office, padding) {
  return {x: office.x - 34 - padding, y: office.y - 7, width: 68 + 2 * padding,
    height: office.bike.y - office.y + 13};
}

function paintStreets(c, village, padding, color) {
  c.beginPath();
  for (const road of village.roads) {
    const {x, y, width, height} = streetBox(road, padding);
    c.roundRect(x, y, width, height, 12);
  }
  const {x, y, width, height} = officeEntryBox(village.office, padding);
  c.roundRect(x, y, width, height, 8);
  c.fillStyle = color;
  c.fill();
}

function paintHouse(c, house, target) {
  const {x, y, width, height} = house.plot;
  c.fillStyle = target ? '#f9dfd6' : '#e2e7dd';
  c.fillRect(x, y, width, height);
  c.strokeStyle = target ? TARGET_RED : '#b9c4b8';
  c.lineWidth = target ? 8 : 5;
  c.strokeRect(x + 3, y + 3, width - 6, height - 6);

  const baseX = x + width * .18;
  const baseY = y + height * (house.side === 'north' ? .17 : .36);
  const baseWidth = width * .64;
  const baseHeight = height * .47;
  c.fillStyle = target ? '#ca7164' : HOUSE_FILL;
  c.fillRect(baseX, baseY, baseWidth, baseHeight);
  c.strokeStyle = target ? TARGET_RED : HOUSE_EDGE;
  c.lineWidth = 6;
  c.strokeRect(baseX, baseY, baseWidth, baseHeight);
}

function paintPin(c, {x, y, width, height}) {
  const centerX = x + width * .5;
  const tipY = y + height * .76;
  c.beginPath();
  c.moveTo(centerX, tipY);
  c.bezierCurveTo(centerX - 10, tipY - 17, centerX - 30, tipY - 25, centerX - 30, tipY - 46);
  c.arc(centerX, tipY - 46, 30, Math.PI, 2 * Math.PI);
  c.bezierCurveTo(centerX + 30, tipY - 25, centerX + 10, tipY - 17, centerX, tipY);
  c.closePath();
  c.fillStyle = TARGET_RED;
  c.fill();
  c.lineWidth = 7;
  c.lineJoin = 'round';
  c.strokeStyle = ROAD_SURFACE;
  c.stroke();
  c.beginPath();
  c.arc(centerX, tipY - 47, 9, 0, 2 * Math.PI);
  c.fillStyle = ROAD_SURFACE;
  c.fill();
}

function paintOffice(c, office) {
  const {x, y} = office;
  c.fillStyle = OFFICE_GREEN;
  c.fillRect(x - 92, y - 145, 184, 145);

  c.strokeStyle = ROAD_SURFACE;
  c.lineWidth = 9;
  c.lineJoin = 'round';
  c.strokeRect(x - 51, y - 102, 102, 61);
  c.beginPath();
  c.moveTo(x - 51, y - 101);
  c.lineTo(x, y - 69);
  c.lineTo(x + 51, y - 101);
  c.stroke();

  c.fillStyle = OFFICE_GREEN;
  c.textAlign = 'center';
  c.textBaseline = 'bottom';
  c.font = MAP_LABEL_FONT;
  c.fillText('우체국', x, y - 159, 278);
}

export function drawPostalMap(c, game, x, y, width, height) {
  const {village, destinations} = game;
  const scale = Math.min(width / village.width, height / village.height);
  const mapWidth = village.width * scale;
  const mapHeight = village.height * scale;
  c.save();
  c.translate(x + (width - mapWidth) / 2, y + (height - mapHeight) / 2);
  c.scale(scale, scale);
  c.fillStyle = LAND;
  c.fillRect(0, 0, village.width, village.height);
  paintStreets(c, village, 7, ROAD_EDGE);
  paintStreets(c, village, 0, ROAD_SURFACE);
  for (const house of village.houses) paintHouse(c, house, destinations.has(house.id));
  paintOffice(c, village.office);
  for (const house of village.houses) {
    if (destinations.has(house.id)) paintPin(c, house.plot);
  }
  c.restore();
}
