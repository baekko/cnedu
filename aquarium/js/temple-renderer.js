import {templeBriefing} from './briefing-scenes.js?v=155';
import {drawClueCard} from './clue-card-art.js?v245';
import {loadRecoveryArt,drawRecoveryItems,drawVitalityFx} from './game-items.js';
import {drawScyllaNeck} from './scylla-neck.js';
import {SCYLLA,scyllaRest,scyllaAttackPose,scyllaSpritePose,scyllaGrabPose} from './temple-scylla.js?v=157';
import {sirenWaveRadii} from './temple-siren.js?v=157';
import {walkFrame} from './walk-cycle.js';
import {makeTempleEffects,drawWindField} from './temple-fx.js';
import {makeCombatEffects,drawBoltGround} from './temple-combat-fx.js?v307';
import {beginScene} from './layout.js';
import {drawTempleHero as drawExplorer} from './temple-hero.js?v=155';
import {TEMPLE,TEMPLE_FINISH,routeZ} from './temple-core.js?v308';
import {TempleWorld} from './temple-world.js?v308';
import {makeSeaEffects} from './temple-water.js?v307';
const TEMPLE_REVISED_ART=new Set(['temple.webp','forest.webp','sea.webp','temple-garden.webp','forest-coast.webp','boat-v20.webp','head.webp']);
const ITHACA_ART=new Set(['ithaca.webp','ithaca-gate.webp']);
export async function loadTempleAssets(character){
 await loadRecoveryArt();
 const files=['temple','forest','sea','ithaca','ithaca-gate','temple-garden','forest-coast','cliff','head','pig','entrance','land-route'].map(n=>n+'.webp');
 files.push(`${character.id}-armor.webp`,'pig-walk.webp','gods-actions-v20.webp','waves-v21.webp','heroes-rowing-v20.webp','boat-v20.webp');const images={};
 await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[file]=im;resolve();};im.onerror=()=>reject(new Error('신전 그림: '+file));const dir=ITHACA_ART.has(file)?'temple-v308':file==='land-route.webp'?'temple-v307':TEMPLE_REVISED_ART.has(file)?'temple-v306':file.endsWith('-armor.webp')?'temple-v153':file==='pig-walk.webp'?'temple-v156':'temple';im.src=new URL(`../assets/${dir}/${file}`,import.meta.url).href;})));return images;
}
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pill=(c,x,y,w,h,fill)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,9);c.fill();};
// Grip centers in the seated artwork's 256px cells, ordered port then starboard.
// The port grip passes behind the rower's torso at full extension.
const ROWER_GRIPS={
 narin:{row:0,hands:[[[104,162],[194,160]],[[86,178],[209,171]],[[81,176],[201,181]],[[104,164],[197,164]]]},
 soi:{row:1,hands:[[[104,150],[214,142]],[[84,168],[211,171]],[[90,169],[205,181]],[[104,156],[213,150]]]},
 haru:{row:2,hands:[[[103,144],[202,135]],[[89,151],[204,156]],[[85,149],[192,160]],[[107,146],[222,134]]]},
 doyun:{row:3,hands:[[[101,148],[205,135]],[[93,171],[218,173]],[[86,165],[215,180]],[[101,161],[207,157]]]},
};
const ROWER={x:-18,y:-47,size:36,leanY:-26};
const ROWLOCKS=[[-17.4,-23.5],[17.2,-23.5]];
function shaft(c,x,y,endX,endY){
 c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(endX,endY);
 c.strokeStyle='#6d482c';c.lineWidth=3.5;c.stroke();
 c.strokeStyle='#d6a760';c.lineWidth=1.4;c.stroke();
}
export class TempleRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];this.fx=makeTempleEffects();this.combat=makeCombatEffects();this.world=new TempleWorld(images);this.sea=makeSeaEffects(images['sea.webp'],images['waves-v21.webp']);}
 effect(){}
 sprite(c,name,x,y,w,anchor=1,mirror=false){const im=this.images[name+'.webp'];if(!im)return;const h=w*im.height/im.width;c.save();c.translate(x,y);if(mirror)c.scale(-1,1);c.drawImage(im,-w/2,-h*anchor,w,h);c.restore();}
 deity(c,name,x,y,w,frame=0,faceLeft=true){const row={zeus:0,circe:1,poseidon:2,wind:3,siren:4}[name],im=this.images['gods-actions-v20.webp'];if(!im){this.sprite(c,name,x,y,w,1,faceLeft);return;}c.save();c.translate(x,y);if(faceLeft)c.scale(-1,1);c.drawImage(im,frame*256,row*256,256,256,-w/2,-w,w,w);c.restore();}
 castFrame(g,name){const age=g.casts[name];if(age===undefined||age>1.3)return 0;return name==='zeus'?(age<.55?1:age<1.05?2:3):(age<.32?1:age<.68?2:3);}
 introduce(c,g,key,name,x,headY){
  if(headY<8||headY>450)return;this.introductions ||= new Map();if(!this.introductions.has(key))this.introductions.set(key,g.elapsed);
  const age=g.elapsed-this.introductions.get(key);if(age>3.2)return;c.save();c.globalAlpha=Math.min(1,(3.2-age)*2);c.font='bold 11px sans-serif';c.textAlign='center';const w=Math.max(58,c.measureText(name).width+22),cx=clamp(x,w/2+7,383-w/2),y=Math.max(6,headY-27);pill(c,cx-w/2,y,w,23,'#173f4ce8');c.fillStyle='#ffe6a7';c.fillText(name,cx,y+16);c.restore();
 }
 boat(c,g,character,t,rider=true){
  const bob=Math.sin(t*2.4)*1.5,rowing=rider&&g.player.moving&&g.stunLeft<=0,phase=rowing?(g.player.walk/.9)%1:.25;
  const pose=ROWER_GRIPS[character.id]??ROWER_GRIPS.narin,frame=Math.floor(phase*4);
  const lean=g.stunLeft>0?.32:0,cos=Math.cos(lean),sin=Math.sin(lean);
  const oars=ROWLOCKS.map(([x,y],i)=>{
   const [u,v]=pose.hands[frame][i],handX=ROWER.x+u*ROWER.size/256,handY=ROWER.y+v*ROWER.size/256;
   const gripX=rider?handX*cos-(handY-ROWER.leanY)*sin:x*.4;
   const gripY=rider?ROWER.leanY+handX*sin+(handY-ROWER.leanY)*cos:y;
   const dx=x-gripX,dy=y-gripY,reach=22/Math.hypot(dx,dy);
   return {x,y,gripX,gripY,endX:x+dx*reach,endY:y+dy*reach,angle:Math.atan2(dy,dx)};
  });
  c.save();c.translate(0,bob);
  for(const {x,y,endX,endY,angle} of oars){
   shaft(c,x,y,endX,endY);
   c.save();c.translate(endX,endY);c.rotate(angle);
   c.fillStyle='#b48248';c.strokeStyle='#6c462d';c.lineWidth=.8;c.beginPath();c.roundRect(-2,-3.3,13,6.6,2);c.fill();c.stroke();
   c.fillStyle='#e5bc79';c.fillRect(0,-2.5,9,1);c.restore();
   if(rowing&&phase<.55){c.strokeStyle='#dcfff3bb';c.lineWidth=1;c.beginPath();c.ellipse(endX,endY+3,7,3,0,.1,Math.PI);c.stroke();}
  }
  this.sprite(c,'boat-v20',0,18,62,1);
  if(rider){
   // The inboard shaft shares the rowlock and ends under the fingers.
   for(const {x,y,gripX,gripY} of oars)shaft(c,x,y,gripX,gripY);
   c.save();if(lean){c.translate(0,ROWER.leanY);c.rotate(lean);c.translate(0,-ROWER.leanY);}
   c.drawImage(this.images['heroes-rowing-v20.webp'],frame*256,pose.row*256,256,256,ROWER.x,ROWER.y,ROWER.size,ROWER.size);c.restore();
   // Foreground stern rail always stays in front of the seated lower body.
   const im=this.images['boat-v20.webp'],h=62*im.height/im.width,cut=.79;c.drawImage(im,0,im.height*cut,im.width,im.height*(1-cut),-31,18-h*(1-cut),62,h*(1-cut));
   for(const [x,y] of ROWLOCKS){c.fillStyle='#e9bf6d';c.beginPath();c.arc(x,y,1.6,0,TAU);c.fill();}
  }c.restore();
 }
 background(c,g,Y){this.world.draw(c,Y);}
 atmosphere(c,g,Y,t){
  const frame=Math.floor(t*10)%8;
  // World-anchored sheets move with the water, never with the camera.
  for(let z=routeZ(1890);z<routeZ(4680);z+=128){const y=Y(z);if(y<-130||y>510)continue;for(let x=-25;x<390;x+=128)this.fx.draw(c,0,(frame+Math.floor(z/128)+Math.floor(x/128))%8,x,y,128,128,.8);}
  drawWindField(c,Y,t,routeZ(1500),routeZ(1750));
  // Cloth flags bend from the pole; frame steps keep the illustration flat.
  for(const z of [280,810,1550,1780]){const y=Y(routeZ(z));if(y<-80||y>580)continue;const windy=z>1400,flap=Math.sin(frame/8*Math.PI*2+(z%3))*(windy?5:1.7);c.save();c.translate(windy?64:58,y);c.strokeStyle='#967848';c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.lineTo(0,-70);c.stroke();c.fillStyle=windy?'#d9d6ad':'#21657c';c.strokeStyle='#d5b776';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-66);c.bezierCurveTo(14,-68+flap,22,-58-flap,35,-63+flap);c.lineTo(29,-45+flap);c.bezierCurveTo(18,-42-flap,10,-50+flap,0,-46);c.closePath();c.fill();c.stroke();c.restore();}
 }
 card(c,card,Y,t){const y=Y(card.z);if(y<-45||y>545||card.collected)return;c.save();if(card.locked)c.globalAlpha=.4;c.translate(card.x,y-14+Math.sin(t*3+card.id)*2);c.rotate(Math.sin(t*1.4+card.id)*.06);drawClueCard(c,0,0,24,34);c.restore();}
 sirens(c,g,Y,t){
  for(const [x,z,flip] of [[28,2190,false],[362,2410,true]]){
   const y=Y(routeZ(z));if(y<-120||y>600)continue;const active=g.zone.id==='siren'&&g.siren.z===routeZ(z)&&g.siren.active;
   const age=g.siren.age,frame=active?(age<1.15?1:Math.floor(age*4)%2?2:3):0;this.deity(c,'siren',x,y+14+Math.sin(t*2)*2,84,frame,flip);
   if(active){
    this.sea.sirenReflection(c,x,y,t);
    let i=0;for(const r of sirenWaveRadii(g.siren)){c.strokeStyle=`rgba(235,191,255,${.22+.43*(1-r/180)})`;c.lineWidth=5;c.beginPath();c.arc(x,y,r,flip?Math.PI*.5:-Math.PI*.5,flip?Math.PI*1.5:Math.PI*.5);c.stroke();const a=(flip?Math.PI:0)+Math.sin((i++)+t)*.7;c.save();c.translate(x+Math.cos(a)*r,y+Math.sin(a)*r);c.fillStyle='#ffe9ff';c.strokeStyle='#e9afff';c.lineWidth=2;c.beginPath();c.ellipse(-3,4,4,3,-.4,0,TAU);c.fill();c.beginPath();c.moveTo(0,3);c.lineTo(0,-9);c.lineTo(6,-6);c.stroke();c.restore();}
   }
   this.introduce(c,g,'siren-'+z,'사이렌',x,y-70);
  }
 }
 scylla(c,g,Y,t,character){
  const baseY=Y(SCYLLA.baseZ);if(baseY<-280||baseY>800)return;
  const cliff=this.images['cliff.webp'],w=156,h=w*cliff.height/cliff.width;c.drawImage(cliff,300,baseY-h*.28,w,h);
  // Cut only the entering figure out at the aperture. Never repaint a black
  // patch over the other five heads or draw another copy of the cave.
  const outsideCave=draw=>{
   c.save();c.beginPath();c.rect(0,0,390,500);
   const aperture=[[.41,.18],[.48,.188],[.54,.225],[.58,.27],[.59,.35],[.54,.365],[.34,.348],[.32,.30],[.33,.24],[.37,.20]];
   aperture.forEach(([x,y],i)=>{const px=300+x*w,py=baseY-h*.28+y*h;i?c.lineTo(px,py):c.moveTo(px,py);});
   c.closePath();c.clip('evenodd');draw();c.restore();
  };
  const heads=[];
  for(let i=0;i<6;i++){
   const h=g.hazards.find(h=>h.kind==='head'&&h.head===i),grab=g.scyllaGrab?.head===i?g.scyllaGrab:null;
   if(grab&&!scyllaGrabPose(grab).headVisible)continue;
   if(!grab&&g.scyllaWithdrawn?.has(i)&&(!h||h.age<h.warn))continue;
   const motion=grab?scyllaGrabPose(grab):h?scyllaAttackPose(h,t):scyllaRest(i,t),pose=scyllaSpritePose(motion,Y);
   const occluded=!!grab||!!h?.fromCave,neck=()=>drawScyllaNeck(c,{x:360+i*2,y:baseY},pose,i);
   heads.push({...pose,occluded});if(occluded)outsideCave(neck);else neck();
  }
  const grab=g.scyllaGrab,carry=grab?scyllaGrabPose(grab):null;
  const drawCaptured=()=>{c.save();c.translate(carry.hero.x,Y(carry.hero.z));c.rotate(carry.returning?-.35:-.16);drawExplorer(c,this.images,character,{x:0,y:0,dir:'left',moving:false},36/56);c.restore();};
  if(carry?.heroVisible&&!carry.returning)outsideCave(drawCaptured);
  // All necks stay behind the heads, including the overlapping strike frames.
  for(const h of heads.sort((a,b)=>a.top-b.top)){const draw=()=>c.drawImage(this.images['head.webp'],h.left,h.top,h.width,h.height);if(h.occluded)outsideCave(draw);else draw();}
  if(carry?.returning)outsideCave(drawCaptured);
  this.introduce(c,g,'scylla','스킬라',325,baseY-118);
 }
 whirlpool(c,g,Y,t){
  const cy=Y(routeZ(3585));if(cy<-160||cy>660)return;
  this.sea.whirlpool(c,150,cy,t,g.whirlpoolStrength);
  this.introduce(c,g,'whirlpool','카리브디스',150,cy-145);
 }
 finishGate(c,Y){
  const {x,z,halfWidth}=TEMPLE_FINISH,y=Y(z);
  if(y<-20||y>580)return;
  const width=2*halfWidth,cell=width/16,gate=this.images['ithaca-gate.webp'];
  c.save();c.fillStyle='#927b63';c.fillRect(x-halfWidth,y-4,width,8);
  for(let col=0;col<16;col++)for(let row=0;row<2;row++){
   c.fillStyle=(col+row)%2?'#ead7af':'#2d6685';
   c.fillRect(x-halfWidth+col*cell+.35,y-4+row*4+.35,cell-.7,3.3);
  }
  // Atlas foot anchor y=373 and the measured 640px wide clear opening.
  const scale=width/640,top=y-373*scale;
  c.drawImage(gate,x-420*scale,top,gate.width*scale,gate.height*scale);
  c.fillStyle='#785737';c.fillRect(x-21,top+7,42,20);
  c.fillStyle='#315779';c.fillRect(x-20,top+8,40,18);
  c.fillStyle='#fff0ce';c.textAlign='center';c.textBaseline='middle';c.font='800 12px sans-serif';
  c.fillText('골인',x,top+17);
  c.restore();
 }

 hazard(c,h,g,Y){
  if(h.age>=h.life)return;
  const r=g.isBoat?15:9,y=Y(h.z);
  if(h.kind==='wave'){
   this.sea.wave(c,h,Y,h.gapSize/2-r,r+15);
   return;
  }
  if(y<-90||y>590)return;
  if(h.kind==='head'){
   if(!h.bit&&h.age<h.warn+SCYLLA.reach)this.sea.scyllaWake(c,h.x,y,clamp(h.age/h.warn,0,1));
   return;
  }
  c.save();c.translate(h.x,y);
  drawBoltGround(c,h,h.r+r);
  if(h.age>=h.warn){
   const strikeAge=h.age-h.warn;
   this.combat.draw(c,'bolt',Math.floor(strikeAge*20),-80,-210,160,240,Math.max(.38,1-strikeAge*1.55));
  }
  c.restore();
 }
 hero(c,g,character,Y,t){const p=g.player,y=Y(p.z);c.save();c.translate(p.x,y);c.fillStyle='#193c4938';c.beginPath();c.ellipse(0,2,g.isBoat?24:13,g.isBoat?9:5,0,0,TAU);c.fill();
  if(g.transit){const boarding=g.mode==='boarding',f=1-g.transitionLeft/.7,aboard=boarding?f>.85:f<.15,boatX=boarding?195:g.transit.x,boatZ=boarding?g.transit.targetZ:g.transit.z;c.save();c.translate(boatX-p.x,Y(boatZ)-y);this.boat(c,g,character,t,aboard);c.restore();if(!aboard)drawExplorer(c,this.images,character,{...p,x:0,y:5,dir:'up',moving:true,walk:(p.walk||0)+f},boarding?1-.38*f:.62+.38*f);}
  else if(g.isBoat){c.rotate((p.dir==='left'?-.08:p.dir==='right'?.08:0)+Math.sin(t*2)*.02);this.boat(c,g,character,t,!g.scyllaGrab);if(p.moving){c.strokeStyle='#d3ffffaa';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.ellipse(0,22+i*8+Math.floor(t*10)%4,13+i*5,4,0,.1,Math.PI-.1);c.stroke();}}}
  else if(g.pigLeft>0){const im=this.images['pig-walk.webp'],frame=p.moving?walkFrame(p.walk,8):0;c.save();if(p.dir==='left')c.scale(-1,1);c.drawImage(im,(frame%4)*256,Math.floor(frame/4)*256,256,256,-20,-37,40,40);c.restore();}
  else{if(g.stunLeft>0){const fall=Math.min(1,(3-g.stunLeft)/.25);c.translate(0,-8);c.rotate(fall*1.3);drawExplorer(c,this.images,character,{...p,x:0,y:8,moving:false,dir:'down'});}else{if(g.windActive)c.rotate(-.13-.02*Math.sin(Math.floor(t*8)/8*4));drawExplorer(c,this.images,character,{...p,x:0,y:0});}}
  if(!g.scyllaGrab&&(g.shieldLeft>0||g.invulnerable>0)){c.strokeStyle=g.shieldLeft>0?'#f9d975':`rgba(255,246,183,${.4+.5*Math.sin(t*20)**2})`;c.lineWidth=g.shieldLeft>0?3:2;c.shadowColor='#ffedb0';c.shadowBlur=9;c.beginPath();c.ellipse(0,-24,29,40,0,0,TAU);c.stroke();}
  if(g.sirenSlowLeft>0&&!g.scyllaGrab){for(const side of [-1,1]){c.save();c.translate(side*19,-46+Math.sin(t*5+side)*3);c.strokeStyle='#684a80';c.fillStyle='#f5c9ff';c.lineWidth=2;c.beginPath();c.ellipse(-2,4,3.5,2.5,-.4,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(1,3);c.lineTo(1,-7);c.lineTo(6,-5);c.stroke();c.restore();}}
  c.restore();if(g.stunLeft>0){c.save();c.translate(p.x,y-40);for(let i=0;i<3;i++){const a=Math.floor(t*8)/8*4+i*TAU/3,x=Math.cos(a)*19,yy=Math.sin(a)*6;c.strokeStyle='#ffdd71';c.lineWidth=2;c.beginPath();c.moveTo(x-3,yy);c.lineTo(x+3,yy);c.moveTo(x,yy-3);c.lineTo(x,yy+3);c.stroke();}c.restore();}
 }
 draw(game,character,time){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!game)return;if(this.introGame!==game){this.introGame=game;this.introductions=new Map();}const g=game,t=g.elapsed,Y=z=>420-(z-g.cameraZ);c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();this.background(c,g,Y);this.atmosphere(c,g,Y,t);this.finishGate(c,Y);
  const deco=[['zeus',325,575,105],['circe',325,1300,77],['wind',36,1680,95],['poseidon',350,4480,128]];
  for(const [name,x,z,w] of deco){const y=Y(routeZ(z));if(y>-90&&y<650){const frame=name==='wind'?(g.windActive?[1,2,2,3][Math.floor(t*4)%4]:0):this.castFrame(g,name);this.deity(c,name,x,y,w,frame,name!=='wind');this.introduce(c,g,name,{zeus:'제우스',circe:'키르케',wind:'아이올로스',poseidon:'포세이돈'}[name],x,y-w);}}
  this.sirens(c,g,Y,t);this.whirlpool(c,g,Y,t);
  if(!g.isBoat&&g.mode==='walk'&&Y(routeZ(1880))>-100&&Y(routeZ(1880))<550)this.sprite(c,'boat-v20',195,Y(routeZ(1910))+18,62);
  if(g.mode==='shore'&&g.dockedBoat)this.sprite(c,'boat-v20',g.dockedBoat.x,Y(g.dockedBoat.z)+18,62);
  for(const h of g.hazards)this.hazard(c,h,g,Y);
  for(const card of g.cards)this.card(c,card,Y,t);
  for(const b of g.orbs){if(b.age<(b.launchDelay||0)||b.age>=5)continue;const y=Y(b.z),speed=Math.hypot(b.vx,b.vz)||1;for(let i=3;i>0;i--)this.combat.draw(c,'orb',Math.floor(t*10)-i,b.x-b.vx/speed*i*5-15,y+b.vz/speed*i*5-15,30,30,.13);this.combat.draw(c,'orb',Math.floor(t*10),b.x-18,y-18,36,36);}

  drawRecoveryItems(c,g,p=>({x:p.x,y:Y(p.z)}));this.hero(c,g,character,Y,t);this.scylla(c,g,Y,t,character);if(!g.scyllaGrab)drawVitalityFx(c,g,g.player.x,Y(g.player.z)-23,30);if(g.isBoat&&!g.scyllaGrab)this.fx.draw(c,2,Math.floor(t*7),g.player.x-46,Y(g.player.z)-25,92,92,.55);if(g.effects.some(e=>e.kind==='recovery'))this.fx.draw(c,3,Math.floor(t*8),g.player.x-47,Y(g.player.z)-71,94,94,.8);
  for(const e of g.effects){c.save();c.globalAlpha=Math.max(0,1-e.age/.9);c.fillStyle='#fff5bf';if(e.kind==='card'){c.font='bold 12px sans-serif';c.textAlign='center';c.fillText('+1 단서',e.x,Y(e.z)-35-e.age*24);}else for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillRect(e.x+Math.cos(a)*e.age*35,Y(e.z)+Math.sin(a)*e.age*24,3,3);}c.restore();}
  if(!g.ended){
   if(g.zoneAge<3){pill(c,105,422,180,25,'#183e4be8');c.fillStyle='#ffe9b8';c.font='bold 12px sans-serif';c.textAlign='center';c.fillText(g.zone.name,195,439);}
   let tip='';if(g.scyllaGrab)tip='스킬라가 물고 동굴로 끌고 가요';else if(g.sirenSlowLeft>0)tip='음파에 닿아 배가 느려졌어요';else if(g.pigLeft>0)tip='돼지로 변해도 계속 움직일 수 있어요';else if(g.windActive)tip='← + ↑ 함께 누르고 바람을 버티며 걸어가요';else if(g.interaction)tip=g.interaction==='탑승'?'탑승 버튼을 눌러 바다로 떠나요':'하차 버튼을 눌러 이타카로!';else if(g.mode==='walk'&&g.windDone&&g.player.z>routeZ(1785))tip='부두 끝의 배 가까이로 걸어가세요';else if(g.zone.id==='scylla'&&g.headsLanded.size<6)tip=`여섯 머리의 공격을 피해요 · ${g.headsLanded.size}/6`;else if(g.charmed>0)tip=g.siren.side<0?'→ 오른쪽으로 조종해 노래를 벗어나요':'← 왼쪽으로 조종해 노래를 벗어나요';else if(g.zoneAge<4&&g.zoneAge>1)tip=g.zone.id==='wind'&&g.windDone?'부두로 이동해 배에 탑승해요':g.zone.tip;
   if(tip){pill(c,23,456,344,29,'#143f4be8');c.fillStyle='#fff1ce';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText(tip,195,475);}
   c.fillStyle='#f7edcc60';c.fillRect(18,493,354,3);c.fillStyle='#f2c66f';c.fillRect(18,493,354*clamp(g.player.z/TEMPLE.goal,0,1),3);
  }
  if(g.recoveryNoticeLeft>0){const text='아테나의 가호가 있었습니다.';c.save();c.font='bold 12px sans-serif';c.textAlign='center';const w=c.measureText(text).width+24,x=clamp(g.player.x,w/2+7,383-w/2),y=clamp(Y(g.player.z)-85,12,395);c.globalAlpha=Math.min(1,g.recoveryNoticeLeft*3);pill(c,x-w/2,y,w,27,'#254f52ef');c.strokeStyle='#e9cf8d';c.lineWidth=1;c.beginPath();c.roundRect(x-w/2,y,w,27,9);c.stroke();c.fillStyle='#fff2c4';c.fillText(text,x,y+18);c.restore();}
  c.restore();
 }
 briefing(c,character,t){templeBriefing(this,c,character,t);}
}
