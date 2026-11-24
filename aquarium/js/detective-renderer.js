import {GUARD_ART} from './guard-gait-art.js';
import {loadDetectiveInspection,drawDetectiveInspection} from './detective-inspection.js';
import {drawClueCard} from './clue-card-art.js?v245';
import {beginScene,drawRoom} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {DETECTIVE_PROPS} from './detective-prop-art.js';
import {visionEnd,coverRect,DETECTIVE} from './detective-core.js';
import {DETECTIVE_DOORS} from './detective-door-layout.js';
const TAU=Math.PI*2;
const box=(c,x,y,w,h,fill,r=5)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const oval=(c,x,y,rx,ry,fill)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
function text(c,s,x,y,size=11,color='#4e594d',align='center'){c.fillStyle=color;c.font=`700 ${size}px sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);}
export async function loadDetectiveAssets(character){
 const images={},files=DETECTIVE_DOORS.map(d=>[d.file,d.room]);for(const n of['props','guard','entrance','clue'])files.push([n==='guard'?GUARD_ART.file:'detective/'+n+'.webp',n]);for(const n of['idle','walk'])files.push(['hero-v153/'+character.id+'-'+n+'.webp',character.id+'-'+n+'.webp']);
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{images[key]=image;resolve();};image.onerror=()=>reject(Error('탐정사무소 그림: '+file));image.src=new URL('../assets/'+file,import.meta.url).href;})));await loadDetectiveInspection(images);return images;
}
export class DetectiveRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 prop(c,index,x,foot,w){const b=DETECTIVE_PROPS[index],h=w*b.sh/b.sw;c.drawImage(this.images.props,b.sx,b.sy,b.sw,b.sh,x-w/2,foot-h,w,h);}
 guard(c,g){
  const direction=g.dir==='up'?'back':g.dir==='left'||g.dir==='right'?'right':'front',idle=GUARD_ART.idleFrames[direction],row=g.moving?GUARD_ART.walkRows[direction]:Math.floor(idle/4),col=g.moving?Math.floor(g.walk*2.8)%4:idle%4;
  oval(c,g.x,g.y+1,12,4,'#29362430');c.save();c.translate(g.x,g.y);if(g.dir==='left')c.scale(-1,1);c.drawImage(this.images.guard,col*256,row*256,256,256,-29,-246*58/256,58,58);c.restore();
  const hand=g.moving?GUARD_ART.flashlightPalm[direction][col]:GUARD_ART.idleFlashlightPalm[direction],dx=Math.cos(g.angle),dy=Math.sin(g.angle),tx=g.x+(hand[0]-128)*58/256*(g.dir==='left'?-1:1)+dx*4,ty=g.y+(hand[1]-246)*58/256+dy*4;
  c.save();c.translate(tx,ty);c.rotate(g.angle);box(c,-8,-2.6,10,5.2,'#546566',1.5);box(c,0,-3.4,4,6.8,'#c7ad6c',1);c.fillStyle='#fff2ba';c.fillRect(3,-2.7,1.5,5.4);c.restore();
  const glow=c.createRadialGradient(tx+dx*4,ty+dy*4,1,tx+dx*4,ty+dy*4,8);glow.addColorStop(0,'#ffe9ad9c');glow.addColorStop(1,'#ffe9ad00');c.fillStyle=glow;c.fillRect(tx-9,ty-9,18,18);
  if(g.mode==='chase'){box(c,g.x-11,g.y-76,22,20,'#c96550',5);text(c,'!',g.x,g.y-66,15,'#fff1c9');}
  else if(g.mode==='sound'||g.mode==='search'){box(c,g.x-10,g.y-75,20,19,g.mode==='search'?'#e4b372':'#f8edcf',5);text(c,'?',g.x,g.y-65,13,'#645447');}
  else if(g.alert>.02){box(c,g.x-15,g.y-73,30,14,'#f8edcf',5);box(c,g.x-11,g.y-68,22*g.alert,4,'#d3905c',2);}

 }
 sight(c,g,room){
  c.save();const grad=c.createRadialGradient(g.x,g.y,4,g.x,g.y,g.range);grad.addColorStop(0,'#ffe6a29e');grad.addColorStop(.62,'#edc66e69');grad.addColorStop(1,'#e9bc5945');
  c.beginPath();c.moveTo(g.x,g.y);for(let i=0;i<=30;i++){const a=g.angle-.77+1.54*i/30,p=visionEnd(g,a,room.covers);c.lineTo(p.x,p.y);}c.closePath();c.fillStyle=grad;c.fill();c.strokeStyle='#d9b369a0';c.lineWidth=.6;c.stroke();c.restore();
 }
 evidence(c,e,g){
  const cover=e.cover===undefined?null:g.room.covers[e.cover],x=e.x,y=cover?cover.y-17:e.y-39;
  if(e.collected){oval(c,x,y,7,7,'#c2d6b0');text(c,'✓',x,y,9,'#426f54');return;}
  c.save();c.translate(x,y);c.rotate(-.13);drawClueCard(c,0,0,14,18);c.restore();
  if(Math.sin(g.elapsed*3)>0){c.strokeStyle='#f7d585b0';c.lineWidth=1;c.beginPath();c.arc(x,y,12,0,TAU);c.stroke();}
 }
 hero(c,g,character){
  if(g.hidden)return;
  const p=g.player;c.save();if(g.immunity>0&&Math.sin(g.elapsed*15)>0)c.globalAlpha=.6;oval(c,p.x,p.y+1,12,4,'#2d3c3a35');if(g.holding&&g.job){drawDetectiveInspection(c,this.images,character,p,g.job.age);} else drawExplorer(c,this.images,character,p);c.restore();
 }
 draw(g,character){
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;drawRoom(c,this.images[g.room.id]);c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();
  for(const guard of g.room.guards){this.sight(c,guard,g.room);if(Math.hypot(guard.x-g.player.x,guard.y-g.player.y)<108&&guard.mode==='patrol'){c.save();c.strokeStyle='#796b4c65';c.lineWidth=.8;c.setLineDash([2,5]);c.beginPath();c.ellipse(guard.x,guard.y,DETECTIVE.hearing,DETECTIVE.hearing,0,0,TAU);c.stroke();c.restore();}}
  const door=g.exit;if(g.canExit){oval(c,door.x,door.thresholdY+11,door.width*.35,4,'#dce7ae90');text(c,'↑',door.x,door.thresholdY+9,15,'#f4e7a8');}else{box(c,door.x-17,door.thresholdY-17,34,13,'#fff0d8e8',4);text(c,g.roomCollected+' / 3',door.x,door.thresholdY-10.5,8,'#9b774c');}
  const layers=g.room.covers.map(o=>({y:o.y+o.h/2,paint:()=>this.prop(c,o.art,o.x,o.y+o.h/2,o.w+5)}));
  for(const e of g.room.evidence)if(e.cover===undefined)layers.push({y:e.y-9,paint:()=>this.prop(c,4,e.x,e.y-5,49)});
  for(const guard of g.room.guards)layers.push({y:guard.y,paint:()=>this.guard(c,guard)});
  layers.push({y:g.hidden?(g.room.covers.find(o=>o.id===g.hideCover)?.y??g.player.y):g.player.y,paint:()=>this.hero(c,g,character)});layers.sort((a,b)=>a.y-b.y).forEach(a=>a.paint());
  for(const e of g.room.evidence)this.evidence(c,e,g);
  for(const e of g.room.evidence)if(!e.collected&&e.progress>0){const x=e.x,y=e.y-59;box(c,x-25,y,50,8,'#293a3deb',4);box(c,x-23,y+2,46*e.progress/e.seconds,4,g.job?.evidence===e?'#b7dcc4':'#a6b0a5',2);}
  if(g.noise){const n=g.noise;if(n.kind==='footstep'&&!g.hidden){c.save();c.globalAlpha=Math.max(0,.65-n.age*.38);for(const side of [-1,1]){oval(c,n.x+side*5,n.y+side*3,2.2,4,'#82785d');oval(c,n.x+side*5,n.y+side*3+4,1.6,1.4,'#82785d');}c.strokeStyle='#aa9469';c.lineWidth=1.1;for(const r of [6,10]){c.beginPath();c.arc(n.x+12,n.y-7,r,-.8,.8);c.stroke();}c.restore();}else if(n.kind!=='footstep'){for(let i=0;i<2;i++){c.strokeStyle='#d6bf8b99';c.lineWidth=1.1;c.beginPath();c.arc(n.x,n.y-2,8+(n.age*18+i*11)%28,-.8,.8);c.stroke();}}if(n.kind==='decoy'){oval(c,n.x,n.y-2,7,4,'#a4b7ac');oval(c,n.x+6,n.y-4,3,3,'#e4c9a2');}else if(n.kind==='investigate'){box(c,n.x-17,n.y-32,34,15,'#fff0d8',4);text(c,'찰칵',n.x,n.y-24,8,'#a87747');}}
  if(g.decoy&&!g.decoy.landed){const d=g.decoy,u=Math.min(1,d.age/.35),x=d.from.x+(d.to.x-d.from.x)*u,y=d.from.y+(d.to.y-d.from.y)*u-35*Math.sin(u*Math.PI);oval(c,x,y-3,7,4,'#b4beb0');oval(c,x+5,y-5,3,3,'#e8cfa8');}
  for(const e of g.effects)if(e.type==='card'){const u=e.age/1.3;c.save();c.globalAlpha=1-u;drawClueCard(c,e.x,e.y-20.5-u*38,22,29);c.restore();}
  box(c,12,10,226,25,'#f7ecd9ed',6);text(c,g.room.name,25,23,11,'#65523c','left');text(c,g.roomCollected+'/3',222,23,10,'#426c5b','right');
  if(g.pursued){box(c,251,12,126,20,g.room.guards.some(h=>h.mode==='chase')?'#bb624a':'#dcaa64',5);text(c,g.hidden?'수색 중 · 숨기 유지':'추격! 시선을 끊어요',314,22,9,'#fff6df');}else if(g.suspicion>.03){box(c,251,12,126,20,'#f7ecd9ee',5);box(c,261,19,106*g.suspicion,5,'#c78363',3);}
  if(g.transitionLeft>0){c.fillStyle='#f3e5cd';c.globalAlpha=g.transitionLeft/.65;c.fillRect(0,0,390,500);c.globalAlpha=1;}
  const caught=g.effects.find(e=>e.type==='caught');if(caught&&caught.age<.4){c.strokeStyle='#cd785b80';c.lineWidth=7*(1-caught.age/.4);c.strokeRect(3,3,384,494);}
  c.restore();
 }
 entrance(c){const im=this.images.entrance,k=Math.min(250/im.width,210/im.height);c.drawImage(im,(260-im.width*k)/2,(230-im.height*k)/2,im.width*k,im.height*k);}
 briefing(c,character,t){
  const p={x:89,y:111,moving:false,dir:'up',hammerAge:99},g={player:p,holding:true,job:{age:t},hidden:false,immunity:0,elapsed:t};
  c.save();c.translate(89,111);c.scale(1.35,1.35);c.translate(-89,-111);this.hero(c,g,character);c.restore();

 }
}
