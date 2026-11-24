import {FieldRenderer,oval,box,text,TAU} from './field-renderer.js?v=155';
import {drawExplorer} from './heroes.js?v=155';
import {spriteAnchor} from './layout.js';
import {ROOM_HERO_SIZE} from './hero-scale.js';
import {heroWalkFrame} from './walk-cycle.js';
import {sideWalkFrame} from './side-walk.js?v=155';
import {drawClueCard} from './clue-card-art.js';
import {GYM,gymThrowPose} from './gym-core.js?v=174';
import {gymCourtPoint} from './gym-court.js?v=163';

export async function loadGymAssets(character){
 const images={},entries=[['scenery-v163','room0'],['entrance','entrance'],['ball','ball'],['whistle','whistle'],['throwers','throwers']].map(([file,key])=>['gym-v161/'+file+'.webp',key]);
 for(const pose of ['idle','walk'])entries.push(['hero-v153/'+character.id+'-'+pose+'.webp',character.id+'-'+pose+'.webp']);
 await Promise.all(entries.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('체육관 그림을 불러오지 못했어요: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));
 const r=await fetch(new URL('../assets/gym-v161/throwers.json',import.meta.url));if(!r.ok)throw Error('던지는 동작을 불러오지 못했어요.');images.atlas=await r.json();return images;
}
export function createGymCollider(images,character,sceneRatio=()=>1){
 const masks=new Map(),W=96,OX=48,OY=80;
 return (b,p)=>{
  const ratio=sceneRatio();
  if(Math.abs(b.x-p.x)>35||Math.abs((b.y-20-p.y)*ratio)>65)return false;
  const side=p.dir==='left'||p.dir==='right',row=p.dir==='up'?1:side?2:0;
  const key=[p.dir,p.moving?side?sideWalkFrame(p.walk):heroWalkFrame(p.walk,row):'idle'].join(':');
  if(!masks.has(key)){
   const cv=document.createElement('canvas');cv.width=cv.height=W;const c=cv.getContext('2d',{willReadFrequently:true});
   drawExplorer(c,images,character,{...p,x:OX,y:OY,hammerAge:99});
   const rgba=c.getImageData(0,0,W,W).data,mask=new Uint8Array(W*W);for(let i=0;i<mask.length;i++)mask[i]=rgba[i*4+3]>=160?1:0;masks.set(key,mask);
  }
  const mask=masks.get(key),cx=b.x-p.x+OX,cy=(b.y-20-p.y)*ratio+OY,r=GYM.ballRadius-1.3;
  for(let y=Math.max(0,Math.floor(cy-r));y<Math.min(W,cy+r);y++)for(let x=Math.max(0,Math.floor(cx-r));x<Math.min(W,cx+r);x++)if((x+.5-cx)**2+(y+.5-cy)**2<r*r&&mask[y*W+x])return true;
  return false;
 };
}
export class GymRenderer extends FieldRenderer{
 bindContacts(g,character){
  g.touches=createGymCollider(this.images,character,()=>this.canvas.scene?.ratio||1);
  g.releasePoint=t=>{const hand=this.images.atlas.handAnchors[t.row].releaseSceneOffsetAt56,sign=t.dir==='left'?-1:1;return {x:t.x+hand.x*sign,y:t.y+hand.y+20};};
 }
 npc(c,t,pose=gymThrowPose(t),size=ROOM_HERO_SIZE){
  const a=this.images.atlas,k=size/256;
  c.save();spriteAnchor(c,t.x,t.y);if(t.dir==='left')c.scale(-1,1);
  c.drawImage(this.images.throwers,pose*256,t.row*256,256,256,-a.anchor.x*k,-a.anchor.y*k,size,size);c.restore();
 }
 ball(c,b,freeze=false,r=GYM.ballRadius){
  oval(c,b.x,b.y+1,r*.9,2.5,'#5b3d2525');c.save();spriteAnchor(c,b.x,b.y-20);
  if(freeze){c.strokeStyle='#e9ffff';c.fillStyle='#73becd65';c.lineWidth=1.2;c.beginPath();c.arc(0,0,r+3,0,TAU);c.fill();c.stroke();}
  c.rotate(b.age*8);c.drawImage(this.images.ball,-r,-r,r*2,r*2);c.restore();
 }
 draw(g,character){
  const c=this.begin(g);
  // Boundary, halfway line and circle share the floor's receding perspective.
  const line=(x,y,first=false)=>{const p=gymCourtPoint(x,y);first?c.moveTo(p.x,p.y):c.lineTo(p.x,p.y);};
  c.strokeStyle='#fffae7c4';c.lineWidth=1.6;c.lineJoin='round';c.beginPath();
  line(-1,0,true);line(1,0);line(1,1);line(-1,1);c.closePath();c.stroke();
  c.globalAlpha=.62;c.beginPath();line(-1,.5,true);line(1,.5);c.stroke();
  c.beginPath();for(let i=0;i<=64;i++){const a=i/64*TAU;line(Math.cos(a)*.3,.5+Math.sin(a)*.112,i===0);}c.closePath();c.stroke();c.globalAlpha=1;
  for(const t of g.throwers){
   if(t.phase!=='windup')continue;const from=g.releasePoint(t),target=t.target;
   c.save();c.strokeStyle=g.freezeLeft>0?'#5e9ca7':t.locked?'#bf6438b3':'#cf943d91';c.lineWidth=t.locked?1.7:1.3;c.setLineDash([4,6]);
   c.beginPath();c.moveTo(from.x,from.y-20);c.lineTo(target.x,target.y-20);c.stroke();c.setLineDash([]);
   const angle=Math.atan2(target.y-from.y,target.x-from.x);c.translate(target.x,target.y-20);c.rotate(angle);c.beginPath();c.moveTo(-7,-4);c.lineTo(0,0);c.lineTo(-7,4);c.stroke();c.restore();
   c.strokeStyle='#f5e3a0';c.lineWidth=2.4;c.beginPath();c.ellipse(t.x,t.y+2,17,5,0,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,t.age/GYM.windup));c.stroke();
  }
  for(const card of g.cards){
   if(card.collected||g.elapsed<card.at-1)continue;
   const active=g.elapsed>=card.at,glow=.5+.2*Math.sin(g.elapsed*4+card.id);
   oval(c,card.x,card.y+3,12,4,active?'#e6c45b66':'#faf0bd77');
   if(active){c.save();c.shadowColor='#fff0a6';c.shadowBlur=5;drawClueCard(c,card.x,card.y-12+Math.sin(g.elapsed*3+card.id)*1.4,18,24);c.restore();}
   else{c.strokeStyle=`rgba(241,211,130,${glow})`;c.lineWidth=1.5;c.beginPath();c.arc(card.x,card.y-12,7,0,TAU);c.stroke();}
  }
  const actors=[...g.throwers.map(t=>({y:t.y,draw:()=>{
   oval(c,t.x,t.y+2,13,3.5,'#4c3a2429');if(g.freezeLeft>0){c.strokeStyle='#9fe6e2';c.lineWidth=2;c.beginPath();c.ellipse(t.x,t.y+2,16,5,0,0,TAU);c.stroke();}this.npc(c,t);
  }})),...g.balls.map(ball=>({y:ball.y,draw:()=>this.ball(c,ball,g.freezeLeft>0)})),{y:g.player.y,draw:()=>{
   c.save();if(g.invincible>0)c.globalAlpha=.5+.5*Math.abs(Math.sin(g.invincible*13));this.hero(c,g,character);c.restore();
  }}];
  actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
  for(const e of g.effects)if(e.type==='hit'){c.save();c.globalAlpha=Math.max(0,1-e.age*3);c.strokeStyle='#f9e8a3';c.lineWidth=2;for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(e.x+Math.cos(a)*12,e.y+Math.sin(a)*12);c.lineTo(e.x+Math.cos(a)*21,e.y+Math.sin(a)*21);c.stroke();}c.restore();}
  if(g.freezeLeft>0){box(c,143,13,104,25,'#e6f9efee',10);text(c,'타임아웃 '+g.freezeLeft.toFixed(1)+'초',195,26,10,'#3b7a7a');}
  this.end(c,g,false);
 }
 briefing(c,character,time=0){
  const cycle=time%4.5,wind=cycle<1.05,throwing=cycle>=1.05&&cycle<1.23,pose=wind?1:throwing?2:cycle<1.95?3:0;
  this.npc(c,{x:31,y:103,dir:'right',row:2,phase:'ready'},pose,56);
  let y=103,dir='up',moving=false;
  if(cycle>.72&&cycle<1.25){y=103-(cycle-.72)/.53*30;moving=true;}else if(cycle>=1.25&&cycle<2.6)y=73;else if(cycle>=2.6&&cycle<3.25){y=73+(cycle-2.6)/.65*30;dir='down';moving=true;}
  drawExplorer(c,this.images,character,{x:124,y,dir,moving,walk:time,hammerAge:99});
  if(cycle>=1.05&&cycle<2.45)this.ball(c,{x:47+(cycle-1.05)*90,y:98,age:cycle-1.05},false,7.5);
 }
}
