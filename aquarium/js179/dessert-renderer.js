import {drawClueCard} from './clue-card-art.js';
import {beginScene,drawRoom} from './layout.js';
import {drawExplorer,drawCarryCell} from './heroes.js?v=155';
import {setFinishingAtlas} from './dessert-finish-art.js';
import {PASTRIES} from './dessert-core.js';
const TAU=Math.PI*2;
const box=(c,x,y,w,h,fill,r=4)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const outline=(c,color='#98775a',w=.8)=>{c.strokeStyle=color;c.lineWidth=w;c.stroke();};
const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const line=(c,x,y,x2,y2,color,w=1)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
const text=(c,s,x,y,size=10,color='#655340',weight=700)=>{c.fillStyle=color;c.font=`${weight} ${size}px sans-serif`;c.textAlign='center';c.textBaseline='alphabetic';c.fillText(s,x,y);};

export async function loadDessertAssets(character){
 const images={},files=[['robot/'+character.id+'-work.webp','carry'],['dessert/finish-v97.webp','finishing'],['dessert/room-v97.webp','room'],['dessert/ovens.webp','ovens'],['dessert/clue.webp','clue'],...['walk','idle'].map(n=>['hero-v153/'+character.id+'-'+n+'.webp',character.id+'-'+n+'.webp'])];
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('디저트 공방 그림: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));setFinishingAtlas(images.finishing);return images;
}

export class DessertRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 pastry(c,kind,x,y,size=1,raw=false,burnt=false,rise=1){
  c.save();c.translate(x,y);c.scale(size,size);const dark=burnt?'#514138':null;
  if(raw||kind==='dough'){
   if(kind==='muffin'){box(c,-6,-3,12,7,'#91b7a8',2);oval(c,0,-3,6,3,'#e3c48c');line(c,-3,-4,2,-4.5,'#fff0c3',1);}
   else if(kind==='tart'){oval(c,0,0,8,4.8,'#bb8d69');oval(c,0,-1,7,3.8,'#e9c68a');oval(c,0,-1,4.7,2.7,'#d9a6a2');}
   else{oval(c,0,0,7,3.8,'#c89d68');oval(c,-.4,-1.5,6.5,3.6,'#f4d9a0');for(const xx of [-3,1,3])oval(c,xx,-2+xx%2,.7,.55,'#8b6045');}
  }
  else if(kind==='cookie'){
   oval(c,0,0,7,4.5,dark||'#bd8047');oval(c,0,-1,6.4,4.1,dark||'#e6b671');
   for(const [x,y]of[[-3,-2],[2,-3],[3,0],[-2,1],[0,-.5]])oval(c,x,y,.85,.6,burnt?'#332e2b':'#74523e');
  }else if(kind==='muffin'){
   c.scale(1,.6+.4*rise);box(c,-5.5,-4,11,9,dark||'#8caca1',1.8);for(let x=-3;x<5;x+=3)line(c,x,-2,x+1,4,dark||'#d6dfbf',.6);
   oval(c,0,-5,7.5,5,dark||'#c68d55');oval(c,-.6,-6,6.4,3.8,dark||'#e9bd7b');oval(c,2,-7,1.6,1.1,burnt?'#2f2b28':'#79543c');
  }else{
   oval(c,0,0,8,4.5,dark||'#ba7b43');oval(c,0,-1.3,7.8,4.1,dark||'#f0c37d');oval(c,0,-2,5.8,3.1,dark||'#fff0b9');
   for(const xx of[-3,1,4]){oval(c,xx,-3-Math.abs(xx)*.13,2,2.6,dark||'#c76b68');if(!burnt)line(c,xx-.7,-3.8,xx-.7,-3.2,'#ffe1a0',.5);}
  }
  c.restore();
 }
 tray(c,material,x,y,w=36,rise=1){
  c.save();c.translate(x,y);c.scale(w/36,w/36);oval(c,1,5,19,4,'#66513a24');
  box(c,-19,-7,38,17,'#8e9c94',3);outline(c,'#657d73',.6);box(c,-17,-6,34,13,'#e1d6b5',2);line(c,-16,7,16,7,'#f5ebcc',1);
  for(const [xx,yy]of[[-9,0],[8,0]])this.pastry(c,material.kind,xx,yy,.85,material.raw,material.burnt,rise);
  c.restore();
 }
 parcel(c,x,y,w=24,kind='cookie',open=false){
  c.save();c.translate(x,y);c.scale(w/24,w/24);box(c,-12,-8,24,16,'#d9b58c',2);outline(c,'#a4805f',.6);box(c,-12,-10,24,7,'#f6e7c7',2);outline(c,'#b49b73',.6);
  if(open){box(c,-10,-7,20,10,'#bd9e78',1);this.pastry(c,kind,0,-1,.8);}
  else{box(c,-2,-10,4,19,'#be8e8b',.6);line(c,-11,-2,11,-2,'#d8aaa3',2);oval(c,-3,-7,3,1.8,'#dfa9a1');oval(c,3,-7,3,1.8,'#dfa9a1');}
  c.restore();
 }
 oven(c,g,o,scale=1){
  const spec=PASTRIES[o.id],ready=o.status==='ready',burnt=o.status==='burnt',done=o.status==='done',near=g.target?.id===o.id,paused=g.freezeLeft>0;
  c.save();c.translate(o.x,o.y);c.scale(scale,scale);oval(c,0,3,47,8,'#79594128');
  if(near){c.strokeStyle=ready?'#69aa83':'#ceaa6e';c.lineWidth=2;c.beginPath();c.ellipse(0,22,28,8,0,0,TAU);c.stroke();}
  const size=110,center=[.52,.495,.465][o.id];
  c.drawImage(this.images.ovens,o.id*500,0,500,500,-center*size,-.935*size,size,size);
  box(c,-34,-67,68,16,'#f8edcf',4);outline(c,'#b8965e',1);text(c,spec.name+'  '+(g.delivered?.[o.kind]||0)+'/3',0,-55,10,'#654f3c');
  if(ready){box(c,-24,-39,48,18,'#f8d77a38',4);}
  if(!done&&!['cooling','finishing'].includes(o.status))this.tray(c,{kind:o.kind,raw:o.status==='baking',burnt},0,-31,37);
  // A physical timing dial mounted on the front, never floating over the room.
  box(c,-36,-15,72,12,'#514c3e',2);
  box(c,-32,-12,26,6,'#cda66c',1);box(c,-6,-12,38,6,done?'#8aa38c':'#72b38e',1);
  let progress=o.status==='baking'?(o.age/spec.bake)*.4:ready?.4+.6*o.age/spec.window:done?1:0;
  if(['baking','ready'].includes(o.status)){const xx=-32+64*progress;line(c,xx,-16,xx,-3,'#fff9e8',2);}
  oval(c,31,-60,2.5,2.5,ready?'#438963':o.status==='finishing'?'#838cb4':done?'#788478':'#b89051');
  if(o.status==='finishing'){this.tray(c,{kind:o.kind},0,-31,37);oval(c,0,-30,6,6,'#f6ebce');line(c,-3,-30,3,-30,'#9c7256',2);}
  if(o.status==='cooling'){this.parcel(c,0,-31,27,o.kind);}
  if(burnt){for(let i=0;i<3;i++){const u=(g.elapsed*.55+i*.3)%1;oval(c,-10+i*10,-88-u*16,3+u*3,4+u*3,'#74665955');}}
  if(ready){c.save();c.globalAlpha=.35+.3*Math.sin(g.elapsed*5);oval(c,31,-60,5,5,'#72db95');c.restore();}
  if(paused&&['baking','ready'].includes(o.status)){box(c,-8,-43,16,14,'#d4e8ed',2);box(c,-4,-40,3,8,'#5d8693',.5);box(c,1,-40,3,8,'#5d8693',.5);}
  c.restore();
 }
 hero(c,g,character){
  const p=g.player;c.save();oval(c,p.x,p.y+1,13,4,'#7a5b4430');drawExplorer(c,this.images,character,p);c.restore();
 }
 action(c,g){
  const m=g.motion;if(!m)return;const u=Math.min(1,m.age/m.duration);
  if(u<.6)this.tray(c,m.material,m.from.x,m.from.y+u*38,30);
  else{c.save();c.globalAlpha=1-(u-.6)/.4;this.parcel(c,m.to.x,m.to.y-(u-.6)*25,28,m.material.kind);c.restore();}

 }
 draw(g,character){
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;
  drawRoom(c,this.images.room);
  c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();
  const layers=[...g.ovens.map(o=>({y:o.y,draw:()=>this.oven(c,g,o)})),{y:g.player.y,draw:()=>this.hero(c,g,character)}];
  layers.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());this.action(c,g);

  for(const e of g.effects){const u=e.age/1.5;c.save();c.globalAlpha=Math.min(1,(1-u)*3);c.translate(e.x,e.y-u*62);drawClueCard(c,0,0,22,30);c.restore();}
  c.drawImage(this.images.room,0,895,780,105,0,447.5,390,52.5);
  c.restore();
 }
 entrance(c){
  c.drawImage(this.images.ovens,0,0,500,500,20,5,220,220);
 }
 briefing(c,character,t){
  const u=t%4,approach=u<1,returning=u>=3,taking=u>=2.4&&u<3,p={x:approach?46+64*u:returning?110-(u-3)*64:110,y:109,dir:returning?'left':'right',moving:approach||returning,walk:t,hammerAge:99},carry=approach||taking||returning;
  const w=82.5;c.drawImage(this.images.ovens,0,0,500,500,132-w*.52,111-w*.935,w,w);
  if(u>=1&&u<2.4){this.tray(c,{kind:'cookie',raw:u<2.1},132,88,26);for(let i=0;i<3;i++){const y=62-((t*12+i*6)%15);line(c,124+i*6,y,125+i*6,y-4,'#d7bb7b88',.8);}}
  if(carry){c.save();c.translate(p.x,p.y);if(p.dir==='left')c.scale(-1,1);drawCarryCell(c,this.images[character.id+'-walk.webp'],this.images.carry,{row:2,walking:p.moving,walk:p.walk});this.tray(c,{kind:'cookie',raw:approach},17,-24,24);c.restore();}
  else this.hero(c,{player:p},character);

 }
}
