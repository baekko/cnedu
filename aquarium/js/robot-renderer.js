import {drawClueCard} from './clue-card-art.js?v245';
import {hasSource} from './clue-order.js';
import {beginScene} from './layout.js';
import {drawExplorer,drawCarryCell} from './heroes.js?v=155';
import {drawRepair} from './robot-repair-art.js';
import {LAB,PARTS,ROBOT_MODELS,REPAIRS} from './robot-core.js';
const TAU=Math.PI*2;
const rounded=(c,x,y,w,h,fill,r=5)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
export async function loadRobotAssets(character){
 const images={},art=['room-modern-v43',...new Set(ROBOT_MODELS.map(m=>m.sheet)),...PARTS.map(p=>p.id),'station','magnet'];
 const files=[
  ...art.map(n=>['robot-v311/'+n+'.webp',n+'.webp']),
  ...['penguin',character.id+'-work'].map(n=>['robot/'+n+'.webp',n+'.webp']),
 ];
 await Promise.all([...files,['robot-v110/'+character.id+'-repair.webp',character.id+'-repair.webp'],...['walk','idle'].map(n=>['hero-v153/'+character.id+'-'+n+'.webp',character.id+'-'+n+'.webp'])].map(([src,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('연구소 그림: '+src));im.src=new URL('../assets/'+src,import.meta.url).href;})));
 return images;
}
export class RobotRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 sprite(c,name,x,y,w,anchor=.5){const im=this.images[name+'.webp'];if(!im)return;const h=w*im.height/im.width;c.drawImage(im,x-w/2,y-h*anchor,w,h);}
 robot(c,type,frame,x,y,size=91){const model=ROBOT_MODELS[type];c.drawImage(this.images[model.sheet+'.webp'],frame*256,model.row*256,256,256,x-size/2,y-size*244/256,size,size);}
 part(c,kind,x,y,size=28){const im=this.images[kind+'.webp'];const k=Math.min(size/im.width,size/im.height),w=im.width*k,h=im.height*k;c.drawImage(im,x-w/2,y-h/2,w,h);}
 belt(c,g){
  const y=LAB.beltY;rounded(c,17,y-23,356,45,'#3c6869',9);rounded(c,22,y-24,346,7,'#dfbd77',3);rounded(c,22,y+16,346,8,'#a47743',3);
  c.save();c.beginPath();c.roundRect(25,y-16,340,32,4);c.clip();c.fillStyle='#23474c';c.fillRect(25,y-16,340,32);
  const offset=(g.elapsed*LAB.beltSpeed)%13;for(let x=13+offset;x<380;x+=13){rounded(c,x,y-14,10,26,'#4e7774',1);c.fillStyle='#7b9d8e';c.fillRect(x,y-13,9,1);}
  const nearest=g.partNear();for(const p of g.parts){if(nearest?.id===p.id){c.strokeStyle='#fff3ba';c.lineWidth=1.5;c.beginPath();c.ellipse(p.x,y+2,18,13,0,0,TAU);c.stroke();}this.part(c,p.kind,p.x,y-2,31);}
  c.restore();for(const x of [18,372]){rounded(c,x-6,y-24,12,49,'#c49b57',4);c.fillStyle='#eacf8c';c.fillRect(x-4,y-20,2,39);for(const yy of [y-19,y+19]){c.fillStyle='#6f6147';c.beginPath();c.arc(x,yy,2,0,TAU);c.fill();}}
  // Moving end rollers and inset inspection lights, all in the room palette.
  for(const x of [18,372]){c.save();c.translate(x,y);c.fillStyle='#31555c';c.beginPath();c.ellipse(0,0,5,11,0,0,TAU);c.fill();c.strokeStyle='#90c8bc';c.lineWidth=1;const d=Math.sin(g.elapsed*5)*7;c.beginPath();c.moveTo(-3,d);c.lineTo(3,d);c.stroke();c.restore();}
 }
 station(c,g,s){
  const selected=g.stationNear()?.id===s.id,working=g.job?.station===s.id,done=s.status==='done';
  if(selected&&!g.ended){c.strokeStyle='#e7c67d';c.lineWidth=1.5;c.setLineDash([3,4]);c.beginPath();c.ellipse(s.x,s.y+38,31,11,0,0,TAU);c.stroke();c.setLineDash([]);}
  this.sprite(c,'station',s.x,s.y+14,106,1);
  if(!done){const frame=s.status==='celebrate'?(Math.floor(s.age*4)%3===0?2:3):working?1:0;
   c.save();if(s.arrivalLeft>0)c.globalAlpha=1-s.arrivalLeft/.7;const shake=s.errorLeft>0?Math.sin(s.errorLeft*45)*2:0;this.robot(c,s.type,frame,s.x+shake,s.y-9,91);c.restore();}
  const list=s.status==='waiting'&&!working?g.requirements(s):[];
  if(list.length){const w=list.length*27+12,x=s.x-w/2,y=218;rounded(c,x,y,w,33,s.errorLeft>0?'#f4d1bd':'#fff2d6',7);c.strokeStyle=s.errorLeft>0?'#bc6a52':'#b89a5f';c.lineWidth=1;c.stroke();
   c.fillStyle='#fff2d6';c.beginPath();c.moveTo(s.x-5,y+32);c.lineTo(s.x,y+38);c.lineTo(s.x+5,y+32);c.fill();
   list.forEach((kind,i)=>{const px=x+19+i*27;this.part(c,kind,px,y+16,24);if(s.installed.includes(kind)){c.fillStyle='#477e6a';c.beginPath();c.arc(px+7,y+24,6,0,TAU);c.fill();c.strokeStyle='#fff3ce';c.lineWidth=1.5;c.beginPath();c.moveTo(px+4,y+24);c.lineTo(px+6,y+26);c.lineTo(px+10,y+21);c.stroke();}});
  }
  rounded(c,s.x-28,s.y+17,56,16,'#315a5d',5);c.fillStyle='#eed7a4';c.font='bold 7px sans-serif';c.textAlign='left';c.fillText('0'+(s.id+1),s.x-23,s.y+28);
  for(let i=0;i<3;i++){const lit=hasSource(g,s.id*3+i+1);c.fillStyle=lit?'#e9c771':'#587c77';c.beginPath();c.arc(s.x-1+i*9,s.y+25,2.8,0,TAU);c.fill();if(lit){c.fillStyle='#fff0b4';c.beginPath();c.arc(s.x-1+i*9,s.y+24,1,0,TAU);c.fill();}}
  if(done){c.fillStyle='#7caa85';c.beginPath();c.arc(s.x,s.y-30,12,0,TAU);c.fill();c.strokeStyle='#fff1c1';c.lineWidth=2.4;c.beginPath();c.moveTo(s.x-6,s.y-30);c.lineTo(s.x-1,s.y-25);c.lineTo(s.x+7,s.y-35);c.stroke();}
  if(working){const f=g.job.age/g.job.duration;rounded(c,s.x-26,s.y+36,52,4,'#718b7c',2);rounded(c,s.x-26,s.y+36,52*f,4,'#ffe4a2',2);for(let i=0;i<3;i++){const a=g.elapsed*10+i*TAU/3,r=9+(g.elapsed*30+i*6)%15;c.fillStyle=i%2?'#fff0bb':'#e9b964';c.fillRect(s.x+Math.cos(a)*r,s.y-23+Math.sin(a)*r*.6,2,2);}}
 }
 hero(c,g,character){const p=g.player,repair=g.job?.type==='repair',held=g.held;
  c.fillStyle='#244b5230';c.beginPath();c.ellipse(p.x,p.y+1,14,5,0,0,TAU);c.fill();
  if(!held&&!repair){drawExplorer(c,this.images,character,p);return;}
  if(repair){drawRepair(c,this.images,character,p,g.job);return;}
  const side=['left','right'].includes(p.dir),row=p.dir==='up'?1:side?2:0,col=0;
  c.save();c.translate(p.x,p.y);if(p.dir==='left')c.scale(-1,1);
  drawCarryCell(c,this.images[character.id+'-walk.webp'],this.images[character.id+'-work.webp'],{row,frame:col,walking:p.moving,walk:p.walk});
  if(held){if(p.dir==='up')this.part(c,held.kind,15,-27,15);else this.part(c,held.kind,side?15:0,-23,18);}
  c.restore();
 }
 card(c,e){const u=e.age/1.5;c.save();c.globalAlpha=Math.min(1,(1-u)*3);c.translate(e.x,e.y-u*72);c.rotate(Math.sin(u*8)*.1);drawClueCard(c,0,0,22,31);c.restore();}
 draw(g,character){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();c.drawImage(this.images['room-modern-v43.webp'],0,0,390,500);
  this.belt(c,g);
  const layers=g.stations.map(s=>({y:s.y+5,draw:()=>this.station(c,g,s)}));layers.push({y:g.player.y,draw:()=>this.hero(c,g,character)});layers.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
  if(g.job?.type==='magnet'){const j=g.job,u=Math.min(1,j.age/j.duration),x=j.from.x+(g.player.x-j.from.x)*u,y=j.from.y+(g.player.y-30-j.from.y)*u-Math.sin(u*Math.PI)*52;c.strokeStyle='#7bbdaf88';c.lineWidth=1.4;c.setLineDash([3,5]);c.beginPath();c.moveTo(g.player.x+9,g.player.y-27);c.quadraticCurveTo(x+10,y-15,x,y);c.stroke();c.setLineDash([]);this.part(c,j.kind,x,y,24);this.sprite(c,'magnet',g.player.x+15,g.player.y-25,23);}
  for(const e of g.effects)this.card(c,e);c.restore();
 }
 entrance(c){this.sprite(c,'station',130,218,175,1);this.robot(c,0,3,130,174,176);}
 briefing(c,character,t){const phase=t%3.4,repair=phase<1.05,held=!repair&&phase>2.2,g={player:{x:62,y:111,dir:repair?'up':'right',moving:false,walk:0,hammerAge:99},held:held?{kind:'battery'}:null,job:repair?{type:'repair',age:phase,duration:1.05}:null};this.sprite(c,'station',115,105,88,1);this.robot(c,0,repair?0:Math.floor(phase*3)%2?2:3,115,77,71);this.hero(c,g,character);if(repair){c.fillStyle='#e9ba5f';c.fillRect(90,67,3,3);}}
}
