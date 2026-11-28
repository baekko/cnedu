import {HISTORY_PEOPLE_ART} from './history-people-art-v130.js';
import {HISTORY_DINOSAUR_ART} from './history-dinosaur-art-v99.js';
import {HISTORY,HISTORY_ACTORS} from './history-core.js?v307';
export const HISTORY_MOB_ART=Object.freeze({...HISTORY_PEOPLE_ART,...HISTORY_DINOSAUR_ART});
export function historyMobFrame(m){
 const art=HISTORY_MOB_ART[m.kind],direction=m.dir==='left'?'right':m.dir;
 // Phase follows travelled ground distance; fast guardians stride faster rather
 // than sliding the same four-frame cadence across the floor.
 if(m.moving){const stride=m.kind.startsWith('dino')?HISTORY_ACTORS.dinosaurStride:56,frame=Math.floor((m.walk||0)*HISTORY.speed*m.factor/stride*art.frames)%art.frames;return {art,row:art.walkRows[direction],column:art.sequences?.[direction]?.[frame]??frame};}
 const idle=art.idle[direction];return {art,row:typeof idle==='number'?Math.floor(idle/art.columns):idle.row,column:typeof idle==='number'?idle%art.columns:idle.column};
}
