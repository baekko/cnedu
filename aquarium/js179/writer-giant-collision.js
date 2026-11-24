import {GIANT_ART_V101} from './writer-giant-art-v101.js';
import {GIANT_POSES} from './writer-giant-poses.js';
import {GIANT_ATTACK_ART_V102} from './writer-giant-hand-v102.js';
import {writerHeroSprite} from './writer-sprites-v99.js?v=155';
import {SIDE_HERO_SIZE} from './hero-scale.js';

// Use the same complete pose as the renderer, including both foreground hands.
// The giant's body/boots remain behind the beanstalk; no large body rectangle
// or warning-shadow rectangle is added to the playable side of the stem.
export function giantHandPolygons(g,x,size){
 const pose=g.giantPose,s=size/512,ox=x-size/2,oy=g.giant.displayY-size/2;
 const polygons=pose.original?GIANT_POSES[pose.frame].hands.map((h,i)=>pose.frame===2&&i===0?GIANT_ATTACK_ART_V102.handPolygon:h.polygon):GIANT_ART_V101.frames[pose.frame].handPolygons;
 return polygons.map(points=>points.map(([px,py])=>[ox+px*s,oy+py*s]));
}

function polygonOverlapsRect(points,r){
 let clipped=points;
 for(const [axis,bound,sign] of [[0,r.x,1],[0,r.x+r.w,-1],[1,r.y,1],[1,r.y+r.h,-1]]){
  const input=clipped;clipped=[];
  for(let i=0;i<input.length;i++){
   const a=input[i],b=input[(i+1)%input.length],insideA=(a[axis]-bound)*sign>=0,insideB=(b[axis]-bound)*sign>=0;
   if(insideA)clipped.push(a);
   if(insideA!==insideB){const t=(bound-a[axis])/(b[axis]-a[axis]);clipped.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
  }
  if(clipped.length<3)return false;
 }
 let area=0;for(let i=0;i<clipped.length;i++){const a=clipped[i],b=clipped[(i+1)%clipped.length];area+=a[0]*b[1]-b[0]*a[1];}
 return Math.abs(area)>1e-5;
}

// Code-only simulations use the illustrated outlines. The live game further
// requires actual opaque hero/hand pixels to overlap, excluding empty padding.
export function giantHandsContact(g,x,size){
 const p=g.player,s=p.size*SIDE_HERO_SIZE/56,r={x:p.x-13*s,y:p.y-49*s,w:26*s,h:49*s};
 return giantHandPolygons(g,x,size).some(points=>polygonOverlapsRect(points,r));
}

export function giantPixelsTouch(hero,px,py,hand,x,y,size){
 const dx=Math.round(px-64-x),dy=Math.round(py-112-y);
 for(let i=0;i<hero.points.length;i+=2){const hx=hero.points[i]+dx,hy=hero.points[i+1]+dy;if(hx>=0&&hx<size&&hy>=0&&hy<size&&hand[hy*size+hx])return true;}
 return false;
}

export function createWriterGiantCollider(images,character,{x,size},sharedHeroMask){
 const hands=new Map(),heroes=new Map();
 const alpha=(canvas)=>{const data=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height).data,solid=new Uint8Array(canvas.width*canvas.height),points=[];for(let i=0;i<solid.length;i++)if(data[i*4+3]>=128){solid[i]=1;points.push(i%canvas.width,Math.floor(i/canvas.width));}return {solid,points};};
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 function handMask(pose){
  const key=(pose.original?'attack:':'climb:')+pose.frame;
  if(!hands.has(key)){
   const cell=canvas(512,512),c=cell.getContext('2d');
   if(pose.original){
    const frame=pose.frame,corrected=frame===2;c.save();c.beginPath();
    for(const hand of GIANT_POSES[frame].hands.filter((_,i)=>!corrected||i===1)){hand.polygon.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();}c.clip();
    c.drawImage(images[corrected?'giant-attack-corrected':'giant-v39'],corrected?0:frame%2*512,corrected?0:Math.floor(frame/2)*512,512,512,0,0,512,512);c.restore();
    if(corrected)c.drawImage(images['giant-attack-high-hand'],0,0);
   }
   const scaled=canvas(size,size),sc=scaled.getContext('2d');
   if(pose.original)sc.drawImage(cell,0,0,size,size);
   // Match the renderer's direct atlas crop; an intermediate cell can round
   // an antialiased edge differently from the frame actually on screen.
   else sc.drawImage(images['giant-climb-hands'],pose.frame%4*512,Math.floor(pose.frame/4)*512,512,512,0,0,size,size);
   hands.set(key,alpha(scaled).solid);
  }
  return hands.get(key);
 }
 function heroMask(g){
  if(sharedHeroMask)return sharedHeroMask(g);
  const f=writerHeroSprite(g,character,images),cell=f.cell??256,key=[f.file,f.column,f.row,g.player.size,f.flip].join(':');
  if(!heroes.has(key)){const im=canvas(128,128),c=im.getContext('2d');c.translate(64,112);if(f.flip)c.scale(-1,1);c.drawImage(images[f.file],f.column*cell,f.row*cell,cell,cell,-f.size/2,-f.size*f.anchor,f.size,f.size);heroes.set(key,alpha(im));}
  return heroes.get(key);
 }
 const touches=g=>{
  if(Math.abs(g.player.x-x)>size/2+28||Math.abs(g.player.y-g.giant.displayY)>size/2+56)return false;
  return giantPixelsTouch(heroMask(g),g.player.x,g.player.y,handMask(g.giantPose),x-size/2,g.giant.displayY-size/2,size);
 };
 touches.handMask=handMask;touches.heroMask=heroMask;return touches;
}
