import {sideWalkFrame} from './side-walk.js?v=155';

// Native 256px palm centers for the current walk and idle assets.
// Directions/rows: front, back, room right, flat right. Walk columns: 0..3 vertical, 0..5 horizontal.
// Coordinates are before any renderer translation, scale or left-facing flip.
// Front/back choose anatomical left; side views choose the near hand.
// Back row frame 2 uses visible RIGHT for haru/narin/soi because left is hidden.
// This exception is not a continuous same-hand carry cycle. Flat rows have no fallback.
// Measurements are approximate (+/-3 native pixels), not collider geometry.
// Passing poses use their own near-hand positions in columns 2 and 5.
export const HERO_GRIPS = {
  haru: {
    idle: [[171,179],[86,178],[100,184],[128,187]],
    walk: [
      [[165,171],[164,182],[156,175],[163,183]],
      [[87,179],[88,182],[169,181],[89,177]],
      [[84,170],[87,163],[174,142],[171,159],[179,149],[81,163]],
      [[92,175],[99,165],[172,142],[179,158],[179,147],[95,157]],
    ],
  },
  doyun: {
    idle: [[170,178],[87,177],[104,183],[120,183]],
    walk: [
      [[167,164],[167,183],[161,182],[168,183]],
      [[89,174],[88,175],[90,154],[88,174]],
      [[88,167],[90,158],[178,151],[165,157],[172,153],[90,168]],
      [[108,169],[100,162],[177,153],[178,150],[173,152],[100,161]],
    ],
  },
  narin: {
    idle: [[174,175],[86,175],[105,182],[127,183]],
    walk: [
      [[176,176],[169,176],[160,164],[169,178]],
      [[85,172],[87,174],[167,175],[86,174]],
      [[92,169],[90,165],[175,151],[165,155],[175,153],[89,163]],
      [[94,168],[102,170],[176,148],[178,150],[177,154],[98,166]],
    ],
  },
  soi: {
    idle: [[177,173],[88,173],[99,180],[130,181]],
    walk: [
      [[173,175],[166,174],[162,163],[169,176]],
      [[80,171],[82,172],[166,174],[84,173]],
      [[92,169],[92,167],[185,142],[166,156],[176,156],[90,163]],
      [[94,167],[109,171],[181,140],[186,147],[183,154],[105,162]],
    ],
  },
};

// Near-hand centers measured on the eight complete side-profile drawings.
// Kept in native 256px coordinates so food and lanterns follow the actual hand.
const SIDE_PALMS = {
  haru: [[106,185],[120,185],[130,191],[154,187],[163,181],[158,185],[138,189],[116,186]],
  doyun: [[102,174],[118,174],[128,178],[150,171],[163,175],[155,174],[137,181],[116,171]],
  narin: [[103,173],[114,178],[126,185],[161,176],[162,171],[156,175],[140,184],[115,172]],
  soi: [[116,179],[124,177],[132,183],[157,175],[163,177],[157,176],[139,187],[116,179]],
};

export function sideWalkPalm(id,seconds){
 return (SIDE_PALMS[id]||SIDE_PALMS.haru)[sideWalkFrame(seconds)];
}
