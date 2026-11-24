import {box,oval,text} from './field-renderer.js';
import {beginScene} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {drawClueCard} from './clue-card-art.js';
import {PURSUIT,PURSUIT_CITIES,PURSUIT_START,getPursuitCity} from './pursuit-game.js?v243';

import {PURSUIT_MAP as map,pursuitMapPoint as xy,pursuitPins,pursuitPinHit,pursuitLabelBox} from './pursuit-map.js?v235';
const palette={
 ink:'#29484a',deep:'#244046',ocean:'#dcefeb',land:'#a9c7a4',landBorder:'#6f9786',
 paper:'#fbf7e9',orange:'#b66536',teal:'#28766d',rose:'#914c44',
};
const earthRadius=Math.PI/180;
const playableCities=new Set(PURSUIT_CITIES.map(city=>city.id));
const toAsset=file=>new URL('../assets/pursuit/'+file,import.meta.url).href;

function readImage(url){
 return new Promise((resolve,reject)=>{
  const im=new Image();
  im.onload=()=>resolve(im);
  im.onerror=()=>reject(Error('그림을 불러오지 못했어요.'));
  im.src=url;
 });
}

export async function loadPursuitAssets(character){
 const heroKey=character.id+'-idle.webp';
 const land=fetch(toAsset('land.json')).then(response=>{
  if(!response.ok)throw Error('세계지도를 불러오지 못했어요.');
  return response.json();
 });
 const [entrance,rings,hero]=await Promise.all([
  readImage(toAsset('entrance.webp')),land,
  readImage(new URL('../assets/hero-v153/'+heroKey,import.meta.url).href),
 ]);
 const artworks=new Map();
 function picture(city,index){
  const key=city+'-'+index;
  if(!artworks.has(key)){
   const item={image:null,state:'loading'};
   artworks.set(key,item);
   item.ready=readImage(toAsset('clues/'+key+'.webp?v243')).then(image=>{
    item.image=image;
    item.state='ready';
   },()=>{
    item.state='error';
   });
  }
  return artworks.get(key);
 }
 await Promise.all([1,2,3,4].map(i=>picture('paris',i).ready));
 return {entrance,rings,picture,[heroKey]:hero};
}

