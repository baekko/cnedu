import {spriteAnchor} from './layout.js';
import {ROOM_HERO_SIZE} from './hero-scale.js';
import {heroWalkFrame} from './walk-cycle.js';
import {drawSideWalk,drawWalkLegs} from './side-walk.js?v=155';
// Planted-foot idle, vertical walking and side walking use distinct atlas rows.
export function drawExplorer(c,images,character,p,scale=1,view='room'){
 const side=p.dir==='left'||p.dir==='right',row=p.dir==='up'?1:side?(view==='flat'?3:2):0,hammer=p.hammerAge<.36;
 let file,col,sy=0;
 if(hammer){file=`${character.id}-adventure.webp`;col=p.hammerAge<.18?2:3;sy=row*256;}
 else if(p.moving){file=`${character.id}-walk.webp`;col=heroWalkFrame(p.walk,row);sy=row*256;}
 else{file=`${character.id}-idle.webp`;col=row;}
 const size=ROOM_HERO_SIZE,top=-size*53.4/56;c.save();spriteAnchor(c,p.x,p.y);c.scale((p.dir==='left'?-1:1)*scale,scale);
 if(side&&p.moving&&!hammer)drawSideWalk(c,images[file],p.walk,row,-size/2,top,size);
 else c.drawImage(images[file],col*256,sy,256,256,-size/2,top,size,size);
 c.restore();
}

// Carrying keeps both hands on the object and uses the same alternating legs.
// Native atlases share the 256px cell and foot anchor; join inside the shorts.
export function drawCarryCell(c,walkImage,carryImage,{row,frame=0,walking=false,walk=0,size=ROOM_HERO_SIZE,walkRow=row}){
 const top=-size*53.4/56;
 if(!walking){c.drawImage(carryImage,frame*256,row*256,256,256,-size/2,top,size,size);return;}
 drawHeldWalk(c,walkImage,carryImage,{walkRow,walk,size,sy:row*256});
}

// The seam is inside the shorts, below the entire hand/tool silhouette.
// Keep a coherent holding torso while sharing the normal alternating legs.
export function drawHeldWalk(c,walkImage,heldImage,{walkRow,walk=0,size=ROOM_HERO_SIZE,sx=0,sy=0,footY=256*53.4/56}){
 const k=size/256,seam=196;
 drawWalkLegs(c,walkImage,walk,walkRow,-size/2,-size*53.4/56,size);
 c.drawImage(heldImage,sx,sy,256,seam,-size/2,-footY*k,size,seam*k);
}
