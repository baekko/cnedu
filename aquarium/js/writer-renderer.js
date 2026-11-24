import {drawClueCard} from './clue-card-art.js?v245';
import {SIDE_HERO_SIZE} from './hero-scale.js';
import {writerCardSprite,writerHeroSprite,WRITER_CARD_ART} from './writer-sprites-v99.js?v=155';
import {loadRecoveryArt,drawRecoveryItems,drawVitalityFx} from './game-items.js';
import {hasSource} from './clue-order.js';
import {GIANT_POSES} from './writer-giant-poses.js';
import {GIANT_ART_V101} from './writer-giant-art-v101.js';
import {GIANT_ATTACK_ART_V102} from './writer-giant-hand-v102.js';
import {GiantSpritePlayback} from './writer-giant-sprites-v101.js';
import {OZ_LANDSCAPE,ozLandscapePlacement,ozLandscapeVisible} from './writer-oz-layout.js';
import {beginScene} from './layout.js';
import {WRITER,STORIES,WRITER_CARDS,WRITER_PLATFORMS,ALICE_GATE,WRITER_WIND,NOSE,GIANT,giantHands,CASTLE,PIRATES,VINE,WRITER_CAT,PUPPETS,puppetAt,OZ_FRIENDS} from './writer-core.js?v=155';
const TAU=Math.PI*2,rows={haru:0,doyun:1,narin:2,soi:3};
const round=(c,x,y,w,h,r,fill)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const doors=[[118.09,236.42,83.42,116.24],[93.01,225.63,85.65,126.87],[97.14,231,80.61,121.53]];
export function writerBriefingPose(t){
 const phase=t%3.2,back=t%6.4>=3.2,jump=phase>=.7&&phase<1.65,u=(phase-.7)/.95;
 const x=phase<.7?40+25*phase/.7:jump?65+50*u:phase<2.25?115+25*(phase-1.65)/.6:140;
 return {phase,back,x:back?180-x:x,y:95-(jump?32*Math.sin(u*Math.PI):0),size:1,dir:back?'left':'right',walk:t,moving:phase<2.25,onGround:!jump,vy:jump?-Math.cos(u*Math.PI):0,flying:false};
}
export async function loadWriterAssets(character){
 await loadRecoveryArt();
 const result={},files=['room','houses','ship','actors','wonder','fox','heroes','gate','cast-v35','scenery-v35','shelters-v35','giant-v39','vine-v38','vine-crown-v39','cat-v39','oz-friends-v36','marionette-v36','author-v37'].map(n=>['writer/'+n+'.webp',n]);
 files.push([WRITER_CARD_ART.file,'card-soldier'],['writer-v130/pigs.webp','pigs-v38']);
 files.push(['writer/'+OZ_LANDSCAPE.asset+'.webp',OZ_LANDSCAPE.asset]);
 files.push([GIANT_ART_V101.bodyFile,'giant-climb-body'],[GIANT_ART_V101.handsFile,'giant-climb-hands']);
 files.push([GIANT_ATTACK_ART_V102.file,'giant-attack-corrected'],[GIANT_ATTACK_ART_V102.highHandFile,'giant-attack-high-hand']);
 files.push(['museum/'+character.id+'-actions.webp','climb']);
 for(const kind of ['walk','idle'])files.push(['hero-v153/'+character.id+'-'+kind+'.webp',kind]);
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{result[key]=im;resolve();};im.onerror=()=>reject(Error('이야기 그림을 불러오지 못했어요: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));return result;
}
export class WriterRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];
  this.giantPlayback=new GiantSpritePlayback();
  const layer=(width,height)=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;return canvas;};
  const poseLayer=(i,polys)=>{const canvas=layer(512,512),ctx=canvas.getContext('2d');ctx.save();ctx.beginPath();for(const points of polys){points.forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}ctx.clip();const corrected=i===2;ctx.drawImage(images[corrected?'giant-attack-corrected':'giant-v39'],corrected?0:i%2*512,corrected?0:Math.floor(i/2)*512,512,512,0,0,512,512);ctx.restore();return canvas;};
  this.giantLayers=GIANT_POSES.map((p,i)=>{
   const hands=poseLayer(i,(i===2?[p.hands[1]]:p.hands).map(h=>h.polygon));
   // The first attack's far hand had the same handedness as the near hand.
   // Its corrected opposite-hand drawing has a clean alpha matte, including
   // the higher thumb; draw once, at the unchanged original palm/arm anchor.
   if(i===2)hands.getContext('2d').drawImage(images['giant-attack-high-hand'],0,0);
   return {body:poseLayer(i,p.body),hands};
  });
  // Project the actual clenched grip for each attacking hand. A feathered
  // wrist removes crop edges while preserving the thumb and folded knuckles.
  this.palmShadows=[2,3].map(i=>GIANT_POSES[i].hands.map(hand=>{
   const [px,py]=hand.palm,canvas=layer(80,80),ctx=canvas.getContext('2d');
   ctx.drawImage(this.giantLayers[i].hands,px-32,py-32,64,64,8,8,64,64);
   ctx.globalCompositeOperation='source-in';ctx.fillStyle='#263221';ctx.fillRect(0,0,80,80);
   ctx.globalCompositeOperation='destination-in';const fade=ctx.createRadialGradient(40,40,22,40,40,34);fade.addColorStop(0,'#000');fade.addColorStop(1,'#0000');ctx.fillStyle=fade;ctx.fillRect(0,0,80,80);return canvas;
  }));
  // Overlap the natural crown with a faded upper stem. No rectangular cut
  // is exposed as the camera reaches the top of the climb.
  this.stemTop=VINE.top+60;this.stem=layer(196,VINE.bottom-this.stemTop+8);const vine=this.stem.getContext('2d');
  for(let y=VINE.bottom-520;y>this.stemTop-540;y-=462)vine.drawImage(images['vine-v38'],10,y-this.stemTop,176,528);
  vine.globalCompositeOperation='destination-in';const fade=vine.createLinearGradient(0,0,0,64);fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000');vine.fillStyle=fade;vine.fillRect(0,0,196,this.stem.height);
  this.crown=layer(256,524);const crown=this.crown.getContext('2d');crown.drawImage(images['vine-crown-v39'],0,0);crown.globalCompositeOperation='destination-in';const tail=crown.createLinearGradient(0,444,0,524);tail.addColorStop(0,'#000');tail.addColorStop(1,'#0000');crown.fillStyle=tail;crown.fillRect(0,0,256,524);
 }
 effect(){}
 cell(c,file,col,row,x,y,size,cell=256,anchor=244/256){c.drawImage(this.images[file],col*cell,row*cell,cell,cell,x-size/2,y-size*anchor,size,size);}
 scenery(c,col,row,x,y,size,anchor=364/384){this.cell(c,'scenery-v35',col,row,x,y,size,384,anchor);}
 book(c,x,y,w,h,color='#537a78'){
  round(c,x-3,y-3,w+6,h+6,3,color);round(c,x,y,w,h,2,'#f1dfb5');c.fillStyle='#cfb78a';for(let yy=y+3;yy<y+h;yy+=4)c.fillRect(x+3,yy,w-6,.6);round(c,x-3,y-4,w+6,4,1,color);c.fillStyle='#e8c27a';c.fillRect(x+4,y-4,Math.min(24,w-8),1);
 }
 background(c,g){
  const roomScroll=g.camera.x*WRITER.roomParallax,offset=roomScroll%390;for(let i=-1;i<2;i++)c.drawImage(this.images.room,i*390-offset,0,390,500);
  // A single still author is anchored to the same room coordinates as the wall.
  // No frame swapping or modulo repetition: she cannot drift against the room
  // or reappear in Oz when the background tiles repeat.
  const author=this.images['author-v37'],ax=95-roomScroll;
  if(ax+275>0&&ax<390){
   c.fillStyle='#53371f40';c.beginPath();c.ellipse(ax+145,398,117,7,0,0,TAU);c.fill();
   c.drawImage(author,ax,64,275,344);
  }
  this.cat(c,g,roomScroll);
  if(g.camera.y<0){c.save();c.globalAlpha=Math.min(1,-g.camera.y/440);const sky=c.createLinearGradient(0,0,0,500);sky.addColorStop(0,'#8abec8');sky.addColorStop(.65,'#d5e3d3');sky.addColorStop(1,'#f3e8c7');c.fillStyle=sky;c.fillRect(0,0,390,500);for(let i=0;i<5;i++)this.scenery(c,1,1,((i*167-g.camera.x*.05)%510+510)%510-60,90+i*105-g.camera.y*.12,230,276/384);c.restore();}
  const shade=c.createLinearGradient(0,250,0,470);shade.addColorStop(0,'#fff2c000');shade.addColorStop(1,'#fff0cc44');c.fillStyle=shade;c.fillRect(0,0,390,500);
 }
 desk(c,g){
  // The warm wooden room floor stays behind a separate teal writing table.
  const x=Math.max(0,g.camera.x-4),w=Math.min(WRITER.width-x,398);
  const top=c.createLinearGradient(0,417,0,472);top.addColorStop(0,'#486964');top.addColorStop(.45,'#66847b');top.addColorStop(1,'#48655e');c.fillStyle=top;c.fillRect(x,417,w,56);
  c.fillStyle='#274842';c.fillRect(x,415,w,3);c.fillStyle='#acb995';c.fillRect(x,418,w,1);
  c.strokeStyle='#34564c22';c.lineWidth=.6;for(let y=426;y<469;y+=9){c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.stroke();}
  const edge=c.createLinearGradient(0,472,0,500);edge.addColorStop(0,'#294d47');edge.addColorStop(1,'#193c39');c.fillStyle=edge;c.fillRect(x,472,w,28);c.fillStyle='#9eac84';c.fillRect(x,471,w,1.5);c.fillStyle='#193d3680';c.fillRect(x,476,w,3);
 }
 pages(c,g){
  for(const [i,s] of STORIES.entries()){
   if(s.end<g.camera.x-30||s.start>g.camera.x+430)continue;
   const x=s.start-4,w=s.end-s.start+8;
   round(c,x,442,w,24,6,['#6b8071','#816b92','#486f82','#987357','#70815a','#7b915e'][i]);c.fillStyle='#dcc598';c.fillRect(x+4,439,w-8,20);
   for(let y=443;y<462;y+=4){c.strokeStyle='#a68b5a55';c.lineWidth=.6;c.beginPath();c.moveTo(x+4,y);c.quadraticCurveTo(x+w/2,y-9,x+w-4,y);c.stroke();}
   c.fillStyle='#f5e8c7';c.beginPath();c.moveTo(x+4,439);c.quadraticCurveTo(x+w/4,427,x+w/2,435);c.quadraticCurveTo(x+w*.75,427,x+w-4,439);c.lineTo(x+w-4,443);c.lineTo(x+4,443);c.fill();
  }
  // A continuous narrow printed path links the six pop-up spreads.
  c.strokeStyle='#a98b5e55';c.lineWidth=1;c.beginPath();c.moveTo(0,438);c.lineTo(WRITER.width,438);c.stroke();
 }
 pigs(c,g){
  for(const h of g.houses){
   if(h.x<g.camera.x-350||h.x>g.camera.x+550)continue;
   const phase=g.windPhase(h),a=h.age%WRITER_WIND.period,col=phase==='warning'?(a<.9?1:2):phase==='gust'?3:0;
   c.save();c.translate(h.x+190,440);c.scale(-1,1);this.cell(c,'actors',col,0,0,0,79);c.restore();
   if(phase==='gust'){
    c.save();c.beginPath();c.rect(h.x-220,325,530,120);if(!h.broken)c.rect(h.x-80,286,160,155);c.clip('evenodd');
    for(let j=0;j<16;j++){const u=(g.elapsed*230+j*39)%530,xx=h.x+310-u,yy=340+j%6*17;c.strokeStyle=j%2?'#f5e6bbcc':'#a9c3b9bb';c.lineWidth=j%3===0?2.4:1.2;c.beginPath();c.moveTo(xx+32,yy);c.bezierCurveTo(xx+7,yy-8,xx-8,yy+9,xx-35,yy);c.stroke();}
    c.restore();
   }
   this.cell(c,'shelters-v35',h.type,h.broken?1:0,h.x,440,180,384,356/384);
   if(phase==='warning'){c.fillStyle='#b5654a';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText('!',h.x+190,350-Math.sin(g.elapsed*8)*3);}
   if(!h.broken&&(g.nearHouse()===h||g.hiding?.house===h)){
    c.strokeStyle=g.hiding?.house===h?'#b5d7bc':'#f7dc93';c.lineWidth=1.5;c.beginPath();c.ellipse(h.doorX,441,22,4,0,0,TAU);c.stroke();
   }
   if(!h.broken){
    const residents=g.pigs.filter(p=>p.mode==='safe'&&p.houseId===h.id),d=doors[h.type],s=180/384;
    c.save();c.beginPath();c.roundRect(h.x-90+d[0]*s,440-356*s+d[1]*s,d[2]*s,d[3]*s,[d[2]*s/2,d[2]*s/2,0,0]);c.clip();
    residents.forEach((pig,i)=>this.cell(c,'pigs-v38',5,pig.id,h.doorX+(residents.length>1?(i?10:-10):-7),438,42,256,240/256));c.restore();
    const host=g.pigs.find(p=>p.houseId===h.id&&p.mode==='invite');
    if(host){this.cell(c,'pigs-v38',0,host.id,h.doorX+(residents.length?19:0),440,53,256,240/256);
     round(c,h.doorX-44,342,88,21,7,'#fff6dfee');c.fillStyle='#486354';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('여기로 숨어',h.doorX,356);
     c.save();c.globalAlpha=.22+.78*(.5+.5*Math.cos(g.elapsed*Math.PI*2*1.6));c.fillStyle='#297c86';c.strokeStyle='#fff6dc';c.lineWidth=1.8;c.beginPath();c.moveTo(h.doorX-3,369);c.lineTo(h.doorX+3,369);c.lineTo(h.doorX+3,376);c.lineTo(h.doorX+7,376);c.lineTo(h.doorX,383);c.lineTo(h.doorX-7,376);c.lineTo(h.doorX-3,376);c.closePath();c.fill();c.stroke();c.restore();
    }
   }
  }
  for(const pig of g.pigs)if(pig.mode==='run')this.cell(c,'pigs-v38',1+Math.floor(pig.distance/18)%4,pig.id,pig.x,441,53,256,240/256);
 }
 cat(c,g,roomScroll){
  // Use the exact same room transform as the author and wall. Story changes,
  // platform motion and the climbing camera never move the pet with the book.
  const {y,scale:s}=WRITER_CAT,x=WRITER_CAT.x-roomScroll;
  if(x-272*s>390||x+112*s<0)return;
  const age=Math.max(0,g.catAge),ends=[.2,.48,1.04,1.4,1.64,1.86,2.16],frame=ends.findIndex(t=>age<t),f=frame<0?7:frame;
  c.fillStyle='#503f3130';c.beginPath();c.ellipse(x-43,y-1,59,5,0,0,TAU);c.fill();
  c.drawImage(this.images['cat-v39'],f%4*384,Math.floor(f/4)*256,384,256,x-272*s,y-240*s,384*s,256*s);
 }
 wonder(c,g){
  c.drawImage(this.images.gate,2220-69,440-486*138/512,138,138);
  for(const x of [1930,2380])this.cell(c,'wonder',0,1,x,440,48);
  this.cell(c,'wonder',1,0,3040,445,165,256,.91);
  this.cell(c,'wonder',2,0,3260,443,139,256,.92);
  c.strokeStyle='#ddb45e';c.lineWidth=3;c.beginPath();c.moveTo(2975,338);c.quadraticCurveTo(3040,335,3105,338);c.stroke();
  for(const guard of g.guards){const q=g.guardAt(guard);c.save();c.translate(q.x,q.y);if(q.dir==='left')c.scale(-1,1);const f=writerCardSprite(q);this.cell(c,'card-soldier',f.column,f.row,0,0,62);c.restore();}
  for(let i=0;i<15;i++){const x=1800+i*102,y=355+Math.sin(i*2+g.elapsed)*20;c.fillStyle='#c7a4d680';c.beginPath();c.arc(x,y,1.2+Math.sin(i+g.elapsed)*.6,0,TAU);c.fill();}
 }
 shore(c,g){
  // Curved shorelines, shallow sand and the same waves meet the land gradually.
  c.fillStyle='#d6be8f';c.beginPath();c.moveTo(3220,500);c.bezierCurveTo(3370,490,3410,421,3520,401);c.bezierCurveTo(3850,367,4950,370,5200,400);c.bezierCurveTo(5280,422,5300,478,5440,500);c.closePath();c.fill();
  c.save();c.beginPath();c.moveTo(3310,500);c.bezierCurveTo(3420,477,3485,423,3565,415);c.bezierCurveTo(3910,383,4900,387,5160,416);c.bezierCurveTo(5250,439,5270,482,5360,500);c.closePath();c.clip();
  const sea=c.createLinearGradient(0,392,0,500);sea.addColorStop(0,'#b6cdc0');sea.addColorStop(.35,'#79b3b4');sea.addColorStop(1,'#376e82');c.fillStyle=sea;c.fillRect(3300,370,2080,145);
  for(let i=0;i<8;i++){c.strokeStyle=i%2?'#e3eee077':'#8ec3c6aa';c.lineWidth=1.3;c.beginPath();for(let x=Math.max(3280,Math.floor(g.camera.x/8)*8);x<=Math.min(5390,g.camera.x+410);x+=8){const y=409+i*14+Math.sin(x*.024+g.elapsed*1.7+i)*3.3;if(x===Math.max(3280,Math.floor(g.camera.x/8)*8))c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}
  c.restore();
  // The little garden stream widens into the inlet, never a rectangular seam.
  c.strokeStyle='#9dbfba';c.lineWidth=6;c.beginPath();c.moveTo(3210,442);c.bezierCurveTo(3335,440,3340,469,3435,465);c.stroke();
  for(const x of [3310,3380,3450,5260,5340]){c.fillStyle='#9b9b81';c.beginPath();c.ellipse(x,450+Math.sin(x)*8,8,4,0,0,TAU);c.fill();}
  for(const x of [3515,3650,5160,5310])this.scenery(c,2,1,x,440,175,281/384);
 }
 peter(c,g){
  this.cell(c,'wonder',2,1,3470,439,58);
  const w=990,h=w*768/1152;c.drawImage(this.images.ship,4150,440-h*553/768,w,h);
  for(let x=3840;x<4150;x+=140)this.scenery(c,2,1,x,440,160,281/384);
  for(const f of WRITER_PLATFORMS.filter(f=>f.kind==='rigging')){c.strokeStyle='#d4b984';c.lineWidth=1.2;for(const x of [f.x+6,f.x+f.w-6]){c.beginPath();c.moveTo(x,f.y);c.lineTo(x+4,Math.max(75,f.y-110));c.stroke();}this.book(c,f.x,f.y,f.w,7,'#876345');}
  this.book(c,5120,440,130,9,'#876345');
  for(const [i,pirate] of PIRATES.entries()){const pending=g.hooks.find(h=>h.pirate===i&&h.age<h.warning),age=pending?.age??99;this.cell(c,'actors',age<.4?1:age<.8?2:0,1,pirate.x,pirate.y,74);}
  for(const h of g.hooks){
   if(h.age<h.warning){c.save();c.strokeStyle='#e6bd7faa';c.setLineDash([4,7]);c.lineWidth=1;c.beginPath();c.moveTo(h.x,h.y);c.lineTo(h.tx,h.ty);c.stroke();c.restore();continue;}
   c.save();c.translate(h.x,h.y);c.rotate(Math.atan2(h.vy,h.vx)+Math.PI/2);c.strokeStyle='#684731';c.lineWidth=6;c.beginPath();c.moveTo(0,-11);c.lineTo(0,3);c.bezierCurveTo(0,15,14,14,12,2);c.stroke();c.strokeStyle='#d8c89d';c.lineWidth=3;c.stroke();c.fillStyle='#fff1c2';c.fillRect(-1,-11,2,8);c.restore();
  }
 }
 timber(c,x,y,w,bottom){
  const wood=c.createLinearGradient(0,y,0,y+12);wood.addColorStop(0,'#dbb17a');wood.addColorStop(1,'#8c5a38');round(c,x,y,w,12,3,wood);c.strokeStyle='#795539';c.lineWidth=6;for(const xx of [x+9,x+w-9]){c.beginPath();c.moveTo(xx,y+12);c.lineTo(xx,bottom);c.stroke();}c.strokeStyle='#d8b77f';c.lineWidth=1;c.beginPath();c.moveTo(x+5,y+3);c.lineTo(x+w-5,y+3);c.stroke();
 }
 pinocchio(c,g){
  this.scenery(c,0,0,5580,440,230);
  for(const [x,w] of [[5960,215],[6265,195]]){const shade=c.createLinearGradient(0,438,0,500);shade.addColorStop(0,'#604535');shade.addColorStop(1,'#352c2d');c.fillStyle=shade;c.fillRect(x,440,w,60);c.strokeStyle='#e0c798';c.lineWidth=2;c.beginPath();c.moveTo(x,440);c.lineTo(x,500);c.moveTo(x+w,440);c.lineTo(x+w,500);c.stroke();}
  this.timber(c,6175,NOSE.y,90,510);
  const n=g.nose,size=88,col=n.phase==='warning'?2:n.phase==='extend'?1:n.phase==='rest'?0:3,root=NOSE.x-65;
  this.timber(c,root,NOSE.y+11,65,440);this.cell(c,'cast-v35',col,0,root-(177-128)*size/256,NOSE.y+(244-89)*size/256,size);
  const grad=c.createLinearGradient(0,NOSE.y,0,NOSE.y+11);grad.addColorStop(0,'#efc989');grad.addColorStop(.45,'#c99559');grad.addColorStop(1,'#a97040');round(c,root-3,NOSE.y,n.length+68,11,4,grad);c.strokeStyle='#85593677';c.lineWidth=.8;for(let x=root+16;x<NOSE.x+n.length-8;x+=24){c.beginPath();c.moveTo(x,NOSE.y+3);c.lineTo(x+14,NOSE.y+5);c.stroke();}
  if(n.phase==='warning'){c.strokeStyle='#f6dc9c';c.lineWidth=2;c.beginPath();c.moveTo(NOSE.x,NOSE.y-3);c.lineTo(NOSE.x+n.length,NOSE.y-3);c.stroke();}
  // Shrink only the artwork, around the unchanged moving torso/hit position.
  // Keep its suspension point connected while preserving the swing and timing.
  for(const anchor of PUPPETS){const q=puppetAt(anchor,g.elapsed),im=this.images['marionette-v36'],scale=152/576;c.save();c.translate(q.x,q.y);c.rotate(q.angle);c.strokeStyle='#9d7548';c.lineWidth=.8;c.beginPath();c.moveTo(0,-95);c.lineTo(0,(45-327)*scale);c.stroke();c.drawImage(im,-193*scale,-327*scale,384*scale,576*scale);c.restore();}
 }
 giantLayer(c,g,front=false){
  const h=g.giant,s=GIANT.size/512,pose=g.giantPose||this.giantPlayback.sample(h,g.elapsed),x=VINE.x-256*s,y=h.displayY-256*s;
  if(pose.original)c.drawImage(this.giantLayers[pose.frame][front?'hands':'body'],x,y,GIANT.size,GIANT.size);
  else c.drawImage(this.images[front?'giant-climb-hands':'giant-climb-body'],pose.frame%4*512,Math.floor(pose.frame/4)*512,512,512,x,y,GIANT.size,GIANT.size);
 }
 jack(c,g){
  this.giantLayer(c,g);
  c.drawImage(this.stem,VINE.x-98,this.stemTop);
  c.drawImage(this.crown,VINE.x-132*176/256,VINE.top-170,176,524*176/256);
  for(const f of g.platforms().filter(f=>f.kind==='cloud')){if(f.y<g.camera.y-90||f.y>g.camera.y+610)continue;this.scenery(c,1,1,f.x+f.w/2,f.y,f.w*1.2,276/384);}
  if(g.giant.phase==='warning'){
   const progress=Math.min(1,g.giant.age/GIANT.warning);c.save();c.globalAlpha=.64+.24*progress;c.shadowColor='#28372270';c.shadowBlur=2;giantHands(g.giant).forEach((hit,i)=>c.drawImage(this.palmShadows[g.giant.hand][i],hit.x-hit.w*.5,hit.y-hit.h*.5,hit.w*2,hit.h*2));c.restore();
  }
 }

 ozLandscape(c){
  const im=this.images[OZ_LANDSCAPE.asset],p=ozLandscapePlacement(im);
  c.drawImage(im,p.x,p.y,p.width,p.height);
 }
 oz(c,g){
  for(let x=8030;x<WRITER.width;x+=34){if(x<g.camera.x-40||x>g.camera.x+430)continue;const alpha=Math.min(1,(x-8030)/170);c.save();c.globalAlpha=alpha;round(c,x,439,32,8,2,'#d6b44f');round(c,x+10,449,32,8,2,'#e4c875');c.restore();}
  this.scenery(c,1,0,WRITER.width-130,441,330);
  for(const [i,f] of OZ_FRIENDS.entries()){const met=g.ozFriends.has(i);this.cell(c,'oz-friends-v36',i,met?1:0,f.x,440,83);c.font='bold 11px sans-serif';c.textAlign='center';const width=c.measureText(f.name).width+14;round(c,f.x-width/2,342,width,20,6,'#fff1dbe8');c.fillStyle='#42675d';c.fillText(f.name,f.x,356);}
  for(const m of g.monkeys){const warning=m.age<m.warning;if(warning){const t=m.age/m.warning;c.fillStyle='#6c5a4b55';c.beginPath();c.ellipse(m.x,441,14+12*t,4+4*t,0,0,TAU);c.fill();c.strokeStyle='#cc9d62';c.lineWidth=1.3;c.beginPath();c.ellipse(m.x,441,27,8,0,0,TAU);c.stroke();}this.cell(c,'cast-v35',warning?Math.floor(m.age*7)%3:3,2,m.x,m.y,62,256,.5);}
 }
 hero(c,g,character){
  const p=g.player,size=SIDE_HERO_SIZE*p.size;c.save();
  if(g.castleEntry)c.globalAlpha=Math.max(0,1-Math.max(0,g.castleEntry.age-.35)/.5);
  if(p.hidden&&g.hiding){const h=g.hiding.house,d=doors[h.type],s=180/384;c.beginPath();c.roundRect(h.x-90+d[0]*s,440-356*s+d[1]*s,d[2]*s,d[3]*s,[d[2]*s/2,d[2]*s/2,0,0]);c.clip();c.globalAlpha=.85;}
  c.translate(p.x,p.y);if(p.dir==='left'&&!p.hidden)c.scale(-1,1);
  if(g.invincibleLeft>0&&Math.floor(g.elapsed*13)%2)c.globalAlpha=.6;
  const sprite=writerHeroSprite(g,character,this.images),cell=sprite.cell??256;
  c.drawImage(this.images[sprite.file],sprite.column*cell,sprite.row*cell,cell,cell,-size/2,-size*sprite.anchor,size,size);
  c.restore();
  if(p.flying||g.recoveryGlow>0)for(let i=0;i<7;i++){const a=g.elapsed*3+i,xx=p.x+Math.cos(a)*23,yy=p.y-20+Math.sin(a*1.4)*21;c.fillStyle=i%2?'#ffe8a6':'#fff4d9';c.fillRect(xx,yy,2,2);}
  if(g.stunLeft>0)for(let i=0;i<3;i++){const a=g.elapsed*5+i*TAU/3;c.fillStyle='#e6b762';c.font='13px sans-serif';c.textAlign='center';c.fillText('✦',p.x+Math.cos(a)*18,p.y-57+Math.sin(a)*4);}
 }
 card(c,card,t){c.save();c.translate(card.x,card.y+Math.sin(t*2+card.id)*1.5);drawClueCard(c,0,0,22,28);c.restore();}
 draw(g,character){
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();this.background(c,g);
  c.save();c.translate(-g.camera.x,-g.camera.y);this.desk(c,g);this.pages(c,g);
  if(g.camera.x<1930)this.pigs(c,g);
  if(g.camera.x>1450&&g.camera.x<3400)this.wonder(c,g);
  if(g.camera.x>2850&&g.camera.x<5460)this.shore(c,g);
  if(g.camera.x>3070&&g.camera.x<5330)this.peter(c,g);
  if(g.camera.x>5000&&g.camera.x<6820)this.pinocchio(c,g);
  if(ozLandscapeVisible(g.camera.x))this.ozLandscape(c);
  if(g.camera.x>6400&&g.camera.x<8350)this.jack(c,g);
  if(ozLandscapeVisible(g.camera.x))this.oz(c,g);
  for(const f of WRITER_PLATFORMS.filter(f=>f.kind==='book'||f.kind==='brick'))this.book(c,f.x,f.y,f.w,10,f.kind==='brick'?'#a67452':'#608781');
  for(const card of WRITER_CARDS)if(!hasSource(g,card.id))this.card(c,card,g.elapsed);
  drawRecoveryItems(c,g);this.hero(c,g,character);drawVitalityFx(c,g,g.player.x,g.player.y-25,27);
  if(g.camera.x>6400&&g.camera.x<8350)this.giantLayer(c,g,true);
  for(const e of g.effects){c.save();c.globalAlpha=Math.max(0,1-e.age/1.2);for(let i=0;i<8;i++){const a=i*TAU/8,r=5+e.age*40;c.fillStyle=i%2?'#ffe1a0':'#a8c7b9';c.fillRect(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,3,3);}c.restore();}c.restore();
  round(c,12,13,269,32,8,'#f9efdce8');c.fillStyle='#3e6566';c.font='bold 12px sans-serif';c.textAlign='left';c.fillText(g.story.name,24,33);
  for(const [i,id] of g.story.cards.entries()){c.fillStyle=hasSource(g,id)?'#c9964c':'#cecfba';c.beginPath();c.arc(309+i*20,29,4,0,TAU);c.fill();}
  const next=WRITER_CARDS.filter(card=>!hasSource(g,card.id)).sort((a,b)=>Math.abs(a.x-g.player.x)-Math.abs(b.x-g.player.x))[0];
  if(next&&(next.x<g.camera.x||next.x>g.camera.x+390)){const left=next.x<g.camera.x;c.fillStyle='#f6e6bb';c.font='bold 12px sans-serif';c.textAlign=left?'left':'right';c.fillText(left?'◀ 단서':'단서 ▶',left?12:378,480);}
  else if(next&&next.y<g.camera.y+95){c.fillStyle='#fff1dbe8';round(c,343,16,28,26,6,'#fff1dbe8');c.font='bold 17px sans-serif';c.textAlign='center';c.fillStyle='#43685d';c.fillText('↑',357,35);}
  c.restore();
 }
 briefing(c,character,t){
  const p=writerBriefingPose(t);c.save();
  // A full spread supports the run, jump, pickup and page turn in one loop.
  c.fillStyle='#365d4e25';c.beginPath();c.ellipse(90,108,72,5,0,0,TAU);c.fill();
  c.fillStyle='#5f8580';c.beginPath();c.moveTo(16,91);c.quadraticCurveTo(52,78,90,94);c.quadraticCurveTo(128,78,164,91);c.lineTo(162,107);c.quadraticCurveTo(126,98,90,112);c.quadraticCurveTo(54,98,18,107);c.closePath();c.fill();
  for(const side of [-1,1]){c.save();c.translate(90,0);c.scale(side,1);c.fillStyle='#fff2d2';c.beginPath();c.moveTo(0,96);c.quadraticCurveTo(33,82,70,91);c.lineTo(70,103);c.quadraticCurveTo(33,94,0,108);c.closePath();c.fill();c.strokeStyle='#dbc394';c.lineWidth=.8;c.stroke();for(let j=0;j<3;j++){c.beginPath();c.moveTo(10,96+j*3);c.quadraticCurveTo(34,88+j*3,59,93+j*3);c.stroke();}c.restore();}
  if(p.phase>2.25){const f=(p.phase-2.25)/.95,w=66*Math.cos(f*Math.PI),lift=18*Math.sin(f*Math.PI);c.fillStyle='#fff8e3';c.strokeStyle='#d4b982';c.beginPath();c.moveTo(90,96);c.quadraticCurveTo(90+w*.5,86-lift,90+w,91-lift);c.lineTo(90+w,102-lift);c.quadraticCurveTo(90+w*.5,94-lift,90,108);c.closePath();c.fill();c.stroke();}
  const picked=p.phase>=1.175;
  if(!picked){c.save();c.translate(90,51+Math.sin(t*4)*2);c.scale(.68,.68);this.card(c,{id:1,x:0,y:0},t);c.restore();}
  for(let k=0;k<4;k++){const a=t*1.2+k*1.6,x=90+Math.cos(a)*(18+k*7),y=43+Math.sin(a*1.3)*18;c.globalAlpha=.35+.45*Math.abs(Math.sin(a));c.fillStyle='#d2aa51';c.beginPath();c.moveTo(x,y-3);c.lineTo(x+1,y-1);c.lineTo(x+3,y);c.lineTo(x+1,y+1);c.lineTo(x,y+3);c.lineTo(x-1,y+1);c.lineTo(x-3,y);c.lineTo(x-1,y-1);c.closePath();c.fill();}c.globalAlpha=1;
  this.hero(c,{player:p,stunLeft:0,elapsed:t,invincibleLeft:0,recoveryGlow:picked&&p.phase<1.6?1:0},character);
  c.restore();
 }
}
