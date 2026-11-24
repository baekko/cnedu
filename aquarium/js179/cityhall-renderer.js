import {workshopAssets} from './workshop-art.js?v=155';
import {beginScene,drawRoom} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {actionFrame,drawPlayerAction,loadPlayerActions} from './player-actions.js?v=155';
import {ROOM_HERO_SIZE} from './hero-scale.js';
import {box,oval} from './field-renderer.js?v=155';
import {CITY_ROOM} from './cityhall-core.js?v=144';

const clamp=n=>Math.max(0,Math.min(1,n));
const ROOM_ART='room-v141';
const MAYOR={x:CITY_ROOM.mayorX,y:CITY_ROOM.mayorY,dir:'down',walk:0,moving:false,hammerAge:99};
const DESK_BACK=178;
const DESK_EDGE=[[105,DESK_BACK],[285,DESK_BACK],[305,201],[299,210],[302,261],[88,261],[91,210],[85,201]];

export async function loadCityHallAssets(character){
 const images=await workshopAssets('cityhall',character,[ROOM_ART,'staff-v139']);
 await loadPlayerActions(images,character);
 return images;
}

export class CityHallRenderer{
 constructor(canvas,images){this.c=canvas.getContext('2d');this.images=images;}
 draw(g,character){
  const c=this.c,room=this.images[ROOM_ART],scene=beginScene(c);c.clearRect(0,0,390,844);drawRoom(c,room);
  if(!g)return;
  c.save();c.translate(0,scene.top);
  const age=g.introAge??CITY_ROOM.staffSeconds;
  this.atDesk(c,character,MAYOR,g.phase==='review',g.stamping?g.stampAge/CITY_ROOM.stampSeconds:null);
  if(age>=CITY_ROOM.seatSeconds)this.staff(c,clamp((age-CITY_ROOM.seatSeconds)/CITY_ROOM.staffSeconds));
  c.restore();
 }
 staff(c,u){
  const x=425-93*u,y=264-20*u,size=120,frame=u===1?1:Math.floor(u*CITY_ROOM.staffSeconds*8)%4;
  oval(c,x,y+1,13,4,'#343e3235');
  const art=this.images['staff-v139'],left=x-size/2,top=y-size*245/256;
  // The hair and face end at row 104; the original neck, shoulders, body and
  // feet stay at their source size and position.
  const neck=104,headScale=.76;
  c.drawImage(art,frame*256,neck,256,256-neck,left,top+size*neck/256,size,size*(256-neck)/256);
  c.drawImage(art,frame*256,0,256,neck,left+size*(1-headScale)/2,
   top+size*neck*(1-headScale)/256,size*headScale,size*neck*headScale/256);
 }
 paper(c,marked){
  box(c,184,183,25,12,'#7b4b2e',1.4);box(c,185,182,23,11,'#f7efdb',1);
  c.strokeStyle='#b8a98a';c.lineWidth=.65;c.beginPath();
  c.moveTo(190,188);c.lineTo(202,188);c.moveTo(190,190);c.lineTo(204,190);c.stroke();
  if(marked){c.strokeStyle='#ad5443';c.lineWidth=.9;c.strokeRect(200,183,4,4);}
 }
 atDesk(c,character,p,marked,progress=null){
  const frame=progress===null?null:progress<.24?0:progress<.78?1:3;
  if(frame===null)drawExplorer(c,this.images,character,p);
  else{
   p={...p,y:p.y+6*Math.sin(Math.PI*progress)};
   drawPlayerAction(c,this.images,character,p,'investigateDown',frame);
  }
  // Match the opaque rear edge of the painting. The tabletop and front
  // cover the seated explorer's legs.
  c.save();c.beginPath();c.moveTo(...DESK_EDGE[0]);
  for(const point of DESK_EDGE.slice(1))c.lineTo(...point);
  c.closePath();c.clip();c.drawImage(this.images[ROOM_ART],0,0,390,500);c.restore();
  this.paper(c,frame===null?marked:progress>=.52);
  if(frame===null)return;
  const pose=actionFrame(this.images,character,'investigateDown',frame),k=ROOM_HERO_SIZE/256;
  const hands=(pose.palms||[pose.tip]).map(([x,y])=>[p.x+(x-128)*k,p.y+(y-244)*k]);
  const [x,y]=hands.reduce((right,hand)=>hand[0]>right[0]?hand:right);
  box(c,x-1.7,y-3,3.4,6,'#996238',1.5);box(c,x-3,y+2,6,2.5,'#703f2c',1);
  // Only the reaching hands and stamp are composited over the desktop.
  c.save();c.beginPath();
  for(const [hx,hy]of hands){
   c.rect(hx-4,DESK_BACK,8,Math.max(0,hy+3-DESK_BACK));
  }
  c.clip();drawPlayerAction(c,this.images,character,p,'investigateDown',frame);c.restore();
 }
 briefing(c,character,t){
  const phase=t%2.7;
  c.save();c.translate(90,8);c.scale(.68,.68);c.translate(-195,-110);
  this.atDesk(c,character,MAYOR,phase>=1.46,phase>=.98&&phase<1.46?(phase-.98)/.48:null);
  c.restore();
 }
}
