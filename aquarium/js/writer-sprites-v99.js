import {sideWalkCell} from './side-walk.js?v=155';
import {WRITER_CARD_ART} from './writer-card-art-v99.js';
import {SIDE_HERO_SIZE} from './hero-scale.js';
export {WRITER_CARD_ART};
const rows={haru:0,doyun:1,narin:2,soi:3};
export function writerHeroSprite(g,character,images){
 const p=g.player,size=SIDE_HERO_SIZE*p.size,base={size,anchor:244/256,flip:p.dir==='left'&&!p.hidden};
 if(p.climbing){const f=Math.floor(p.climbDistance/12)%6;return {...base,file:'climb',column:f%3,row:Math.floor(f/3)};}
 if(p.hidden)return {...base,file:'idle',column:0,row:0};
 if(g.stunLeft>0||p.flying||!p.onGround)return {...base,file:'heroes',column:g.stunLeft>0?3:p.flying?2:p.vy<0?0:1,row:rows[character.id]};
 if(!p.moving)return {...base,file:'idle',column:3,row:0};
 const cell=sideWalkCell(images?.walk,p.walk,3);
 return {...base,file:'walk',column:cell.x/cell.size,row:cell.y/cell.size,cell:cell.size};
}
export function writerCardSprite(q){
 const frame=q.moving===false?WRITER_CARD_ART.idle:Math.floor((q.walk||0)/32*WRITER_CARD_ART.frames)%WRITER_CARD_ART.frames;
 return {frame,column:frame%4,row:Math.floor(frame/4),size:62,flip:q.dir==='left',anchor:244/256};
}
// Conservative broad phase for code-only simulations. The live game performs
// an additional exact visible-pixel check using these same rendered frames.
export function writerCardBodyContact(p,q){
 const s=p.size*SIDE_HERO_SIZE/56,dx=Math.abs(p.x-q.x),heroTop=p.y-43*s,cardTop=q.y-50;
 return dx<10*s+11&&p.y-2*s>cardTop&&heroTop<q.y-3;
}
