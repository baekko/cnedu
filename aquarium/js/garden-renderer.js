import {gardenBriefing} from './briefing-scenes.js?v=155';
import {drawGardener} from './garden-helper-renderer.js?v245';
import {drawClueCard} from './clue-card-art.js?v245';
import {FieldRenderer,box,oval,text,TAU} from './field-renderer.js?v245';
import {beginScene,drawRoom,spriteAnchor} from './layout.js';
import {drawHeldWalk} from './heroes.js?v=155';
import {ROOM_HERO_SIZE} from './hero-scale.js';
import {drawGardenCare} from './garden-care-renderer.js?v305';
import {gardenWindowBackground} from './garden-windows.js';
const FILES=['heater-off','heater-on','lever-closed','lever-open','sprout','bud'];
const NEW_FILES=['cover-closed','cover-open'];
const CARE_FILES=['flower-closed','beetle','moth-open','moth-folded','brush'];
const BLOOM_FILES=['bloom-gold','bloom-pink','bloom-blue'];
export async function loadGardenAssets(character){
 const images={},files=[['entrance-v129/garden.webp','entrance'],...FILES.map(key=>['garden-v119/'+key+'.webp',key]),['garden-v305/room0.webp','room0'],...[1,2].map(i=>['garden-v304/room'+i+'.webp','room'+i]),...['left','right'].map(side=>['garden-v305/window-'+side+'-leaf.webp','window-'+side]),['garden-v305/window-backplate.webp','windowBackplate'],['garden-v123/'+character.id+'-spray.webp','sprayHero'],['garden-v305/plants.webp','plants'],...BLOOM_FILES.map(key=>['garden-v305/'+key+'.webp',key]),...NEW_FILES.map(key=>['garden-v120/'+key+'.webp',key]),...CARE_FILES.map(key=>['garden-v122/'+key+'.webp',key]),['garden-v130/gardener.webp','gardener'],['garden-v117/clue.webp','clue'],...['idle','walk'].map(key=>['hero-v153/'+character.id+'-'+key+'.webp',character.id+'-'+key+'.webp'])];
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('온실 그림을 불러오지 못했어요: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));
 const response=await fetch(new URL('../assets/garden-v305/plants.json',import.meta.url));if(!response.ok)throw Error('화분 그림 위치 정보 오류');images.atlas=await response.json();
 const windowResponse=await fetch(new URL('../assets/garden-v305/windows.json',import.meta.url));if(!windowResponse.ok)throw Error('창문 위치 정보 오류');images.windows=await windowResponse.json();
 const sprayResponse=await fetch(new URL('../assets/garden-v123/sprayer-heroes.json',import.meta.url));if(!sprayResponse.ok)throw Error('분무 동작 정보 오류');images.sprayHeroes=await sprayResponse.json();
 const gardenerResponse=await fetch(new URL('../assets/garden-v130/gardener.json',import.meta.url));if(!gardenerResponse.ok)throw Error('정원사 동작 정보 오류');images.gardenerAtlas=await gardenerResponse.json();
 return images;
}
const stroke=(c,points,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const scale=t=>clamp((t-14)/22,0,1);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class GardenRenderer extends FieldRenderer{
 briefing(c,character,t){gardenBriefing(this,c,character,t);}
 begin(g){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);drawRoom(c,g.room===0?gardenWindowBackground(this,g.windowOpen):this.images['room'+g.room]);c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();return c;}
 object(c,key,x,foot,h){const im=this.images[key];if(im)c.drawImage(im,x-h*im.width/im.height/2,foot-h,h*im.width/im.height,h);}
 hero(c,g,character){
  if(g.room!==2)return super.hero(c,g,character);
  const p=g.player,meta=this.images.sprayHeroes,dir=p.dir==='left'?'right':p.dir,pose=g.sprayAge<.28?'trigger':'holding',frame=meta.characters[character.id].frames.find(f=>f.direction===dir&&f.pose===pose),size=ROOM_HERO_SIZE;
  oval(c,p.x,p.y+1,11,3.5,'#33473a2c');
  c.save();spriteAnchor(c,p.x,p.y);if(p.dir==='left')c.scale(-1,1);
  if(p.moving)drawHeldWalk(c,this.images[character.id+'-walk.webp'],this.images.sprayHero,{walkRow:dir==='up'?1:dir==='down'?0:2,walk:p.walk,size,sx:frame.sx,sy:frame.sy,footY:meta.footY});
  else c.drawImage(this.images.sprayHero,frame.sx,frame.sy,256,256,-size/2,-meta.footY*size/256,size,size);
  c.restore();
 }
 plant(c,s,g){
  const x=s.x,good=g.growing(s),[low,high]=g.band(s);
  // Small nursery labels carry each plant's own thermometer and goal.
  box(c,x-45,153,90,69,'#f8f0dbef',5);stroke(c,[[x,221],[x,234]],'#b19869',2);
  text(c,s.name+(s.bloom?' ✓':''),x-5,164,10,'#506650');if(!s.bloom)drawClueCard(c,x+33,164,9,12);
  text(c,s.temperature.toFixed(1)+'℃',x,181,13,good?'#3b805e':'#826849');
  if(s.bloom)text(c,'개화 완료',x,199,10,'#47826b');else{
   text(c,'목표 '+low+'–'+high+'℃',x,196,9,'#507d62');
   const l=x-34,w=68,y=207;box(c,l,y,w,3,'#cbd0b9',1);box(c,l+scale(low)*w,y-1,(scale(high)-scale(low))*w,5,'#80af8f',2);
   const mark=l+scale(s.temperature)*w;stroke(c,[[mark,y-3],[mark,y+6]],'#b58a45',1.4);
   text(c,!s.active?'심기 전':good?'자라는 중':g.inBand(s)?'온도를 유지해요':s.temperature<low?'온도가 낮아요':'온도가 높아요',x,217,7.5,good?'#3b805e':'#90704e');
  }
  oval(c,x,290,23,6,'#68764a22');
  if(s.bloom)this.sprite(c,'plants',this.images.atlas.plants[s.id-1],x,289,53);
  else{
   c.save();c.beginPath();c.rect(x-32,275,64,16);c.clip();this.sprite(c,'plants',this.images.atlas.plants[s.id-1],x,289,55);c.restore();
   if(s.active){const u=s.progress/s.seconds[0];this.object(c,u>.5?'bud':'sprout',x,278,u>.5?36+(u-.5)*12:23+u*16);}
   else{oval(c,x,276,13,3,'#776348');for(let i=0;i<4;i++)oval(c,x-7+i*5,275+(i%2),.9,.7,'#bba07a');}
  }
  if(s.active){const im=this.images[s.cover?'cover-closed':'cover-open'];if(s.cover)c.drawImage(im,x-28,226,56,68);else c.drawImage(im,x+14,244,42,54);}
  if(s.active&&!s.bloom){box(c,x-27,298,54,5,'#afba9d',2);box(c,x-27,298,54*s.progress/s.seconds[0],5,good?'#469d78':'#bca170',2);}
  if(g.target?.id===s.id){c.strokeStyle='#d4b363';c.lineWidth=1.5;c.beginPath();c.ellipse(x,310,23,7,0,0,TAU);c.stroke();}
  if(s.bloom&&s.bloomAge<1.5){c.save();c.globalAlpha=1-s.bloomAge/1.5;for(let i=0;i<6;i++){const a=i*TAU/6,r=19+s.bloomAge*17;stroke(c,[[x+Math.cos(a)*r,256+Math.sin(a)*r],[x+Math.cos(a)*(r+4),256+Math.sin(a)*(r+4)]],'#e6c36e',1.5);}c.restore();}
 }

 devices(c,g){
  const r=g.climate,heater=g.target?.part==='heater',vent=g.target?.part==='vent';
  oval(c,80,353,21,6,'#78684b22');this.object(c,r.heater?'heater-on':'heater-off',80,353,59);
  if(r.heater||r.heat>.1){c.save();c.globalAlpha=r.heat*.4;for(let i=0;i<3;i++){const y=296-((g.elapsed*15+i*7)%21);stroke(c,[[73+i*7,y+5],[71+i*7,y],[73+i*7,y-5]],'#d9a567',1);}c.restore();}
  this.object(c,r.vent?'lever-open':'lever-closed',310,353,37);

  for(const [x,label,value,on,near]of [[80,'히터',r.heater?'켜짐':r.heat>.15?'잔열 남음':'꺼짐',r.heater,heater],[310,'양쪽 창',r.vent?'열림':'닫힘',r.vent,vent]]){
   box(c,x-35,378,70,31,near?'#fff5cf':'#f5efdeeb',5);text(c,label,x,387,10,'#636b52');text(c,value,x,400,9,on?'#ac7546':'#71806b');
   if(near){c.strokeStyle='#c9ab61';c.lineWidth=1.5;c.beginPath();c.ellipse(x,365,23,7,0,0,TAU);c.stroke();}
  }
 }
 draw(g,character){
  if(!g)return;const c=this.begin(g);if(g.room!==0){drawGardenCare(this,c,g,character);this.end(c,g);return;}this.devices(c,g);
  const layers=g.plants.map(s=>({y:275,paint:()=>this.plant(c,s,g)}));layers.push({y:g.player.y,paint:()=>this.hero(c,g,character)});if(g.gardener?.room===g.room)layers.push({y:g.gardener.y,paint:()=>drawGardener(this,c,g)});layers.sort((a,b)=>a.y-b.y).forEach(l=>l.paint());
  this.end(c,g);
 }
}
