const FAR_END = {x: -220, top: 325, bottom: 450};
const MOUTH = {x: 170, top: 398, bottom: 411};

export function writerGust(house) {
  return {
    left: house.x + FAR_END.x,
    right: house.x + MOUTH.x,
    farTop: FAR_END.top,
    farBottom: FAR_END.bottom,
    mouthTop: MOUTH.top,
    mouthBottom: MOUTH.bottom,
  };
}

export function gustCrossSection(gust,x) {
  const distance = (gust.right - x) / (gust.right - gust.left);
  return {
    top: gust.mouthTop + (gust.farTop - gust.mouthTop) * distance,
    bottom: gust.mouthBottom + (gust.farBottom - gust.mouthBottom) * distance,
  };
}

export function gustHits(gust,body) {
  const left = Math.max(gust.left,body.x);
  if (left >= Math.min(gust.right,body.x + body.w)) return false;
  // The air widens toward its front, so the leftmost overlap has the tallest cross section.
  const {top,bottom} = gustCrossSection(gust,left);
  return body.y < bottom && body.y + body.h > top;
}