function location(city,b=map){return xy(city.lon,city.lat,b);}
function frame(c,x,y,w,h,fill,edge,r=7){
 box(c,x,y,w,h,fill,r);
 c.strokeStyle=edge;c.lineWidth=1;c.beginPath();c.roundRect(x+.5,y+.5,w-1,h-1,r);c.stroke();
}
function fit(c,im,x,y,w,h){
 const k=Math.min(w/im.width,h/im.height),iw=im.width*k,ih=im.height*k;
 c.imageSmoothingEnabled=true;
 c.imageSmoothingQuality='high';
 c.drawImage(im,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
}
function label(c,s,x,y,w,size,color){
 c.font='700 '+size+'px sans-serif';
 const scale=Math.min(1,w/Math.max(1,c.measureText(s).width));
 text(c,s,x,y,Math.max(8,Math.floor(size*scale)),color);
}

function clueSlots(game){
 const n=game.currentClues.length;
 const width=(356-(n-1)*7)/n;
 return Array.from({length:n},(_,i)=>({x:17+i*(width+7),y:52,w:width,h:111}));
}
const contains=(r,x,y)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;

export function pursuitMapHit(game,x,y){
 return game.canSelect?pursuitPinHit(game.choices,x,y):-1;
}
export function pursuitClueHit(game,x,y){
 if(game.phase!=='choosing')return 0;
 if(game.zoomedClue)return game.zoomedClue;
 return clueSlots(game).findIndex(r=>contains(r,x,y))+1;
}

export function pursuitStatus(game){
 if(game.phase==='flying')return [
  game.departure.name+'에서 '+game.destination.name+'으로 이동 중',
  '선택한 도시에서 범인의 흔적을 찾고 있어요.',
 ];
 if(game.captured!==null)return [
  game.captured?'범인을 붙잡았어요':'범인을 놓쳤어요',
  '모은 단서 '+game.banked.size+' / '+PURSUIT.rounds+'장',
 ];
 const latest=game.trace.at(-1);
 if(latest){
  const city=getPursuitCity(latest.city).name;
  if(latest.correct)return [
   city+'에서 단서 카드를 얻었어요',
   '범인이 다른 도시로 달아났어요.',
  ];
  const remaining=game.choices.length-Number(game.phase==='arrival');
  return [
   city+'에서 범인을 찾지 못했어요',
   '같은 단서로 남은 '+remaining+'곳 중 다시 고르세요.',
  ];
 }
 return [
  game.selectedCity?game.selectedCity.name+' 선택':'지도에서 도시를 고르세요',
  game.selectedCity?'비행을 눌러 출발하세요.':'그림 단서가 가리키는 도시를 찾아요.',
 ];
}

function worldPath(rings,b){
 const shape=new Path2D();
 for(const ring of rings){
  if(ring.every(([,lat])=>lat<b.south))continue;
  ring.forEach(([lon,lat],i)=>{
   const p=xy(lon,lat,b);
   if(i===0)shape.moveTo(...p);else shape.lineTo(...p);
  });
  shape.closePath();
 }
 return shape;
}
function drawWorld(c,b,shape){
 c.save();
 c.beginPath();c.roundRect(b.x,b.y,b.w,b.h,8);c.clip();
 c.fillStyle=palette.ocean;c.fillRect(b.x,b.y,b.w,b.h);
 c.strokeStyle='#b5d3ce';c.lineWidth=.55;c.beginPath();
 for(let lon=-150;lon<180;lon+=30){const [x]=xy(lon,0,b);c.moveTo(x,b.y);c.lineTo(x,b.y+b.h);}
 for(let lat=-60;lat<90;lat+=30){const [,y]=xy(0,lat,b);c.moveTo(b.x,y);c.lineTo(b.x+b.w,y);}
 c.stroke();
 c.fillStyle=palette.land;c.fill(shape,'evenodd');
 c.strokeStyle=palette.landBorder;c.lineWidth=.6;c.stroke(shape);
 c.restore();
}

function unit(point){
 const t=point.lat*earthRadius,l=point.lon*earthRadius;
 return [Math.cos(t)*Math.cos(l),Math.cos(t)*Math.sin(l),Math.sin(t)];
}
export function pursuitRoute(start,end){
 const a=unit(start),b=unit(end);
 const angle=Math.acos(Math.max(-1,Math.min(1,a.reduce((d,x,i)=>d+x*b[i],0))));
 const s=Math.sin(angle);
 return Array.from({length:61},(_,i)=>{
  const u=i/60;
  if(Math.abs(s)<1e-6){
   const delta=(end.lon-start.lon+540)%360-180;
   return xy((start.lon+180+delta*u+360)%360-180,start.lat+(end.lat-start.lat)*u);
  }
  const p=a.map((x,j)=>(x*Math.sin((1-u)*angle)+b[j]*Math.sin(u*angle))/s);
  return xy(Math.atan2(p[1],p[0])/earthRadius,
   Math.atan2(p[2],Math.hypot(p[0],p[1]))/earthRadius);
 });
}
function segment(a,b,width){
 const dx=b[0]-a[0];
 return Math.abs(dx)>width/2?dx-Math.sign(dx)*width:dx;
}
function drawRoute(c,points,progress,b=map){
 if(points.length<2)return;
 const finish=Math.min(points.length-1,Math.max(0,(points.length-1)*progress));
 const jump=Math.min(points.length-2,Math.floor(finish)),fraction=finish-jump;
 const a=points[jump],n=points[jump+1],dx=segment(a,n,b.w),dy=n[1]-a[1];
 const tip=[a[0]+dx*fraction,a[1]+dy*fraction];
 for(const shift of [-b.w,0,b.w]){
  c.beginPath();let x=points[0][0]+shift,last=points[0];
  c.moveTo(x,last[1]);
  for(let i=1;i<=jump;i++){
   x+=segment(last,points[i],b.w);
   c.lineTo(x,points[i][1]);last=points[i];
  }
  if(fraction)c.lineTo(x+dx*fraction,tip[1]);
  c.stroke();
 }
 return [b.x+(tip[0]-b.x+b.w)%b.w,tip[1],Math.atan2(dy,dx)];
}
function plane(c,x,y,angle,scale=1){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);
 c.beginPath();
 for(const [i,[px,py]] of [[14,0],[9,3],[1,3],[-7,12],[-10,12],[-6,3],[-15,3],[-19,7],[-21,7],[-19,0],[-21,-7],[-19,-7],[-15,-3],[-6,-3],[-10,-12],[-7,-12],[1,-3],[9,-3]].entries()){
  if(i)c.lineTo(px,py);else c.moveTo(px,py);
 }
 c.closePath();c.fillStyle='#fff7db';c.fill();c.strokeStyle='#3a5157';c.lineWidth=1.45;c.stroke();
 c.fillStyle='#277276';c.fillRect(-3,-1,10,2);
 c.restore();
}

