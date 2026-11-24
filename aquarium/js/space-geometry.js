// The station art, its hatch and the departure path share one coordinate system.
export const SPACE_STATION=Object.freeze({x:825,y:1225,width:1450,sourceWidth:1536,sourceHeight:1024});
export function stationPoint(x,y){const s=SPACE_STATION,k=s.width/s.sourceWidth;return {x:s.x+(x-s.sourceWidth/2)*k,y:s.y+(y-s.sourceHeight/2)*k};}
const mouth=stationPoint(995,885);
export const SPACE_EXIT=Object.freeze({x:mouth.x,y:mouth.y,rx:22.65,ry:34.93,dx:22,dy:86,seconds:1.1});

