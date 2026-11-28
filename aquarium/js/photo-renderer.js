import {photoBriefing} from './briefing-scenes.js?v=155';
import {loadPlayerActions,drawPlayerAction} from './player-actions.js?v=155';
import {drawClueCard} from './clue-card-art.js?v245';
import {FieldRenderer,loadFieldAssets,box,oval,text,TAU} from './field-renderer.js?v245';
import {reflectionX,photoLight,PHOTO_ROOMS,PHOTO_AIM,photoLens,photoFrame,wantedAlternate} from './photo-core.js';
import {PhotoViewfinder} from './photo-viewfinder.js?v245';
const SUBJECT_ART='photo-v305/';
export async function loadPhotoAssets(character){
 const images=await loadFieldAssets('photo',character,{entrance:'entrance-v129/photo.webp',room0:'photo-v304/room0.webp',room1:'photo-v304/room1.webp',room2:'photo-v304/room2.webp',subjects:SUBJECT_ART+'subjects.webp',subjectsAlt:SUBJECT_ART+'subjects-alt.webp'});
 const sprites=['cat','dog','rabbit','reflector-left','reflector-right'].map(key=>new Promise((resolve,reject)=>{
  const im=new Image();
  im.onload=()=>{images[key]=im;resolve();};
  im.onerror=()=>reject(Error('촬영 소품을 불러오지 못했어요: '+key));
  im.src=new URL('../assets/'+SUBJECT_ART+key+'.webp',import.meta.url).href;
 }));
 const readAtlas=async (file,message)=>{
  const response=await fetch(new URL('../assets/'+file,import.meta.url));
  if(!response.ok)throw Error(message);
  return response.json();
 };
 await Promise.all([
  ...sprites,
  readAtlas('photo-v121/animals.json','동물 움직임 그림 정보 오류').then(atlas=>{images.animals=atlas.animals;}),
  readAtlas(SUBJECT_ART+'subjects.json','촬영 소품 그림 정보 오류').then(atlas=>{images.atlas=atlas;}),
  loadPlayerActions(images,character),
 ]);
 return images;
}
export class PhotoRenderer extends FieldRenderer{
 briefing(c,character,t){photoBriefing(this,c,character,t);}
 constructor(canvas,images){super(canvas,images);this.viewfinder=new PhotoViewfinder(this);}
 animal(c,s,q){
  const data=this.images.animals[s.animal],b=data.frames[q.frame||0],k=s.height/data.referenceHeight;
  c.save();c.translate(q.x,q.y);c.scale(q.facing||1,1);c.drawImage(this.images[s.animal],b.sx,b.sy,256,256,-128*k,-232*k,256*k,256*k);c.restore();
 }
 subject(c,s,g,labels=true){
  const q=g.pose(s),done=g.clueSources.has(s.id);
  oval(c,q.x,q.groundY+2,Math.max(11,s.height*.52),4,'#62503a23');
  if(s.animal)this.animal(c,s,q);else{const alt=wantedAlternate(s)?q.ready:!q.ready,key=alt?'subjectsAlt':'subjects',b=(alt?this.images.atlas.alternate:this.images.atlas.subjects)[s.artIndex??s.id-1];c.save();c.translate(q.x,q.y);c.rotate(q.rotation);this.sprite(c,key,b,0,0,s.height);c.restore();}
  if(!labels)return;
  if(done){box(c,q.x-10,q.groundY+8,20,15,'#d8e7cf',4);text(c,'✓',q.x,q.groundY+16,9,'#497356');}else drawClueCard(c,q.x,q.groundY+17,14,18);
  if(!done&&!s.animal){const color=q.ready?'#3e9c77':q.warning?'#d7a04b':'#a2ac9e';oval(c,q.x+24,q.y-s.height-7,3.5,3.5,color);}
 }
 reflectors(c,g){
  if(g.room!==2)return;
  const fixtures=[{x:44,y:286,key:'reflector-left',ox:219},{x:346,y:286,key:'reflector-right',ox:292}],k=61/768;
  for(const f of fixtures){oval(c,f.x,f.y+1,13,3,'#71664f22');c.drawImage(this.images[f.key],f.x-256*k,f.y-752*k,512*k,768*k);}
  for(const s of g.subjects){if(g.clueSources.has(s.id))continue;const light=photoLight(s,g.cameraTime);if(!light.active&&!light.warning)continue;const p=g.pose(s),f=fixtures[s.id%3===2?1:0],sx=f.x+(f.ox-256)*k,sy=f.y+(211-752)*k,body=p.y-s.height/2,dx=reflectionX(s,g.cameraTime);
   c.save();const incoming=c.createLinearGradient(sx,sy,p.x,body);incoming.addColorStop(0,'#fff3b143');incoming.addColorStop(1,'#fff6c611');c.fillStyle=incoming;c.beginPath();c.moveTo(sx-3,sy);c.lineTo(sx+3,sy);c.lineTo(p.x+5,body);c.lineTo(p.x-5,body);c.fill();
   if(light.active){const outgoing=c.createLinearGradient(p.x,body,p.x+dx,p.y+110);outgoing.addColorStop(0,'#fff4aef0');outgoing.addColorStop(1,'#e4ae446b');c.fillStyle=outgoing;c.beginPath();c.moveTo(p.x-2,body);c.lineTo(p.x+2,body);c.lineTo(p.x+dx+9,p.y+110);c.lineTo(p.x+dx-9,p.y+110);c.fill();oval(c,p.x,body,6,6,'#fff6b7b0');}
   else{c.strokeStyle='#d5a65b';c.lineWidth=1.2;c.setLineDash([4,3]);c.beginPath();c.moveTo(p.x,body);c.lineTo(p.x+dx,p.y+110);c.stroke();}
   c.restore();
  }
 }
 exits(c,g){
  for(const [x,delta,arrow]of [[18,2,'‹'],[372,1,'›']]){box(c,x-13,439,26,39,'#fff3d8e8',5);text(c,arrow,x,461,24,'#697c64');const name=PHOTO_ROOMS[(g.room+delta)%3].replace(' 촬영실','');box(c,x<195?4:345,424,41,14,'#fff3d8e8',4);text(c,name,x<195?24:365,431,8,'#697c64');}
 }
 draw(g,character){
  if(!g)return;const c=this.begin(g),target=g.target,q=g.quality(target);this.reflectors(c,g);
  if(target&&!g.focusing){const x=target.x+target.view,y=target.y+target.distance;c.save();c.strokeStyle='#b69b674d';c.lineWidth=1;c.setLineDash([3,4]);c.strokeRect(x-14,y-10,28,20);c.restore();}
  const layers=g.subjects.map(s=>({y:g.pose(s).groundY,paint:()=>this.subject(c,s,g)}));
  layers.push({y:g.player.y,paint:()=>{const shot=g.effects.some(e=>e.type==='shutter'&&e.age<.28);if(g.focusing||g.autoShot||shot){oval(c,g.player.x,g.player.y+1,11,3.5,'#33473a2c');drawPlayerAction(c,this.images,character,g.player,'photoBack',shot?1:0,false,1);}else this.hero(c,g,character);}});layers.sort((a,b)=>a.y-b.y).forEach(l=>l.paint());
  if(target&&(g.focusing||q.range)){
   const lens=photoFrame(photoLens(target,g.player)),cx=lens.aimX,cy=lens.aimY,color=q.good?'#419c72':q.framed&&q.clear?'#dbb56b':'#b58962';
   c.strokeStyle=q.blocked?'#b9725c':'#b7a87977';c.lineWidth=1;c.setLineDash([3,3]);c.strokeRect(lens.x,lens.y,lens.w,lens.h);c.setLineDash([]);
   c.strokeStyle=color;c.lineWidth=1.7;
   for(const [a,b]of [[-1,-1],[1,-1],[-1,1],[1,1]]){c.beginPath();c.moveTo(cx+a*PHOTO_AIM.halfWidth,cy+b*PHOTO_AIM.halfHeight-b*6);c.lineTo(cx+a*PHOTO_AIM.halfWidth,cy+b*PHOTO_AIM.halfHeight);c.lineTo(cx+a*(PHOTO_AIM.halfWidth-6),cy+b*PHOTO_AIM.halfHeight);c.stroke();}
   if(g.focusing){c.strokeStyle='#938b6a55';c.lineWidth=2.5;c.beginPath();c.arc(cx,cy,24,0,TAU);c.stroke();c.strokeStyle=q.good?'#62af83':'#e2c179';c.beginPath();c.arc(cx,cy,24,-Math.PI/2,-Math.PI/2+TAU*g.focus);c.stroke();box(c,cx+30,cy-8,31,15,'#fff4dfdf',4);text(c,q.good?'놓기':Math.round(g.focus*100)+'%',cx+45,cy,8,color);}
  }
  this.viewfinder.draw(c,g);this.exits(c,g);
  const shutter=g.effects.find(e=>e.type==='shutter'&&e.age<.16);if(shutter){c.fillStyle='#fff6de';c.globalAlpha=.28*(1-shutter.age/.16);c.fillRect(0,0,390,500);c.globalAlpha=1;}
  this.end(c,g,false);
 }
}