export class PursuitRenderer{
 constructor(canvas,images,displayContext=null){
  this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.displayContext=displayContext;
  this.world=worldPath(images.rings,map);
  this.effects=[];
  this.paths=new Map();
 }
 prepare(game){
  if(!game?.runPlan||game.runPlan===this.plan)return;
  this.plan=game.runPlan;
  this.paths.clear();
  for(const city of game.runPlan.filter(id=>playableCities.has(id)))for(let i=1;i<=4;i++)this.images.picture(city,i);
 }
 route(start,end){
  const key=start.id+' '+end.id;
  if(!this.paths.has(key))this.paths.set(key,pursuitRoute(start,end));
  return this.paths.get(key);
 }
 effect(kind,x,y){
  if(kind==='card')this.effects.push({x,y:y-170,age:0});
 }
 entrance(c){fit(c,this.images.entrance,10,20,240,187);}
 briefing(c,character,time){
  const b={x:34,y:25,w:129,h:70,north:84,south:-65},age=time%3.5;
  this.briefMap??=worldPath(this.images.rings,b);
  drawWorld(c,b,this.briefMap);
  const origin=location(PURSUIT_START,b),paris=location(getPursuitCity('paris'),b);
  const t=Math.max(0,Math.min(1,(age-.6)/1.75));
  const x=origin[0]+(paris[0]-origin[0])*t,y=origin[1]+(paris[1]-origin[1])*t-Math.sin(t*Math.PI)*9;
  c.strokeStyle=palette.orange;c.lineWidth=1.1;c.setLineDash([3,2]);
  c.beginPath();c.moveTo(...origin);c.quadraticCurveTo((x+origin[0])/2,(y+origin[1])/2-4,x,y);c.stroke();c.setLineDash([]);
  oval(c,...paris,2.3,2.3,palette.teal);plane(c,x,y,Math.PI,.36);
  oval(c,40,108,10,2.8,'#24404645');
  drawExplorer(c,this.images,character,{x:40,y:108,dir:'down',moving:false,walk:0,hammerAge:99},.84);
 }
 draw(game,character,t=0,dt=0){
  const c=this.c;
  beginScene(c);c.save();c.translate(0,170);
  c.beginPath();c.rect(0,0,390,500);c.clip();
  const fill=c.createLinearGradient(0,0,390,500);
  fill.addColorStop(0,'#f4f6ed');fill.addColorStop(1,'#e3ece7');
  c.fillStyle=fill;c.fillRect(0,0,390,500);
  if(!game?.choices){c.restore();return;}
  this.prepare(game);
  this.drawHeading(c,game);
  this.drawClues(c,game);
  this.drawMap(c,game);
  this.drawStatus(c,game);
  this.drawEffects(c,dt);
  if(game.zoomedClue&&!this.displayContext)this.drawZoom(c,game);
  c.restore();
 }
 drawHeading(c,game){
  text(c,'현재 '+game.origin.name,18,15,13,palette.ink,'left');
  for(let i=0;i<PURSUIT.rounds;i++){
   const tint=i<game.banked.size?'#4c8a70':i===game.round-1&&!game.ended?'#3b7f8b':'#a7bdb5';
   oval(c,262+i*13,15,3.65,3.65,tint);
  }
  const title=game.canAct?'비행을 눌러 출발하세요':game.round===PURSUIT.rounds?'마지막 추적의 그림 단서':'그림 단서';
  label(c,title,195,36,352,15,palette.ink);
 }
 drawClues(c,game){
  const slots=clueSlots(game);
  for(const [i,clue] of game.currentClues.entries()){
   const r=slots[i],extra=i===3;
   frame(c,r.x,r.y+2,r.w,r.h,'#bacac1','#bacac1',8);
   frame(c,r.x,r.y,r.w,r.h,extra?'#e2f0e7':palette.paper,extra?'#699b8c':'#a3b3a9',8);
   const item=this.images.picture(clue.id,clue.index);
   if(item.image)fit(c,item.image,r.x+5,r.y+5,r.w-10,r.h-10);
   else text(c,item.state==='error'?'그림 오류':'불러오는 중',r.x+r.w/2,r.y+r.h/2,10,palette.ink);
  }
 }
 drawMap(c,game){
  frame(c,map.x-5,map.y-9,map.w+10,map.h+17,'#ceded4','#a5bfb2',10);
  frame(c,map.x-2,map.y-3,map.w+4,map.h+6,palette.ocean,'#698d81',8);
  drawWorld(c,map,this.world);
  c.save();c.beginPath();c.rect(map.x,map.y,map.w,map.h);c.clip();
  const routeEnd=game.trace.length-Number(game.phase==='arrival');
  const routeStart=Math.max(0,routeEnd-12);
  const recent=game.trace.slice(routeStart,routeEnd);
  let depart=routeStart?getPursuitCity(game.trace[routeStart-1].city):PURSUIT_START;
  c.lineWidth=1;c.setLineDash([2.2,2.8]);
  for(const step of recent){
   const target=getPursuitCity(step.city);
   c.strokeStyle=step.correct?'#397f7848':'#9d685255';
   if(target){drawRoute(c,this.route(depart,target),1);depart=target;}
  }
  const flight=game.departure&&game.destination;
  let planePos=null;
  if(flight){
   c.lineWidth=2;c.strokeStyle=palette.orange;c.setLineDash([3.5,2.6]);
   planePos=drawRoute(c,this.route(game.departure,game.destination),game.phase==='flying'?game.flightProgress:1);
  }
  c.setLineDash([]);
  const pins=pursuitPins(game.choices);
  if(game.phase==='choosing'||flight){
   for(const [i,p] of pins.entries()){
    if(game.phase!=='choosing'&&game.selected!==i)continue;
    const chosen=game.selected===i;
    c.strokeStyle=chosen?'#235d62':'#537a75';c.lineWidth=1;
    c.beginPath();c.moveTo(p.originX,p.originY);c.lineTo(p.x,p.y);c.stroke();
    oval(c,p.originX,p.originY,2.5,2.5,palette.teal);
    if(chosen)oval(c,p.x,p.y,12.4,12.4,'#e8fffa');
    oval(c,p.x,p.y,9.9,9.9,chosen?'#235d62':'#32716c');
    oval(c,p.x,p.y-.5,8.0,8.0,chosen?'#91d8cb':'#eaf4e4');
    oval(c,p.x,p.y-.5,3.3,3.3,chosen?'#235d62':'#32716c');
   }
  }
  if(!planePos){
   const [x,y]=location(game.origin);
   oval(c,x,y+1,4.8,4.8,'#fffae0');oval(c,x,y+1,3.15,3.15,'#487f9a');
  }else if(game.phase==='flying'){
   plane(c,planePos[0],planePos[1],planePos[2],.63);
  }else{
   const [x,y]=location(game.origin);
   oval(c,x,y,5,5,palette.paper);oval(c,x,y,3.6,3.6,game.arrival?.correct?palette.teal:palette.rose);
  }
  if(game.phase==='choosing'&&game.selectedCity){
   const name=game.selectedCity.name;
   c.font='700 13px sans-serif';
   const bounds=pursuitLabelBox(pins[game.selected],pins,Math.ceil(c.measureText(name).width)+22);
   label(c,name,bounds.x+bounds.w/2,bounds.y+bounds.h/2,bounds.w-12,13,palette.deep);
  }
  c.restore();
 }
 drawStatus(c,game){
  const [status,detail]=pursuitStatus(game);
  const missed=game.phase!=='flying'&&game.trace.at(-1)?.correct===false;
  text(c,'현재 추적 상황',195,444,12,'#526c67');
  label(c,status,195,466,351,17,missed?palette.rose:palette.deep);
  label(c,detail,195,486,351,14,palette.ink);
 }
 drawEffects(c,dt){
  this.effects=this.effects.filter(effect=>{
   effect.age+=dt;
   if(effect.age>=.72)return false;
   c.save();c.globalAlpha=1-effect.age/.72;
   drawClueCard(c,effect.x,effect.y-effect.age*47,20,26);
   c.restore();
   return true;
  });
 }
 presentZoom(game){
  if(!game?.zoomedClue)return;
  const c=this.displayContext;
  // Draw from the clue file at display resolution in a single pass.
  c.save();
  c.setTransform(c.canvas.width/390,0,0,c.canvas.height/500,0,0);
  this.drawZoom(c,game);
  c.restore();
 }
 drawZoom(c,game){
  const clue=game.currentClues.find(clue=>clue.index===game.zoomedClue);
  if(!clue)return;
  const item=this.images.picture(clue.id,clue.index);
  c.fillStyle='#102c32d9';c.fillRect(0,0,390,500);
  frame(c,29,63,332,361,palette.paper,'#a3b3a9',13);
  if(item.image){
   const {image}=item;
   const side=Math.min(image.width,image.height);
   c.imageSmoothingEnabled=true;
   c.imageSmoothingQuality='high';
   c.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,41,103,308,308);
  }else text(c,item.state==='error'?'그림 오류':'불러오는 중',195,257,13,palette.ink);
  text(c,'×',338,84,21,palette.deep);
 }
}

export function syncPursuitStats(game,$){
 $('time-value').textContent=game.remainingAttempts+'회';
 $('time-fill').style.transform='scaleX('+game.remainingAttempts/PURSUIT.attempts+')';
 $('time-value').closest('.timer').classList.remove('urgent');
 $('clue-value').textContent=game.banked.size;
 $('history-era').textContent=game.round+' / '+PURSUIT.rounds;
}
