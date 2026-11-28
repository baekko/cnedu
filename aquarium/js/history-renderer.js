import {drawClueCard,usesCoinRewards} from './clue-card-art.js?v245';
import {historyMobFrame,HISTORY_MOB_ART} from './history-mob-sprites-v99.js?v307';
import {beginScene,spriteAnchor,drawRoom,sceneText} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {drawTimeMachine,machinePose,machineWalker,machineSize} from './time-machine.js?v307';
import {HISTORY,ERAS,HISTORY_ACTORS} from './history-core.js?v307';
const HISTORY_REVISED_ART=new Set(['jerusalem.webp','pyramid.webp','prehistoric.webp','machine-idle.webp','machine-powered.webp','breakables.webp']);
function historyAssetPath(file){
 if(file==='museum.webp')return 'history-v308/'+file;
 if(file.startsWith('history-v130/dino'))return 'history-v307/'+file.split('/').at(-1);
 if(HISTORY_REVISED_ART.has(file))return 'history-v306/'+file;
 if(file.startsWith('history-v130/'))return file;
 const dir=file==='seated-heroes.webp'?'history-v27':file.endsWith('-walk.webp')||file.endsWith('-idle.webp')?'hero-v153':'history';
 return dir+'/'+file;
}
export async function loadHistoryAssets(character){
 const files=['museum.webp','jerusalem.webp','pyramid.webp','prehistoric.webp','machine-idle.webp','machine-powered.webp','seated-heroes.webp','breakables.webp',`${character.id}-adventure.webp`,`${character.id}-walk.webp`,`${character.id}-idle.webp`];const images={};
 files.push(...Object.values(HISTORY_MOB_ART).map(a=>a.file));
 await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[file]=img;resolve();};img.onerror=()=>reject(new Error('박물관 그림을 불러오지 못했어요: '+file));img.src=new URL(`../assets/${historyAssetPath(file)}`,import.meta.url).href;})));return images;
}
const pill=(c,x,y,w,h,fill)=>{c.beginPath();c.roundRect(x,y,w,h,Math.min(h/2,12));c.fillStyle=fill;c.fill();};
export class HistoryRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 hero(character,p,time,ctx=this.c,scale=1){
  drawExplorer(ctx,this.images,character,p,scale);
 }
 machine(c,game,time,character){
  const m=game.machine,size=machineSize(game),pose=machinePose(game);c.save();spriteAnchor(c,m.x,m.y);
  c.fillStyle='#293b4328';c.beginPath();c.ellipse(0,0,size*.37,10,0,0,7);c.fill();
  drawTimeMachine(c,this.images,character,{size,pose,time});
  if(game.interaction){c.strokeStyle='#f7df8b';c.lineWidth=1.5;c.setLineDash([4,4]);c.beginPath();c.ellipse(0,18,32,12,0,0,7);c.stroke();}c.restore();
 }
 briefing(c,character,time){
  const u=time%7.2,boarding=u<2.5,leaving=u>=4.4,phase=boarding?'boarding':leaving?'disembarking':'travel',age=boarding?u:leaving?u-4.4:0,pose=machinePose({phase,phaseTime:age}),size=126;
  drawTimeMachine(c,this.images,character,{x:90,y:113,size,pose,time});
  if(!pose.seated){const f=boarding?Math.min(1,age/.75):Math.min(1,Math.max(0,(age-1.3)/.8)),p={x:boarding?65+25*f:90+32*f,y:boarding?112-34*f:79+33*f,dir:boarding?'up':'down',moving:boarding||f<1,walk:time,hammerAge:99};drawExplorer(c,this.images,character,p,.75);}
 }
 monster(c,m){const f=historyMobFrame(m),size=m.kind.startsWith('dino')?HISTORY_ACTORS.dinosaurSize:HISTORY_ACTORS.personSize;c.save();spriteAnchor(c,m.x,m.y);if(m.dir==='left')c.scale(-1,1);c.drawImage(this.images[f.art.file],f.column*256,f.row*256,256,256,-size*f.art.foot[0]/256,-size*f.art.foot[1]/256,size,size);c.restore();}
 draw(game,character,time,dt,playing){
  const c=this.c;if(game?.phase==='travel'){this.travel(c,game,character,time);return;}beginScene(c);c.clearRect(0,0,390,844);c.fillStyle='#244b52';c.fillRect(0,0,390,844);c.fillStyle='#eae6da';c.fillRect(0,678,390,166);
  const scene=game?.scene||'museum';drawRoom(c,this.images[scene+'.webp']);if(!game)return;
  c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();
  const things=[...game.mobs.map(m=>({y:m.y,draw:()=>this.monster(c,m)})),{y:game.machine.y-16,draw:()=>this.machine(c,game,time,character)}];
  if(game.box){const b=game.box;things.push({y:b.y,draw:()=>{c.save();if(b.hits<3){c.shadowColor='#fff1a1';c.shadowBlur=8+Math.sin(time*7)*6;c.globalAlpha=.8+.2*Math.sin(time*7);}const w=game.era.row===1?65:55;spriteAnchor(c,b.x,b.y);c.drawImage(this.images['breakables.webp'],b.hits*192,game.era.row*192,192,192,-w/2,-w*.84,w,w);c.restore();}});}
  const walker=machineWalker(game);
  if(walker||!['travel','docked','boarding','disembarking'].includes(game.phase)){const p=walker||game.player;things.push({y:walker?game.machine.y+1:p.y,draw:()=>{c.fillStyle='#263e4938';c.beginPath();c.ellipse(p.x,p.y+1,13,5,0,0,7);c.fill();if(game.boostLeft>0){c.save();c.strokeStyle='#97f2e9';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(p.x-18-i*3,p.y-10-i*5);c.lineTo(p.x-27-i*3,p.y-10-i*5);c.stroke();}c.restore();}const entering=game.phase==='intro'&&game.phaseTime<.6;const view=entering?{...p,y:p.y+34*(1-game.phaseTime/.6),moving:true,walk:game.phaseTime}:p;this.hero(character,view,time);if(game.failureReason==='caught'){c.fillStyle='#f1c04a';c.font='bold 20px sans-serif';c.textAlign='center';sceneText(c,'!',p.x,p.y-57);}}});}
  things.sort((a,b)=>a.y-b.y).forEach(t=>t.draw());
  if(game.box&&game.box.hits<3){const b=game.box;pill(c,b.x-24,b.y+5,48,16,'#fcf1d6f5');c.fillStyle='#785629';c.font='bold 9px sans-serif';c.textAlign='center';sceneText(c,`망치 ${b.hits}/3`,b.x,b.y+16);}
  for(const card of game.cards){
   if(card.collected)continue;const bob=Math.sin(time*4+card.id)*2;c.save();spriteAnchor(c,card.x,card.y);c.translate(0,-13+bob);c.rotate(-.07+Math.sin(time*2+card.id)*.035);drawClueCard(c,0,0,26,36);c.restore();
  }
  for(const e of game.effects){c.save();c.globalAlpha=Math.max(0,1-e.age/.8);if(e.type==='card'){c.fillStyle='#fff';c.font='bold 12px sans-serif';c.textAlign='center';if(!usesCoinRewards())sceneText(c,'+1 단서',e.x,e.y-30-e.age*30);}else{c.fillStyle='#bc945c';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillRect(e.x+Math.cos(a)*e.age*35,e.y+Math.sin(a)*e.age*22-10,3,3);}}c.restore();}
  if(game.boostLeft>0&&!game.ended){pill(c,118,423,154,24,'#effff6');c.fillStyle='#247575';c.font='bold 11px sans-serif';c.textAlign='center';sceneText(c,`속도 2배 · ${game.boostLeft.toFixed(1)}초`,195,439);}
  c.restore();
 }
 travel(c,game,character,time){const t=game.phaseTime,p=Math.min(1,t/5),w=390,h=this.canvas.scene?.height||500;c.save();c.setTransform(2,0,0,2,0,2*(this.canvas.scene?.top||170));c.beginPath();c.rect(0,0,w,h);c.clip();c.fillStyle='#101e45';c.fillRect(0,0,w,h);c.save();spriteAnchor(c,w/2,h/2);for(let i=0;i<19;i++){const a=i*.87+time*2.2,r=((time*90+i*23)%320),stretch=.58;c.strokeStyle=i%2?'#9ce8e9a0':'#ffe2a784';c.lineWidth=1+i%3;c.beginPath();c.ellipse(0,0,r,r*stretch,a,0,7);c.stroke();}for(let i=0;i<48;i++){const a=i*2.399,r=(i*17+t*180)%340;c.strokeStyle='#e7ffffa0';c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r*.9);c.lineTo(Math.cos(a)*(r+22),Math.sin(a)*(r+22)*.9);c.stroke();}c.rotate(Math.sin(t*3)*.055);drawTimeMachine(c,this.images,character,{x:0,y:72,size:202,pose:machinePose(game),time});c.restore();c.fillStyle='#fff4d6';c.textAlign='center';c.font='bold 18px sans-serif';sceneText(c,'시간 여행을 시작합니다',195,h-135);c.font='12px sans-serif';c.fillStyle='#bde9ed';sceneText(c,game.destination>=3?'박물관으로 돌아가는 중':ERAS[game.destination].name+'으로 이동 중',195,h-110);pill(c,105,h-88,180,4,'#6d889d');pill(c,105,h-88,Math.max(4,180*p),4,'#f4d88e');c.restore();}
}
