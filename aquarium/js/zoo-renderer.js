import {hasSideAnimation,sideWalkCell} from './side-walk.js?v=155';
import {SIDE_HERO_SIZE} from './hero-scale.js';
import {drawClueCard,usesCoinRewards} from './clue-card-art.js?v245';
import {beginScene} from './layout.js';
import {ZOO,ZOO_FEED_ZONE,ZOO_SUPPORT,FEED_ANIMALS,animalPose,trajectory} from './zoo-core.js?v=155';
import {ANIMAL_ART} from './zoo-approved-art.js?v313';
import {hippoFrameIndex} from './zoo-hippo-motion.js';
import {heroPose,heroPoint,releasePoint} from './zoo-hero-pose.js?v=155';
import {drawZooScenery,drawHippoWake,waterHeight} from './zoo-scenery.js?v315';
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ellipse=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const line=(c,x,y,xx,yy,color,w=1)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
const box=(c,x,y,w,h,color,r=5)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
// The scene art uses the existing atlas grids, anchor points and shoreline.
export async function loadZooAssets(){
 const images={};
 const animals=new Set(Object.entries(ANIMAL_ART).filter(([kind])=>kind!=='hippo').map(([,art])=>art.sheet));
 const props=['lion-rock','giraffe-pole','rock-low','rock-high','prop-monkey-tree-v63','ice'];
 const files=[
  ...[...animals].map(name=>['zoo-v313/'+name+'.webp',name]),
  ...props.map(name=>['zoo-v313/'+name+'.webp',name]),
  ['zoo-v315/world.webp','world-approved'],['zoo-v313/hippo-motion.webp','hippo-motion'],
  ['zoo/entrance.webp','entrance'],['zoo/clue.webp','clue'],['language/throw-v42.webp','throw']
 ];
 for(const id of ['haru','doyun','narin','soi'])for(const action of ['idle','walk'])files.push(['hero-v153/'+id+'-'+action+'.webp',id+'-'+action]);
 await Promise.all(files.map(([path,key])=>new Promise((resolve,reject)=>{
  const im=new Image();im.onload=()=>{images[key]=im;resolve();};
  im.onerror=()=>reject(Error('동물원 그림: '+path));
  im.src=new URL('../assets/'+path,import.meta.url).href;
 })));
 return images;
}
export class ZooRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];this.waterSprite=document.createElement('canvas');this.waterMask=document.createElement('canvas');this.waterSprite.width=this.waterSprite.height=this.waterMask.width=this.waterMask.height=384;}
 effect(){}
 entrance(c){const im=this.images.entrance,k=Math.min(250/im.width,212/im.height);c.drawImage(im,(260-im.width*k)/2,(230-im.height*k)/2,im.width*k,im.height*k);}
 food(c,kind,x,y,size=14,rot=0){c.save();c.translate(x,y);c.rotate(rot);c.scale(size/18,size/18);if(kind==='fish'){c.fillStyle='#7ba9ae';c.beginPath();c.moveTo(-7,0);c.lineTo(-13,-6);c.lineTo(-12,6);c.closePath();c.fill();const gr=c.createLinearGradient(0,-5,0,5);gr.addColorStop(0,'#6e9eac');gr.addColorStop(.55,'#c9e1d9');gr.addColorStop(1,'#739cab');ellipse(c,1,0,10,5,gr);line(c,3,-4,3,4,'#6a969c',1);ellipse(c,7,-1,1,1,'#324f59');line(c,-4,-1,0,-5,'#8caeae',1);}else if(kind==='leaf'){for(let i=0;i<3;i++){c.save();c.rotate((i-1)*.5);ellipse(c,0,-2,4.2,10,['#8ba646','#668b3d','#a2b655'][i]);line(c,0,7,0,-9,'#c7d58a',.8);c.restore();}line(c,-3,7,3,7,'#d7b36a',2);}else if(kind==='banana'){c.strokeStyle='#b58a39';c.lineWidth=6;c.beginPath();c.arc(-3,-4,12,.1,1.8);c.stroke();c.strokeStyle='#f2ce6d';c.lineWidth=4;c.stroke();ellipse(c,9,-2,2,2,'#977348');}else if(kind==='meat'){ellipse(c,0,0,11,8,'#b76c58');ellipse(c,0,-1,8.5,5.5,'#dc9a82');ellipse(c,3,-1,2.5,2.5,'#f3d5b4');line(c,-6,-1,-2,2,'#f0bd9e',1);}else if(kind==='melon'){c.fillStyle='#759b54';c.beginPath();c.moveTo(-11,-4);c.arc(0,-4,11,0,Math.PI);c.closePath();c.fill();c.fillStyle='#e5a078';c.beginPath();c.moveTo(-8,-4);c.arc(0,-4,8,0,Math.PI);c.closePath();c.fill();for(const xx of[-4,0,4])ellipse(c,xx,0,.6,1,'#716044');}else{const gr=c.createRadialGradient(-3,-4,1,0,0,11);gr.addColorStop(0,'#f2bd77');gr.addColorStop(1,'#c56b44');ellipse(c,0,0,10,9,gr);line(c,0,-7,2,-12,'#80673d',1.6);ellipse(c,6,-11,4,2,'#769a4e');}c.restore();}
 hero(c,character,p,size=SIDE_HERO_SIZE,charging=false,food=null){
  const walkingImage=this.images[character.id+'-walk'];
  const pose=heroPose(character.id,p,charging,hasSideAnimation(walkingImage)),im=this.images[pose.sheet];
  const cell=pose.walk===undefined?{x:pose.frame*256,y:pose.row*256,size:256}:sideWalkCell(im,pose.walk,pose.row);
  c.save();c.translate(p.x,p.y);c.scale(pose.face,1);
  c.drawImage(im,cell.x,cell.y,cell.size,cell.size,-size/2,-size*.955,size,size);
  if(food&&pose.food){
   const q=heroPoint({x:0,y:0},pose.food,size);this.food(c,food,q.x,q.y,11*size/72,-.15);
   // Original palm pixels sit in front of the food to show a genuine grip.
   const [x,y,w,h]=pose.crop,k=size/256,px=(x-128)*k,py=(y-256*.955)*k;
   c.save();c.beginPath();c.ellipse(px+w*k/2,py+h*k/2,w*k*.43,h*k*.43,0,0,TAU);c.clip();
   const sourceScale=cell.size/256;
   c.drawImage(im,cell.x+x*sourceScale,cell.y+y*sourceScale,w*sourceScale,h*sourceScale,px,py,w*k,h*k);c.restore();
  }
  c.restore();
 }
 briefing(c,character,t){
  const q=t%3.8,charge=q>.5&&q<1.35,p={x:61,y:111,face:1,moving:false,shotAge:q>=1.35?q-1.35:99},o=releasePoint(character.id,p,94);
  this.hero(c,character,p,94,charge,q<1.49?'apple':null);
  if(q>=1.49&&q<2.25){const u=(q-1.49)/.76;this.food(c,'apple',o.x+80*u,o.y-75*u+70*u*u,11*94/72,u*3);}
  if(charge){c.save();c.setLineDash([2,6]);c.strokeStyle='#b69a58';c.lineWidth=1.5;c.beginPath();c.moveTo(o.x,o.y);c.quadraticCurveTo(o.x+40,o.y-65,o.x+80,o.y-5);c.stroke();c.restore();}
 }
 habitat(c,a){const s=a.spec,b=s.start;
  if(s.kind==='lion'){const im=this.images['lion-rock'],w=204,h=w*im.height/im.width;c.drawImage(im,b+189,342,w,h);}
  if(s.kind==='giraffe'){const im=this.images['giraffe-pole'];c.drawImage(im,b+332,184,62,226);}
  if(s.kind==='monkey'){const im=this.images['prop-monkey-tree-v63'],w=ZOO_SUPPORT.monkey.treeWidth,h=w*im.height/im.width;c.drawImage(im,b+ZOO_SUPPORT.monkey.treeX,350-h*.65496,w,h);}
  if(s.kind==='otter'){for(const [key,x,top,w,sy]of [['rock-low',195,402,102,.26891],['rock-high',291,343,108,.13333]]){const im=this.images[key],h=w*im.height/im.width;c.drawImage(im,b+x,top-h*sy,w,h);}}
  if(s.kind==='penguin'){const im=this.images.ice,w=224,h=w*im.height/im.width;c.drawImage(im,b+187,ZOO_SUPPORT.iceY-h*.34884,w,h);}

 }
 waterFront(c,a,t){
  const p=animalPose(a),s=a.spec,b=s.start;if(s.kind==='hippo'){
   drawHippoWake(c,p,t,a.waterPulses);
  }else if(s.kind==='otter'&&p.moving){for(let i=0;i<4;i++){c.strokeStyle='#e1efdb99';c.lineWidth=1;c.beginPath();c.ellipse(p.x-i*6,p.y+1,9+i*4,2+i,0,0,TAU);c.stroke();}}
 }
 animal(c,a,t){
  const p=animalPose(a),art=ANIMAL_ART[p.kind];
  if(p.kind!=='hippo'&&p.water<.8&&!p.airborne)ellipse(c,p.x,p.y+1,p.size*.24,4,'#50604722');
  if(p.kind==='hippo'){
   const w=this.waterSprite.getContext('2d');w.clearRect(0,0,384,384);
   w.globalCompositeOperation='source-over';w.globalAlpha=1;const frame=hippoFrameIndex(p.rig);w.drawImage(this.images['hippo-motion'],frame%13*256,Math.floor(frame/13)*176,256,176,0,96,384,264);
   const m=this.waterMask.getContext('2d');m.clearRect(0,0,384,384);
   for(let x=0;x<384;x+=3){const wx=p.x+(x-192)*p.size/384,y=(waterHeight(wx,t)-p.y)*384/p.size+art.baseline;
    const fade=m.createLinearGradient(0,y-5,0,y+4);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#ffffff00');m.fillStyle=fade;m.fillRect(x,0,3,384);
   }
   w.globalCompositeOperation='destination-in';w.drawImage(this.waterMask,0,0);w.globalCompositeOperation='source-over';
   c.drawImage(this.waterSprite,p.x-p.size/2,p.y-p.size*art.baseline/384,p.size,p.size);return p;
  }
  c.save();
  c.translate(p.x,p.y);c.scale(p.flip?-1:1,1);
  c.drawImage(this.images[art.sheet],p.spriteFrame*384,art.row*384,384,384,-p.size/2,-p.size*350/384,p.size,p.size);c.restore();
  if(p.kind==='lion'&&p.open&&a.attention<=0){for(let i=0;i<3;i++){c.strokeStyle='#e6c98b88';c.lineWidth=1.2;c.beginPath();c.arc(p.target.x-8,p.target.y,9+i*7,Math.PI*.7,Math.PI*1.3);c.stroke();}}
  return p;
 }
 card(c,id,x,y,size=26){drawClueCard(c,x,y,size,size*1.3);}
 heart(c,x,y,s,color){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=color;c.beginPath();c.moveTo(0,3);c.bezierCurveTo(-12,-4,-9,-12,-3,-8);c.quadraticCurveTo(0,-5,3,-8);c.bezierCurveTo(9,-12,12,-4,0,3);c.fill();c.restore();}
 feedSpot(c,start){
  const {left,right,top,bottom}=ZOO_FEED_ZONE;
  const mid=(left+right)/2,ink='#8c7754';
  c.save();c.strokeStyle=ink;c.lineWidth=1.15;c.setLineDash([4,4]);
  c.beginPath();c.roundRect(start+left,top,right-left,bottom-top,4);c.stroke();
  c.setLineDash([]);
  for(const side of [-1,1]){
   c.save();c.translate(start+mid+side*8,439+(side>0?1:-1));c.rotate(side*.21);
   ellipse(c,0,1.6,2.6,4.6,ink);
   ellipse(c,0,-4.2,3,2.3,ink);
   c.restore();
  }
  c.restore();
 }
 draw(g,character){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();c.save();c.translate(-g.camera.x,0);
  drawZooScenery(c,this.images['world-approved'],g.camera.x,g.elapsed);
  for(let i=0;i<g.animals.length;i++){const a=g.animals[i],s=a.spec,display=animalPose(a);if(s.kind==='hippo'?display.x-display.size/2>g.camera.x+420||display.x+display.size/2<g.camera.x-30:s.start>g.camera.x+480||s.start+420<g.camera.x-100)continue;this.habitat(c,a);if(a.fed<2)this.feedSpot(c,s.start);const p=this.animal(c,a,g.elapsed);this.waterFront(c,a,g.elapsed);
   // Low rail leaves the animal's face and the complete trajectory unobscured.
   for(const x of [s.start+205,s.start+395]){line(c,x,418,x,392,'#927854',5);line(c,x-1,414,x-1,393,'#c7af81',1.4);}line(c,s.start+206,400,s.start+394,400,'#c6aa7e',2);line(c,s.start+206,409,s.start+394,409,'#a78c64',1.7);
   if(s.id===g.active.spec.id&&a.fed<2&&p.open&&a.chew===0){c.save();c.strokeStyle=a.attention>0?'#d8ad4a':'#fef4c6';c.lineWidth=1.1;c.setLineDash([3,4]);c.beginPath();c.arc(p.target.x,p.target.y,p.radius+3,0,TAU);c.stroke();c.restore();}
   const signX=s.start+353;line(c,signX,423,signX,407,'#8f805e',3);box(c,signX-22,405,44,16,'#fff0d0',5);c.font='bold 9px sans-serif';c.fillStyle='#68826b';c.textAlign='center';c.textBaseline='middle';c.fillText(s.name,signX,413);
   if(a.fed>=2){ellipse(c,s.start+370,467,16,10,'#e8c87966');line(c,s.start+362,467,s.start+378,467,'#8b8653',2);line(c,s.start+373,462,s.start+378,467,'#8b8653',2);line(c,s.start+373,472,s.start+378,467,'#8b8653',2);}
  }
  if(g.lastTrail){c.save();c.globalAlpha=(1-g.lastTrail.age/2)*.32;for(let i=0;i<g.lastTrail.points.length;i+=3){const p=g.lastTrail.points[i];ellipse(c,p.x,p.y,1.2,1.2,'#a07e55');}c.restore();}
  if(g.active.fed<2&&!g.ended&&g.inFeedSpot){const pts=g.preview;for(let i=0;i<pts.length;i++){const p=pts[i];ellipse(c,p.x,p.y,i%3===0?1.8:1.2,i%3===0?1.8:1.2,g.charging?'#fff8d7e8':'#f9f3d3a8');}const end=pts.at(-1);if(end&&g.charging){c.strokeStyle='#a58a50aa';c.lineWidth=1;c.beginPath();c.ellipse(end.x,end.y,7,3,0,0,TAU);c.stroke();}}
  const p=g.player;ellipse(c,p.x,p.y+1,12,3.5,'#877b5a35');this.hero(c,character,p,SIDE_HERO_SIZE,g.charging,g.active.fed<2?g.active.spec.food:null);
  for(const b of g.shots){for(let j=Math.max(0,b.trail.length-5);j<b.trail.length;j++){const q=b.trail[j];ellipse(c,q.x,q.y,1.6,1.6,'#f9ecbc55');}this.food(c,b.food,b.x,b.y,11*SIDE_HERO_SIZE/72,b.sliding?0:Math.sin(b.age*5)*.35);}
  if(g.charging){const xx=p.x-32,yy=p.y-88;box(c,xx-2,yy-12,80,26,'#fff3d9ed',6);c.fillStyle='#5b7f70';c.font='bold 9px sans-serif';c.textAlign='left';c.fillText('힘 '+Math.round(g.charge*100)+'%',xx+3,yy-3);box(c,xx+3,yy+2,68,5,'#d6d6b8',3);box(c,xx+3,yy+2,Math.max(2,68*g.charge),5,'#6f9a7a',3);}
  for(const e of g.effects){const k=e.age/(e.duration||1.3);c.save();c.globalAlpha=1-k;if(e.kind==='heart'){this.heart(c,e.x,e.y-12-k*36,.7,'#df927f');for(let j=0;j<4;j++)ellipse(c,e.x+Math.cos(j*TAU/4)*k*26,e.y-15+Math.sin(j*TAU/4)*k*26,2,2,'#eed086');}else if(e.kind==='card'){this.card(c,e.id,e.x,e.y-k*45,30);}else{for(let j=0;j<6;j++){const a=j*TAU/6;ellipse(c,e.x+Math.cos(a)*k*24,e.y-12*Math.sin(k*Math.PI)+Math.sin(a)*k*5,2*(1-k)+.5,1.4,e.kind==='splash'||e.kind==='ice'?'#e7f5e9':'#d2b079');}}c.restore();}
  c.restore();
  box(c,78,8,234,26,'#fff5dfe8',12);for(let i=0;i<9;i++){const x=94+i*25,owned=g.banked.has(i+1);c.save();c.globalAlpha=owned?1:.27;drawClueCard(c,x,21.5,14,17);c.restore();}
  const a=g.active,s=a.spec,name=s.name+(a.fed>=2?(usesCoinRewards()?' · 금화 획득':' · 단서 획득'):''),w=165;box(c,(390-w)/2,41,w,25,'#fff8e6e8',11);c.fillStyle='#577968';c.font='bold 11px sans-serif';c.textAlign='left';c.fillText(name,(390-w)/2+13,54);if(a.fed<2)for(let i=0;i<2;i++){ellipse(c,242+i*16,54,6,6,i<a.fed?'#779d79':'#d8d9b9');if(i<a.fed){c.fillStyle='#fff6d4';c.font='8px sans-serif';c.textAlign='center';c.fillText('✓',242+i*16,54);}}
  if(a.attention>0){box(c,137,100,116,21,'#f5d886dd',10);c.fillStyle='#6b714e';c.font='bold 10px sans-serif';c.textAlign='center';c.fillText('기다려요 '+a.attention.toFixed(1)+'초',195,111);}
  const pose=animalPose(a);box(c,89,72,212,22,pose.open?'#e5edcedd':'#fff3dcdb',9);c.fillStyle=pose.open?'#527653':'#857052';c.font='bold 10px sans-serif';c.textAlign='center';c.fillText(pose.phase,195,84);
  if(g.elapsed<5){box(c,65,474,260,19,'#fff6dfdb',9);c.fillStyle='#648471';c.font='bold 9px sans-serif';c.textAlign='center';c.fillText('↑↓ 각도 · 던지기를 누르다 놓아요',195,484);}
  c.restore();
 }
}
