import {spriteAnchor} from './layout.js';
import {ROOM_HERO_SIZE} from './hero-scale.js';
import {heroWalkFrame} from './walk-cycle.js';
import {drawSideWalk} from './side-walk.js?v=155';

// The temple costume is independent of the hero's normal outfit. Row zero
// contains planted-foot idle poses; the remaining rows contain walking cycles.
export function templeHeroFrame(p){
 const side=p.dir==='left'||p.dir==='right';
 const direction=p.dir==='up'?1:side?2:0;
 if(!p.moving)return {col:direction,row:0,mirror:p.dir==='left'};
 const frame=heroWalkFrame(p.walk,direction);
 // Opposite steps are separate drawings, not a mirrored face/costume.
 return {col:frame,row:direction+1,mirror:side&&p.dir==='left'};
}

export function drawTempleHero(c,images,character,p,scale=1){
 const frame=templeHeroFrame(p),im=images[`${character.id}-armor.webp`];
 c.save();spriteAnchor(c,p.x,p.y);c.scale((frame.mirror?-1:1)*scale,scale);
 const size=ROOM_HERO_SIZE,top=-size*53.4/56;
 if(frame.row===3)drawSideWalk(c,im,p.walk,frame.row,-size/2,top,size);
 else c.drawImage(im,frame.col*256,frame.row*256,256,256,-size/2,top,size,size);
 c.restore();
}
