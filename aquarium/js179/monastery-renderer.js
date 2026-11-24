import {beginScene,spriteAnchor} from './layout.js';
import {drawExplorer,drawHeldWalk} from './heroes.js?v=155';
import {HERO_GRIPS,sideWalkPalm} from './hero-grips.js?v=155';
import {hasSideAnimation} from './side-walk.js?v=155';
import {heroWalkFrame} from './walk-cycle.js';
import {SIDE_HERO_SIZE,ROOM_HERO_SIZE} from './hero-scale.js';
import {levelMonasteryPanorama,drawMonasteryBridgeDeck} from './monastery-ground-art.js';
import {MONASTERY,LANTERN_ROUTE,MONASTERY_BRIDGES,CORRIDOR_PILLARS,TEMPLE_CARTS,TEMPLE_SPLASHES,TEMPLE_BELLS,bridgePose,monasteryFloor,laneOffset,routeWind,cartPose,splashPose,bellPose,bellPassage,BELL_GEOMETRY,hookPose} from './monastery-core.js';
import {hasSource} from './clue-order.js';
const TAU=Math.PI*2;
const box=(c,x,y,w,h,fill,r=4)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const oval=(c,x,y,rx,ry,fill)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const label=(c,s,x,y,size=10,color='#534a36',align='center')=>{c.font=`700 ${size}px sans-serif`;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);};
export async function loadMonasteryAssets(character){
 const images={},files=[['monastery-v123/panorama.webp','panorama'],['entrance-v129/monastery.webp','entrance'],...['lanterns','bridge','post-timber'].map(n=>['monastery-v105/'+n+'.webp',n])];
 files.push(['monastery-v106/cart.webp','cart'],['monastery-v106/bell.webp','bell']);
 for(const n of ['idle','walk'])files.push(['hero-v153/'+character.id+'-'+n+'.webp',character.id+'-'+n+'.webp']);
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('사찰 그림: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));images.panorama=levelMonasteryPanorama(images.panorama);return images;
}
export class MonasteryRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 lamp(c,color,lit,x,y,size,angle=0){
  c.save();c.translate(x,y);c.rotate(angle);
  if(lit){const glow=c.createRadialGradient(0,size*.4,1,0,size*.4,size*.85);glow.addColorStop(0,'#ffd17c4d');glow.addColorStop(1,'#ffd17c00');c.fillStyle=glow;c.fillRect(-size,size*-.4,size*2,size*2);}
  c.drawImage(this.images.lanterns,color*512,lit?512:0,512,512,-size/2,-60/512*size,size,size);c.restore();
 }
 wood(c,x,y,w,h){const grad=c.createLinearGradient(x,y,x+w,y);grad.addColorStop(0,'#493527');grad.addColorStop(.3,'#b47b43');grad.addColorStop(.6,'#83512f');grad.addColorStop(1,'#4e3929');box(c,x,y,w,h,grad,2);c.strokeStyle='#e1b47850';c.lineWidth=.65;for(let i=3;i<w;i+=4){c.beginPath();c.moveTo(x+i,y+4);c.bezierCurveTo(x+i-1,y+h*.3,x+i+2,y+h*.7,x+i,y+h-3);c.stroke();}}
 stand(c,r,g){
  const y=monasteryFloor(r.pickup,g.elapsed)+laneOffset(r.pickupLane);oval(c,r.pickup,y+2,19,4,'#413c3433');
  this.wood(c,r.pickup-15,y-9,5,12);this.wood(c,r.pickup+10,y-9,5,12);this.wood(c,r.pickup-22,y-13,44,5);
  box(c,r.pickup-11,y-7,22,9,'#e4d5ad',1);label(c,r.pickupLane===0?'↑':'↓',r.pickup,y-2,7,'#675236');
  if(!hasSource(g,r.id)&&g.held?.id!==r.id)this.lamp(c,r.color,true,r.pickup,y-40,32);
  if(g.retryLeft>0&&g.held?.id===r.id){oval(c,r.pickup,y-14,6,2,'#f5bb4b');}
  if(g.target?.id===r.id&&!g.held){oval(c,r.pickup,y+4,17,4,'#e8bf6355');c.strokeStyle='#fff3b4bb';c.lineWidth=1;c.beginPath();c.ellipse(r.pickup,y+4,18,5,0,0,TAU);c.stroke();}
 }
 hook(c,r,g){
  const y=monasteryFloor(r.hook,g.elapsed)+laneOffset(r.hookLane),lit=hasSource(g,r.id),active=g.target?.id===r.id,q=hookPose(r,g.elapsed),loopY=y-128+Math.sqrt(900-q.offset*q.offset);
  oval(c,r.hook-26,y+2,17,4,'#373c3130');box(c,r.hook-34,y-8,17,10,'#9b9b83',3);box(c,r.hook-35,y-3,19,5,'#d4c9ad',2);
  this.wood(c,r.hook-29,y-138,7,134);this.wood(c,r.hook-32,y-139,40,6);
  c.strokeStyle='#bc9c55';c.lineWidth=1.4;c.beginPath();c.moveTo(r.hook,y-133);c.lineTo(q.x,loopY);c.arc(q.x,loopY+3,3,-Math.PI/2,Math.PI*.85);c.stroke();
  box(c,r.hook-34,y-65,18,15,'#e9d5a7',2);label(c,String(r.id),r.hook-25,y-57,8);
  if(lit){this.lamp(c,r.color,true,q.x,loopY+1,48,Math.sin(g.elapsed*1.2+r.id)*.025);const light=c.createRadialGradient(q.x,y,1,q.x,y,58);light.addColorStop(0,'#f2b75a38');light.addColorStop(1,'#f2b75a00');c.fillStyle=light;c.fillRect(q.x-60,y-22,120,42);}
  else if(active){c.setLineDash([2,3]);c.strokeStyle=q.ready?'#b0e0aaff':'#e6b16aff';c.lineWidth=1.5;c.beginPath();c.arc(q.x,loopY+19,15,0,TAU);c.stroke();c.setLineDash([]);oval(c,q.x,y+3,16,4,q.ready?'#9fc79590':'#e0b17460');label(c,r.hookLane===0?'↑':'↓',q.x,y+3,8,'#fff8db');if(g.held){c.strokeStyle='#7bb99a';c.lineWidth=2.5;c.beginPath();c.arc(q.x,loopY+19,17,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,g.hangProgress/.38));c.stroke();}}
 }
 streamer(c,r,g){
  const x=r.windStart-26,y=monasteryFloor(x,g.elapsed),wind=routeWind(r,g.windAges[r.id-1]),gust=wind.phase==='gust',warn=wind.phase==='warning',force=Math.abs(wind.force)/8.6,d=wind.direction,amp=gust?7+force*8:warn?7:1.6,length=gust?36+force*11:warn?32:22,clock=g.elapsed*(gust?10+force*4:warn?10:2);
  this.wood(c,x-2,y-86,4,84);oval(c,x,y-86,3,2,'#d0b47b');
  const upper=[],lower=[];for(let i=0;i<=12;i++){const u=i/12,flutter=Math.sin(clock-u*7)*amp*u,drop=(1-u)*3+u*u*(gust?1:warn?7:22);upper.push([x+d*length*u,y-84+flutter+drop]);lower.push([x+d*length*u,y-76+flutter+drop]);}
  c.save();c.beginPath();c.moveTo(...upper[0]);for(const a of upper.slice(1))c.lineTo(...a);for(const a of lower.reverse())c.lineTo(...a);c.closePath();const grad=c.createLinearGradient(x,y-86,x,y-55);grad.addColorStop(0,gust?'#e6b27f':warn?'#eed295':'#c2cfb2');grad.addColorStop(.55,gust?'#b97152':warn?'#c69b5b':'#8fa58a');grad.addColorStop(1,'#e6d6ad');c.fillStyle=grad;c.fill();c.strokeStyle='#765f443b';c.lineWidth=.5;c.stroke();
  c.beginPath();for(let i=0;i<upper.length;i++){const a=upper[i];i?c.lineTo(a[0],a[1]+2):c.moveTo(a[0],a[1]+2);}c.setLineDash([1,2]);c.strokeStyle='#fff1cc92';c.lineWidth=.65;c.stroke();c.setLineDash([]);
  const tip=upper.at(-1);for(let i=0;i<4;i++){c.beginPath();c.moveTo(tip[0],tip[1]+i*2);c.quadraticCurveTo(tip[0]+d*5,tip[1]+i*2+Math.sin(clock+i)*4,tip[0]+d*9,tip[1]+i*2+Math.sin(clock+i+.7)*5);c.strokeStyle='#b79165';c.lineWidth=.6;c.stroke();}c.restore();
 }
 windField(c,r,g){
  const wind=routeWind(r,g.windAges[r.id-1]);if(wind.phase!=='warning'&&wind.phase!=='gust')return;const gust=wind.phase==='gust',d=wind.direction,strength=gust?Math.min(1,Math.abs(wind.force)/8.6):.2,left=Math.max(r.windStart,g.camera.x-90),right=Math.min(r.windEnd,g.camera.x+480);if(left>=right)return;
  c.save();c.beginPath();c.rect(left,286,right-left,171);c.clip();
  for(let i=0;i<(gust?15:5);i++){const layer=i%3,speed=gust?90+strength*110+layer*24:35+layer*8,span=r.windEnd-r.windStart+180,phase=(g.elapsed*speed+i*83)%span,xx=d>0?r.windStart-90+phase:r.windEnd+90-phase,yy=303+(i*37)%128+Math.sin(g.elapsed*1.7+i)*4,len=gust?28+layer*14+strength*14:17,alpha=gust?.15+strength*.27:.12;if(r.zone===2&&yy>320&&TEMPLE_BELLS.some(b=>Math.abs(xx-b.x)<170))continue;c.beginPath();c.moveTo(xx,yy);c.bezierCurveTo(xx+d*len*.3,yy-4,xx+d*len*.7,yy+3,xx+d*len,yy-2);c.strokeStyle='rgba(255,246,211,'+alpha+')';c.lineWidth=layer===0?1.5:.7;c.stroke();}
  // Fine pollen / dust travels in the same direction, never decorative leaves.
  if(gust)for(let i=0;i<13;i++){const phase=(g.elapsed*(125+i%3*30)+i*53)%460,x=d>0?r.windStart-30+phase:r.windEnd+30-phase,y=330+(i*29)%100+Math.sin(g.elapsed*3+i)*4;if(r.zone===2&&y>320&&TEMPLE_BELLS.some(b=>Math.abs(x-b.x)<170))continue;oval(c,x,y,i%3===0?1.1:.6,.55,'#f3dda786');}
  c.restore();
 }
 pillar(c,x,time){
  const y=monasteryFloor(x,time),s=138/1536;oval(c,x,y+2,30,4,'#374d3b32');c.drawImage(this.images['post-timber'],x-256*s,y-1510*s,512*s,1536*s);
 }
 cart(c,cart,g){
  const q=cartPose(cart,g.elapsed),foot=monasteryFloor(q.x,g.elapsed)+laneOffset(q.lane),s=90/768;oval(c,q.x,foot+1,30,4,'#3b3a3540');c.save();c.translate(q.x,foot);if(q.dir<0)c.scale(-1,1);c.drawImage(this.images.cart,-301.971*s,-448.827*s,768*s,456*s);
  for(const wx of [174.825,429.629]){c.save();c.translate((wx-301.971)*s,(343.281-448.827)*s);c.rotate(q.x/12*q.dir);c.strokeStyle='#edbd786b';c.lineWidth=.7;for(let i=0;i<4;i++){c.rotate(Math.PI/4);c.beginPath();c.moveTo(-10.5,0);c.lineTo(10.5,0);c.stroke();}c.restore();}c.restore();
 }
 splash(c,s,g){
  const q=splashPose(s,g.splashAges[s.id-1]);if(q.phase==='idle'||q.phase==='calm')return;const y=monasteryFloor(s.x,g.elapsed)+laneOffset(s.lane),u=q.u;
  oval(c,s.x,y+2,43,6,q.phase==='warning'?'#9bc8c677':'#70adb48c');c.strokeStyle='#e5f6e5c4';c.lineWidth=.8;c.stroke();
  c.save();c.strokeStyle=q.phase==='warning'?'#badfdce0':'#dbf4e5f0';c.lineWidth=1.4;
  for(let i=0;i<3;i++){c.beginPath();c.ellipse(s.x,y+2,18+(u*20+i*12)%33,2.5+i*1.6,0,0,TAU);c.stroke();}
  if(q.phase==='warning'){for(let i=-1;i<=1;i++){const xx=s.x+i*22;c.strokeStyle='#eff8dba0';c.beginPath();c.moveTo(xx-3,y+3);c.lineTo(xx,y);c.lineTo(xx+3,y+3);c.stroke();}}
  else{const h=Math.sin(Math.PI*u)*55,grad=c.createLinearGradient(0,y-h,0,y+5);grad.addColorStop(0,'#edfcecaa');grad.addColorStop(.5,'#9ccfcd88');grad.addColorStop(1,'#609bba28');c.fillStyle=grad;c.beginPath();c.moveTo(s.x-41,y+4);c.bezierCurveTo(s.x-18,y-h*.3,s.x-31,y-h,s.x-11,y-h*.85);c.quadraticCurveTo(s.x,y-h*.3,s.x+2,y-h);c.bezierCurveTo(s.x+14,y-h*1.1,s.x+14,y-h*.3,s.x+41,y+4);c.closePath();c.fill();c.strokeStyle='#edf9e5a0';c.lineWidth=.8;for(let k=0;k<4;k++){const dx=(k-1.5)*8;c.beginPath();c.moveTo(s.x+dx*1.9,y+1);c.quadraticCurveTo(s.x+dx*.8,y-h*.7,s.x+dx,y-h*(.72+k*.045));c.stroke();}for(let i=0;i<12;i++){const a=i*2.399,xx=s.x+Math.cos(a)*(10+u*30),yy=y-Math.abs(Math.sin(a))*(h+10);oval(c,xx,yy,1.1,2.5,'#d4f7ecd9');}}
  c.restore();
 }
 bell(c,b,g){
  const q=bellPose(b,g.elapsed),floor=monasteryFloor(b.x,g.elapsed),low=Math.max(.12,1-Math.abs(q.angle)/BELL_GEOMETRY.amplitude);
  // Rope, bronze bell and fish use the same rotated geometry as live contact.
  c.strokeStyle='#735e42';c.lineWidth=1.7;c.beginPath();c.moveTo(b.x,BELL_GEOMETRY.pivotY);c.lineTo(q.x,q.y);c.stroke();
  oval(c,q.bodyX,floor+4,12+low*5,3,'rgba(83,66,43,'+(.08+low*.16)+')');oval(c,q.fishX,floor+7,8,2,'rgba(83,66,43,'+(.05+low*.12)+')');
  const s=32/336;c.save();c.translate(q.x,q.y);c.rotate(-q.angle);c.drawImage(this.images.bell,-169.031*s,-8.246*s,336*s,637*s);c.restore();
  const cue=bellPassage(b,g.elapsed,g.player,g.stunLeft<=0&&g.retryLeft<=0&&!g.ended),ink=cue.motion==='up'?'#407c83':'#aa713e',tagX=Math.max(g.camera.x+15,Math.min(g.camera.x+375,q.bodyX+31));
  box(c,tagX-11,q.bodyY-14,22,26,'#fff9e9f5',6);c.strokeStyle=ink;c.lineWidth=1;c.stroke();label(c,cue.arrow,tagX,q.bodyY-1,18,ink);
  if(Math.abs(g.player.x-b.x)<190){const x=b.x-cue.travel*140,y=floor+laneOffset(g.lane)+14,col=cue.safe?'#286b43':'#91612b';oval(c,x,y,31,9,cue.safe?'#b2d4a4eb':'#efd39aeb');c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,31,9,0,0,TAU);c.stroke();label(c,cue.safe?(cue.travel>0?'→':'←'):cue.outer?'↓':'Ⅱ',x,y-.5,18,col);}
 }
 hero(c,g,character){
  const p=g.player,rearCarry=!!g.held&&p.dir==='up';oval(c,p.x,p.y+1,12,3.5,'#233d3b35');
  if(rearCarry&&p.moving){c.save();spriteAnchor(c,p.x,p.y);drawHeldWalk(c,this.images[character.id+'-walk.webp'],this.images[character.id+'-idle.webp'],{walkRow:1,walk:p.walk,size:SIDE_HERO_SIZE,sx:256});c.restore();}
  else drawExplorer(c,this.images,character,p,SIDE_HERO_SIZE/ROOM_HERO_SIZE,'flat');
  if(g.held){
   const sign=p.dir==='left'?-1:1,row=p.dir==='up'?1:p.dir==='down'?0:3;
   const grips=HERO_GRIPS[character.id],movesHand=p.moving&&!rearCarry;
   const walkingImage=this.images[character.id+'-walk.webp'];
   let hand=grips.idle[row];
   if(movesHand){
    hand=row===3&&hasSideAnimation(walkingImage)?sideWalkPalm(character.id,p.walk):grips.walk[row][heroWalkFrame(p.walk,row)];
   }
   const hx=p.x+sign*(hand[0]-128)*SIDE_HERO_SIZE/256,hy=p.y+(hand[1]-244)*SIDE_HERO_SIZE/256;
   const x=hx+sign*4,y=hy-20;
   c.strokeStyle='#614935';c.lineWidth=2.2;c.beginPath();c.moveTo(hx,hy);c.lineTo(x,y);c.stroke();
   c.save();c.translate(x,y);c.rotate(g.angle);c.strokeStyle='#b58b4f';c.lineWidth=.9;
   c.beginPath();c.moveTo(0,0);c.lineTo(0,11);c.stroke();this.lamp(c,g.held.color,g.retryLeft<=0,0,11,36);c.restore();
  }
  if(g.shieldLeft>0){c.strokeStyle='#cbf2cda0';c.lineWidth=1.4;c.beginPath();c.ellipse(p.x+8,p.y-27,29,33,0,0,TAU);c.stroke();}
 }
 draw(g,character){
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;
  c.save();c.beginPath();c.rect(0,170,390,500);c.clip();c.translate(-g.camera.x,170);
  const sceneHeight=550,top=440-642/724*sceneHeight;
  c.drawImage(this.images.panorama,0,top,MONASTERY.width,sceneHeight);
  for(const b of MONASTERY_BRIDGES){if(b.x>g.camera.x+450||b.x+b.w<g.camera.x-60)continue;const q=bridgePose(b,g.elapsed),w=1040,h=210;c.save();c.translate(b.x+b.w/2,q.y);c.rotate(q.angle);drawMonasteryBridgeDeck(c,this.images.bridge,w,h);c.restore();}

  if(g.camera.x+390>4260){this.wood(c,4260,310,1940,6);box(c,4260,310,1940,1,'#c4a06c',0);}
  for(const r of LANTERN_ROUTE)if(r.windStart<g.camera.x+480&&r.windEnd>g.camera.x-90)this.windField(c,r,g);
  const depth=[];
  for(const r of LANTERN_ROUTE){if(r.pickup>g.camera.x-60&&r.pickup<g.camera.x+450)depth.push({y:440+laneOffset(r.pickupLane),paint:()=>this.stand(c,r,g)});if(r.hook>g.camera.x-70&&r.hook<g.camera.x+460)depth.push({y:440+laneOffset(r.hookLane),paint:()=>this.hook(c,r,g)});if(r.windStart>g.camera.x-400&&r.windStart<g.camera.x+500)this.streamer(c,r,g);}
  for(const x of CORRIDOR_PILLARS)if(x>g.camera.x-40&&x<g.camera.x+430)depth.push({y:440,paint:()=>this.pillar(c,x,g.elapsed)});
  for(const cart of TEMPLE_CARTS){const q=cartPose(cart,g.elapsed);if(q.x>g.camera.x-100&&q.x<g.camera.x+490)depth.push({y:440+laneOffset(q.lane),paint:()=>this.cart(c,cart,g)});}
  for(const s of TEMPLE_SPLASHES)if(s.x>g.camera.x-80&&s.x<g.camera.x+470)depth.push({y:440+laneOffset(s.lane),paint:()=>this.splash(c,s,g)});
  depth.push({y:g.player.y,paint:()=>this.hero(c,g,character)});depth.sort((a,b)=>a.y-b.y).forEach(d=>d.paint());
  for(const b of TEMPLE_BELLS)if(b.x>g.camera.x-120&&b.x<g.camera.x+510)this.bell(c,b,g);
  if(g.stunLeft>0){c.strokeStyle='#edc17bc0';c.lineWidth=1;c.beginPath();c.ellipse(g.player.x,g.player.y-44,13,4,0,0,TAU);c.stroke();}c.restore();
  this.plaque(c,g);
 }
 plaque(c,g){
  box(c,11,180,368,44,'#5a4b36a8',9);box(c,12,179,366,43,'#fff5dfee',8);c.strokeStyle='#bca77b';c.lineWidth=.7;c.stroke();
  label(c,g.zone.name+' · '+(g.lane<.5?'안쪽':'바깥쪽'),23,191,10,'#62503b','left');const phase=g.wind.phase,hazard=g.nearbyHazard,wind=hazard?.type==='bell'?hazard.cue.text:g.shieldLeft>0?'바람막이 '+Math.ceil(g.shieldLeft)+'초':hazard?.type==='cart'?'↑ ↓ 길 바꿔 수레 피하기':hazard?.type==='splash'?(hazard.lane===0?'↓ 바깥길로 피하기':'↑ 안쪽길로 피하기'):g.shelter?'처마 아래 · 바람 잦아듦':phase==='warning'?'돌풍 예고':phase==='gust'?(g.wind.direction>0?'바람 →':'← 바람'):'↑ ↓ 안쪽·바깥쪽 길';label(c,wind,23,209,hazard?.type==='bell'?12:9,hazard?.type==='bell'?(hazard.cue.safe?'#3d8155':'#a2713f'):phase==='gust'?'#a76443':'#747255','left');
  const x=252,retry=g.retryLeft>0;label(c,retry?(g.retryLeft>1.6?'받침대로 돌아가는 중':'다시 불 켜는 중'):g.held?'연등 안정도':'연등 '+g.banked.size+' / 9',x,190,9,'#5b674d','left');box(c,x,203,111,7,'#d8d8c1',4);const stability=retry?Math.max(0,1-g.retryLeft/1.6):g.held?g.stability:1;box(c,x,203,111*stability,7,retry?'#d9b868':stability<.35?'#d6855e':stability<.65?'#d9b868':'#8eaf86',4);c.strokeStyle='#fff6d6';c.lineWidth=1;c.beginPath();c.moveTo(x+111*.35,202);c.lineTo(x+111*.35,211);c.stroke();
 }
 briefing(c,character,t=0){
  const u=t%4.8,wind=u>=1.5&&u<3.2,moving=!wind,p={x:u<1.5?-12+u*12:u<3.2?6:6-(u-3.2)*11,y:0,dir:u<3.2?'right':'left',moving,walk:t,hammerAge:99};c.save();c.translate(83,104);c.scale(1.45,1.45);if(wind)c.rotate(-.07);this.hero(c,{player:p,held:{color:0},retryLeft:0,angle:wind?Math.sin(t*5)*.25:Math.sin(t*2)*.08,shieldLeft:0},character);c.restore();if(wind){c.strokeStyle='#81afad99';c.lineWidth=1;for(let i=0;i<3;i++){const x=18+(u*28+i*11)%31,y=48+i*10;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+15,y-3,x+26,y);c.stroke();}}
 }
 entrance(c){
  c.clearRect(0,0,260,230);const s=220;c.drawImage(this.images.entrance,(260-s)/2,(230-s)/2,s,s);
 }
}
