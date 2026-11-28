import {drawSideWalk} from './side-walk.js?v=155';
import {drawClueCard} from './clue-card-art.js?v245';
import {SIDE_HERO_SIZE} from './hero-scale.js';
import {loadRecoveryArt,drawRecoveryItems,drawVitalityFx} from './game-items.js';
import {hasSource} from './clue-order.js';
import {beginScene} from './layout.js';
import {DreamLaboratoryArt} from './dream-lab-art.js?v306';
import {DREAM_GAPS,DREAM_SOLIDS,DREAM_SWITCHES,DREAM_SPRINGS,DREAM_CARDS,DREAM_HAZARDS,DREAM_EXIT} from './dream-core.js?v268';
import {paintDreamHazard} from './lab-damage-guide.js?v306';
const TAU=Math.PI*2,clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const box=(c,x,y,w,h,fill,r=3)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const outlinedBox=(c,x,y,w,h,fill,outline,r=3)=>{box(c,x,y,w,h,fill,r);c.strokeStyle=outline;c.lineWidth=.9;c.stroke();};
const line=(c,x,y,xx,yy,color,w=1)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
const oval=(c,x,y,rx,ry,fill)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const palettes=[
 ['#493b58','#765974','#9d7690','#d7aab9'],
 ['#365963','#628a94','#8daeb5','#ead9b6'],
 ['#403e40','#806549','#aa845a','#e2ba7d']
];
export async function loadDreamAssets(character){
 await loadRecoveryArt();
 const images={},files=[...['bedroom','sky-street','clocktower','toy-train','floating-car','pillow','alarm-clock','fan','sign','pendulum'].map(n=>['dream-v306/'+n+'.webp',n]),['history-v27/seated-heroes.webp','seated'],['writer/heroes.webp','poses'],...['walk','idle'].map(n=>['hero-v153/'+character.id+'-'+n+'.webp',n])];
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('꿈연구소 그림: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));return images;
}
export class DreamRenderer extends DreamLaboratoryArt{
 constructor(canvas,images){super();this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;}
 effect(){}
 sprite(c,key,x,y,w){const im=this.images[key],h=w*im.height/im.width;c.drawImage(im,x-w/2,y-h/2,w,h);return h;}
 background(c,g){
  const center=g.camera.x+195;let r=clamp(Math.floor(center/3200),0,2),blend=0;
  if(r<2&&center>(r+1)*3200-180)blend=clamp((center-((r+1)*3200-180))/360);
  if(r>0&&center<r*3200+180){r--;blend=clamp((center-((r+1)*3200-180))/360);}
  const draw=(room,alpha)=>{c.save();c.globalAlpha=alpha;const offset=clamp((g.camera.x-room*3200)*.2,0,810);c.drawImage(this.images[['bedroom','sky-street','clocktower'][room]],-offset,0,1200,500);c.restore();};draw(r,1);if(blend)draw(r+1,blend);
  for(let i=0;i<13;i++){const x=(i*83-g.camera.x*.15+g.elapsed*3)%430,y=110+(i*53)%280;oval(c,(x+430)%430,y,1,1,'#fff6dc70');}
 }
 surfaces(c,g){
  const start=Math.max(0,Math.floor((g.camera.x-40)/3200)),end=Math.min(2,Math.floor((g.camera.x+440)/3200));
  for(let room=start;room<=end;room++)for(const side of[1,-1]){
   const lo=room*3200,hi=(room+1)*3200,gaps=DREAM_GAPS.filter(a=>a.side===side&&a.x>=lo&&a.x<hi);let x=lo;
   for(const gap of [...gaps,{x:hi,w:0}]){if(gap.x>x)this.ledge(c,x,gap.x-x,side,room,g.camera.x);x=gap.x+gap.w;}
  }
  for(const gap of DREAM_GAPS){if(gap.x>g.camera.x+430||gap.x+gap.w<g.camera.x-40)continue;const y=gap.side===1?424:0,h=gap.side===1?76:80,fade=c.createLinearGradient(0,y,0,y+h);fade.addColorStop(0,gap.side===1?'#26395610':'#263956a0');fade.addColorStop(1,gap.side===1?'#263956a0':'#26395610');box(c,gap.x,y,gap.w,h,fade,0);}
  for(const f of [...g.platforms(),...DREAM_SOLIDS.filter(f=>!f.untilCard||!hasSource(g,f.untilCard))]){if(f.x>g.camera.x+430||f.x+f.w<g.camera.x-40)continue;
   if(f.kind==='book'){outlinedBox(c,f.x,f.y,f.w,f.h,'#875d76','#47394e',3);box(c,f.x+3,f.y+4,f.w-6,Math.max(2,f.h-8),'#f0dcac',1);for(let i=6;i<f.h-3;i+=3)line(c,f.x+8,f.y+i,f.x+f.w-6,f.y+i,'#bc9d78',.6);line(c,f.x+2,f.y+1,f.x+f.w-2,f.y+1,'#d3afb1',1);}
   else {const [outline,shade,face,trim]=palettes[f.kind==='roof'?1:2];outlinedBox(c,f.x,f.y,f.w,f.h,shade,outline);outlinedBox(c,f.x-2,f.y,f.w+4,5,trim,outline,2);for(let x=f.x+12;x<f.x+f.w;x+=26){line(c,x,f.y+7,x+9,f.y+7,face,1);oval(c,x,f.y+12,1.2,1.2,trim);}}
   if(f.moveX||f.moveY){const cx=f.x+f.w/2,cy=f.y+f.h/2;oval(c,cx,cy,3,3,'#d1f0cc');for(const sign of[-1,1]){const ax=cx+(f.moveX?sign*17:0),ay=cy+(f.moveY?sign*4:0);line(c,ax,ay,ax+(f.moveX?-sign*4:3),ay+(f.moveX?3:-sign*3),'#e6eed1',1);line(c,ax,ay,ax+(f.moveX?-sign*4:-3),ay+(f.moveX?-3:-sign*3),'#e6eed1',1);}
    if(f.moveY){const base=DREAM_SOLIDS.find(d=>f.x>=d.x&&f.x<d.x+d.w);line(c,cx,base?base.y+base.h:80,cx,f.y,'#d5c79288',1);}
   }
  }
  for(const s of DREAM_SWITCHES){if(Math.abs(s.x-g.camera.x-195)>290)continue;const d=g.gates().find(d=>d.id===s.gate),active=d.open;
   line(c,s.x,s.y,d.x,s.y,active?'#c8e5afaa':'#bca78a66',1.4);outlinedBox(c,s.x-21,s.y+(s.side===1?-7:0),42,7,'#876b4d','#4b413a',2);outlinedBox(c,s.x-17,s.y+(s.side===1?-9:4),34,5,active?'#b9d995':'#e6c37a','#5f4b3c',2);
   c.save();c.translate(s.x,s.y+s.side*-24);c.scale(1,s.side);line(c,-5,-4,0,2,'#f5dfaf',1.7);line(c,5,-4,0,2,'#f5dfaf',1.7);c.restore();
  }
  for(const d of g.gates()){if(d.x>g.camera.x+440||d.x+240<g.camera.x-40)continue;const color=d.open?'#bad8a6':'#cfb47e';outlinedBox(c,d.x-3,d.y-4,d.w+6,5,'#c0955c','#5b463c',2);outlinedBox(c,d.x-3,d.y+d.h,d.w+6,4,'#c0955c','#5b463c',1);
   if(!d.open){for(let x=d.x+2;x<d.x+d.w;x+=5){line(c,x,d.y,x,d.y+d.h,'#57463d',2.8);line(c,x,d.y,x,d.y+d.h,'#aa7e4c',1.4);}for(let y=d.y+12;y<d.y+d.h;y+=27)line(c,d.x,y,d.x+d.w,y,'#dec58c',2);}
   oval(c,d.x+d.w/2,d.y-11,4,4,color);if(d.open&&!hasSource(g,d.card)){c.strokeStyle='#e8d6a0';c.lineWidth=2;c.beginPath();c.arc(d.x+d.w/2,d.y-11,7,-Math.PI/2,-Math.PI/2+TAU*d.left/d.seconds);c.stroke();}
  }
  for(const s of DREAM_SPRINGS){if(Math.abs(s.x-g.camera.x-195)>250)continue;const active=g.effects.find(e=>e.type==='spring'&&Math.abs(e.x-s.x)<30),squash=active?1-Math.sin(active.age*8)*.18:1;c.save();c.translate(s.x,424);c.scale(1,squash);this.sprite(c,'pillow',0,-10,46);line(c,-5,-32,0,-38,'#fff0c2',1.5);line(c,5,-32,0,-38,'#fff0c2',1.5);c.restore();}
 }
 ledge(c,x,w,side,room,camera){
  const left=Math.max(x,camera-25),right=Math.min(x+w,camera+415);if(left>=right)return;
  const [outline,shade,face,trim]=palettes[room],y=side===1?424:0,h=side===1?76:80,edge=side===1?424:76;
  c.save();c.beginPath();c.rect(left,y,right-left,h);c.clip();
  box(c,left,y,right-left,h,shade,0);
  box(c,left,side===1?y+6:y+h-29,right-left,23,face,0);
  box(c,left,edge,right-left,4,trim,0);
  line(c,left,edge+(side===1?5:-2),right,edge+(side===1?5:-2),outline,1);
  for(let xx=Math.floor(left/44)*44;xx<right;xx+=44){line(c,xx,y+8,xx,y+h-8,outline,.8);line(c,xx+6,y+20,xx+34,y+20,trim+'66',.7);if(room===2)oval(c,xx+7,edge+(side===1?12:-10),1.6,1.6,trim);}
  c.restore();if(left===x)line(c,left,y,left,y+h,outline,1);if(right===x+w)line(c,right,y,right,y+h,outline,1);
 }
 gear(c,h,t){c.save();c.translate(h.x,h.y);c.rotate(t*(h.id==='gear-2'?-1:1));c.fillStyle='#aa8654';c.strokeStyle='#655849';c.lineWidth=.8;c.beginPath();for(let i=0;i<48;i++){const a=i/48*TAU,r=i%4<2?h.r:h.r-5;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.stroke();oval(c,0,0,h.r-8,h.r-8,'#e0bc7c');oval(c,0,0,h.r-12,h.r-12,'#586b69');for(let i=0;i<5;i++){const a=i*TAU/5;line(c,Math.cos(a)*5,Math.sin(a)*5,Math.cos(a)*18,Math.sin(a)*18,'#d6b279',5);}oval(c,0,0,6,6,'#a27b49');oval(c,-1,-1,2,2,'#efdcad');c.restore();}
 hazard(c,h,g){
  paintDreamHazard(c,h);
  c.save();if(h.erased)c.globalAlpha=.13+.06*Math.sin(g.elapsed*8);
  if(h.type==='train'){
   const dir=Math.cos(g.elapsed*h.rate)>=0?1:-1;c.save();c.translate(h.x,h.y);c.scale(dir,1);this.sprite(c,'toy-train',0,-2,77);c.restore();
   for(let i=0;i<3;i++){const a=(g.elapsed*1.7+i/3)%1;oval(c,h.x+dir*22-dir*a*16,h.y-25-a*22,2+a*4,2+a*4,`rgba(235,229,243,${(1-a)*.5})`);}
  }else if(h.type==='fan'){
   line(c,h.x,80,h.x,h.y,'#9a8050',4);const s=58/345;c.save();c.translate(h.x,h.y);c.rotate(Math.PI);c.drawImage(this.images.fan,-174*s,-153*s,345*s,404*s);c.restore();
   c.save();c.translate(h.x,h.y);c.rotate(g.elapsed*10);for(let i=0;i<3;i++){c.rotate(TAU/3);c.fillStyle='#b2d2c5';c.beginPath();c.moveTo(3,0);c.bezierCurveTo(12,-15,24,-14,22,-3);c.bezierCurveTo(20,5,9,8,3,2);c.fill();c.strokeStyle='#4d6e68';c.lineWidth=.75;c.stroke();}oval(c,0,0,4,4,'#d9b66a');c.restore();
  }else if(h.type==='car'){
   c.save();c.translate(h.x,h.y);c.scale(Math.cos(g.elapsed*h.rate)>=0?1:-1,1);this.sprite(c,'floating-car',0,0,76);c.restore();line(c,h.x-24,h.y+22,h.x+24,h.y+22,'#d9f5f0aa',2);oval(c,h.x,h.y+25,25,2,'#a2d7e54a');
  }else if(h.type==='sign'){
   line(c,h.x-20,80,h.x-20,h.y-16,'#685f5b',1.1);line(c,h.x+20,80,h.x+20,h.y-16,'#685f5b',1.1);this.sprite(c,'sign',h.x,h.y-4,61);
  }else if(h.type==='pendulum'){
   const anchor=DREAM_HAZARDS.find(a=>a.id===h.id);line(c,anchor.x,anchor.y,h.x,h.y,'#70583c',5);line(c,anchor.x-1,anchor.y,h.x-1,h.y,'#d4ad62',2);
   const im=this.images.pendulum;c.save();c.translate(h.x,h.y);c.rotate(-h.angle);c.drawImage(im,0,202,172,200,-25,-25,50,58);c.restore();oval(c,anchor.x,anchor.y,7,7,'#c5a163');oval(c,anchor.x,anchor.y,3,3,'#6a604b');
  }else if(h.type==='gear')this.gear(c,h,g.elapsed);
  else if(h.type==='shutter'){
   const extent=h.active?169:h.warning?18+Math.sin(g.elapsed*20)*3:6;
   for(const side of[-1,1]){const yy=side===-1?83:421-extent;outlinedBox(c,h.x-10,yy,20,extent,'#866b47','#503f38',2);for(let y=yy+4;y<yy+extent;y+=9)line(c,h.x-8,y,h.x+8,y,'#ddba73',1.2);outlinedBox(c,h.x-12,side===-1?79:421,24,5,'#b38e54','#503f38',2);}
   if(h.warning){c.save();c.setLineDash([3,6]);line(c,h.x,105,h.x,399,'#f3cb76aa',1.4);c.restore();}oval(c,h.x,72,3,3,h.active?'#d97e72':h.warning?'#f6cf7c':'#9dc9b0');
  }
  c.restore();if(h.erased){c.save();c.setLineDash([2,5]);c.strokeStyle='#fff2db';c.lineWidth=.8;c.beginPath();c.arc(h.x,h.y,Math.max(h.r||22,24)+6,0,TAU);c.stroke();c.restore();}
 }
 card(c,id,x,y,t){drawClueCard(c,x,y+Math.sin(t*2+id)*2,20,28);}
 hero(c,g,character,size=SIDE_HERO_SIZE){
  const p=g.player,face=p.dir==='left'?-1:1;c.save();c.translate(p.x,p.y);c.rotate(p.angle||0);c.scale(face*(p.gravity===-1?-1:1),1);
  if(g.invincibleLeft>0)c.globalAlpha=.65+.35*Math.abs(Math.sin(g.elapsed*14));
  const row=Math.max(0,['haru','doyun','narin','soi'].indexOf(character.id)),bottom=21-size*244/256;
  if(g.stunLeft>0||!p.onGround){const col=g.stunLeft>0?3:p.vy*p.gravity<0?0:1;c.drawImage(this.images.poses,col*256,row*256,256,256,-size/2,bottom,size,size);}
  else if(p.moving)drawSideWalk(c,this.images.walk,p.walk,3,-size/2,bottom,size);
  else c.drawImage(this.images.idle,3*256,0,256,256,-size/2,bottom,size,size);
  c.restore();if(g.stunLeft>0)for(let i=0;i<3;i++){const a=g.elapsed*4+i*TAU/3;oval(c,p.x+Math.cos(a)*15,p.y-30+Math.sin(a)*4,2,2,'#ffdf9a');}
 }
 briefing(c,character,t){
  c.save();
  const phase=t%6,up=phase>=1.2&&phase<4.2,u=up?clamp((phase-1.2)/.75):phase>=4.2?1-clamp((phase-4.2)/.75):0;
  c.save();c.translate(90,83-u*50);c.scale(1.18,1.18);this.hero(c,{player:{x:0,y:0,gravity:up?-1:1,angle:u*Math.PI,onGround:u===0||u===1,dir:'right',moving:true,walk:t,vy:0},elapsed:t,stunLeft:0,invincibleLeft:0},character,48);c.restore();c.restore();
 }
 draw(g,character){
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();this.background(c,g);c.save();c.translate(-g.camera.x,0);this.surfaces(c,g);
  for(const h of g.hazards())if(h.x>g.camera.x-90&&h.x<g.camera.x+480)this.hazard(c,h,g);
  const target=g.flashes>0?g.eraseTarget:null;if(target){const r=(target.r||Math.max(target.w,target.h)/2)+7;c.save();c.strokeStyle='#d7f4e6a0';c.lineWidth=.9;c.setLineDash([2,5]);c.beginPath();c.ellipse(target.x,target.y,Math.min(r,46),Math.min(r,46),0,0,TAU);c.stroke();c.restore();}
  for(const card of DREAM_CARDS)if(!hasSource(g,card.id)&&Math.abs(card.x-g.camera.x-195)<225)this.card(c,card.id,card.x,card.y,g.elapsed);
  if(DREAM_EXIT.x<g.camera.x+440){c.save();c.translate(DREAM_EXIT.x,DREAM_EXIT.y);c.rotate(Math.sin(g.elapsed*8)*.025);this.sprite(c,'alarm-clock',0,0,55);c.restore();for(let i=0;i<3;i++)oval(c,DREAM_EXIT.x+Math.sin(g.elapsed+i*2)*38,DREAM_EXIT.y-32-i*9,1.5,1.5,'#fff2b8');}
  drawRecoveryItems(c,g);this.hero(c,g,character);drawVitalityFx(c,g,g.player.x,g.player.y,27);
  for(const e of g.effects){c.save();c.globalAlpha=clamp(1-e.age);if(e.type==='card')this.card(c,e.id,e.x,e.y-e.age*38,g.elapsed);else if(e.type==='flip'){c.strokeStyle='#e8d6fa';c.lineWidth=1.4;c.beginPath();c.ellipse(e.x,e.y,16+e.age*30,9+e.age*12,0,0,TAU);c.stroke();}else for(let i=0;i<7;i++)oval(c,e.x+Math.cos(i)*e.age*40,e.y+Math.sin(i)*e.age*20,e.type==='erase'?2:4,2,e.type==='erase'?'#fff3cb':'#dce5ee');c.restore();}
  c.restore();
  if(g.phase==='entering'||g.phase==='waking'||g.phase==='complete'){c.save();c.globalAlpha=g.phase==='entering'?clamp(1-g.phaseAge/1.1):g.phase==='waking'?clamp(g.phaseAge/.7):1;this.lab(c,character,g.phaseAge);c.restore();}c.restore();
 }
}
