import {SPRAY_NOZZLES} from './garden-spray-anchors.js';
// The gameplay ray and the held-sprayer artwork share these nozzle anchors.
export const SPRAY_RIG=Object.freeze({
 up:{x:14,y:-34,dx:0,dy:-1},
 down:{x:0,y:-26,dx:0,dy:1},
 right:{x:11,y:-27,dx:1,dy:0},
 left:{x:-11,y:-27,dx:-1,dy:0}
});
export function sprayMuzzle(player,characterId='haru'){const dir=player.dir||'up',q=SPRAY_RIG[dir],anchor=SPRAY_NOZZLES[characterId]?.[dir==='left'?'right':dir]||SPRAY_RIG[dir==='left'?'right':dir];return {x:player.x+(dir==='left'?-anchor.x:anchor.x),y:player.y+anchor.y,dx:q.dx,dy:q.dy};}
