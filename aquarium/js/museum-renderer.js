import {walkFrame} from './walk-cycle.js';
import {drawSideWalk} from './side-walk.js?v=155';
import {drawHeldWalk} from './heroes.js?v=155';
import {drawClueCard} from './clue-card-art.js?v245';
import {SIDE_HERO_SIZE} from './hero-scale.js';
import {beginScene,spriteAnchor,sceneText} from './layout.js';
import {MUSEUM,COLORS,pigment} from './museum-core.js';
export async function loadMuseumAssets(character){
 const files=['land.webp','creatures.webp','paintings.webp','wall-v20.webp','monsters.webp',`${character.id}-shoot.webp`,`${character.id}-actions.webp`,`${character.id}-walk.webp`,`${character.id}-idle.webp`];const out={};
 const folders={
  'land.webp':'museum-v130','creatures.webp':'museum-v130','monsters.webp':'museum-v19',
  'paintings.webp':'museum-v311','wall-v20.webp':'museum-v311',
 };
 await Promise.all(files.map(file=>new Promise((resolve,reject)=>{
  const im=new Image();
  im.onload=()=>{out[file]=im;resolve();};
  im.onerror=()=>reject(new Error(`미술관 그림을 불러오지 못했어요: ${file}`));
  const folder=folders[file]??(file.endsWith('-walk.webp')||file.endsWith('-idle.webp')?'hero-v153':'museum');
  im.src=new URL(`../assets/${folder}/${file}`,import.meta.url).href;
 })));
 return out;
}
const round=(c,x,y,w,h,r,fill)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();};
// Fit the entire gilt frame between the upper platform fascia and this floor.
export function paintingLayout(f,j){
 const ground=MUSEUM.floors[f],w=[68,83,57][(j+f)%3],h=[67,51,72][(j+f)%3];
 const bayTop=f<3?MUSEUM.floors[f+1]+22:178,bayBottom=ground-8;
 return {idx:(3-f)*3+j,w,h,x:[81,195,307][j]-w/2,y:bayTop+(bayBottom-bayTop-h-16)/2+8,bayTop,bayBottom};
}

export class MuseumRenderer {
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];this.mask=-1;
  this.art=document.createElement('canvas');this.art.width=this.art.height=768;this.ac=this.art.getContext('2d',{willReadFrequently:true});this.ac.drawImage(images['paintings.webp'],0,0,768,768);this.original=this.ac.getImageData(0,0,768,768);this.types=new Uint8Array(768*768);for(let i=0;i<this.types.length;i++)this.types[i]=pigment(...this.original.data.slice(i*4,i*4+3));this.restore(new Set());
 }
 effect(){}
 restore(cards){const mask=[...cards].reduce((a,id)=>a|(1<<(id-1)),0);if(mask===this.mask)return;this.mask=mask;const im=this.ac.createImageData(768,768),src=this.original.data;
  for(let i=0;i<this.types.length;i++){const j=i*4,owned=mask&(1<<(this.types[i]-1)),gray=Math.round(48+(.2126*src[j]+.7152*src[j+1]+.0722*src[j+2])*.62);im.data[j]=owned?src[j]:gray;im.data[j+1]=owned?src[j+1]:gray;im.data[j+2]=owned?src[j+2]:gray;im.data[j+3]=255;}this.ac.putImageData(im,0,0);
 }
 draw(game,character,time,dt,playing){
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);c.fillStyle='#793742';c.fillRect(0,0,390,844);
  const wall=this.images['wall-v20.webp'];c.drawImage(wall,0,170,390,390*wall.height/wall.width);
  if(game)this.restore(new Set(game.monsters.filter(m=>!m.alive).map(m=>m.id)));
  // Nine differently sized gilt-framed paintings on floors 2, 3 and 4.
  for(let f=1;f<=3;f++){
   const ground=MUSEUM.floors[f];
   for(let j=0;j<3;j++){const {idx,w,h,x,y}=paintingLayout(f,j);c.save();spriteAnchor(c,x+w/2,y+h/2);const fit=Math.min(1,c.canvas.scene?.ratio||1);c.scale(fit,fit);c.translate(-x-w/2,-y-h/2);
    c.fillStyle='#5d2637';c.fillRect(x-8,y-8,w+18,h+18);c.fillStyle='#c39546';c.fillRect(x-7,y-7,w+14,h+14);c.strokeStyle='#ffe0a1';c.lineWidth=2;c.strokeRect(x-5,y-5,w+10,h+10);c.strokeStyle='#8c5b2d';c.strokeRect(x-1,y-1,w+2,h+2);
    c.strokeStyle='#f6dfa7';c.lineWidth=.65;c.strokeRect(x-3,y-3,w+6,h+6);for(let a=x+2;a<x+w;a+=7){c.fillStyle='#8a5b29';c.fillRect(a,y-6,1.2,1.5);c.fillRect(a,y+h+4,1.2,1.5);}
    c.drawImage(this.art,(idx%3)*256,Math.floor(idx/3)*256,256,256,x,y,w,h);
    for(const xx of [x-5,x+w+5])for(const yy of [y-5,y+h+5]){c.fillStyle='#ffdfa0';c.beginPath();c.arc(xx,yy,2.3,0,7);c.fill();c.strokeStyle='#9b702d';c.lineWidth=.6;c.stroke();c.beginPath();c.moveTo(xx-3,yy);c.lineTo(xx+3,yy);c.moveTo(xx,yy-3);c.lineTo(xx,yy+3);c.stroke();}
    round(c,x+w/2-11,y+h+11,22,4,1,'#e2bf86');c.restore();
   }
  }
  // Shaded brass ladders keep the original center lines, span and climbing rules.
  for(let f=0;f<3;f++)for(const x of MUSEUM.ladders){
   const top=MUSEUM.floors[f+1]-4,bottom=MUSEUM.floors[f];
   c.fillStyle='#321b2b55';c.fillRect(x-10,top+3,25,bottom-top);
   for(const rail of [x-10,x+7]){const metal=c.createLinearGradient(rail,0,rail+4,0);metal.addColorStop(0,'#71512e');metal.addColorStop(.35,'#e9c784');metal.addColorStop(.65,'#fff0bf');metal.addColorStop(1,'#957040');c.fillStyle=metal;c.fillRect(rail,top,4,bottom-top);c.fillStyle='#f6dfaa';c.beginPath();c.arc(rail+2,top,2.2,0,Math.PI*2);c.fill();}
   for(let y=top+8;y<bottom;y+=13){const metal=c.createLinearGradient(0,y-2,0,y+3);metal.addColorStop(0,'#fae8bd');metal.addColorStop(.5,'#d4ab67');metal.addColorStop(1,'#86603b');round(c,x-10,y-2,21,5,1.5,metal);c.fillStyle='#936a36';c.beginPath();c.arc(x-8,y+.5,.7,0,Math.PI*2);c.arc(x+9,y+.5,.7,0,Math.PI*2);c.fill();}
  }
  for(let f=0;f<4;f++){const y=MUSEUM.floors[f],wood=c.createLinearGradient(0,y,0,y+17);wood.addColorStop(0,'#f3d9a0');wood.addColorStop(.2,'#b68b50');wood.addColorStop(.32,'#735038');wood.addColorStop(1,'#402b31');c.fillStyle=wood;c.fillRect(0,y,390,17);c.fillStyle='#ffe7b6';c.fillRect(0,y,390,1.3);c.fillStyle='#ba8b4b';c.fillRect(0,y+10,390,1);for(let x=22;x<390;x+=27){c.strokeStyle='#ebca8050';c.lineWidth=.6;c.strokeRect(x,y+5,18,8);c.beginPath();c.moveTo(x+7,y+9);c.lineTo(x+11,y+9);c.stroke();}round(c,4,y+1,19,14,3,'#69404a');c.fillStyle='#f9ddb0';c.font='bold 9px sans-serif';c.textAlign='center';sceneText(c,`${f+1}F`,13.5,y+11);}
  // Ground floor stays clear so the player can learn the controls.
  c.fillStyle='#f2e8d8';c.fillRect(0,682,390,162);c.fillStyle='#dbc5ad';c.fillRect(0,682,390,2);
  if(!game)return;
  for(const m of game.monsters){if(!m.alive)continue;const idx=m.id-1,w=m.id===7?55:43,h=m.id===9?47:42,land=[1,2,9].indexOf(m.id),creature=[3,4,6].indexOf(m.id),atlas=land>=0?'land.webp':creature>=0?'creatures.webp':null,bob=atlas?0:Math.sin(m.age*9)*1.4;c.save();spriteAnchor(c,m.x,m.y+bob);const fit=Math.min(1,c.canvas.scene?.ratio||1);c.scale(fit,fit);if(m.dir<0)c.scale(-1,1);if(atlas){let frame=walkFrame(m.walkTime||0);if(m.id===3){const phase=((m.age*3)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);frame=phase>=Math.PI?0:phase<.55?1:phase<2.3?2:3;}c.drawImage(this.images[atlas],frame*256,(land>=0?land:creature)*256,256,256,-w/2,-h*244/256,w,h);}else c.drawImage(this.images['monsters.webp'],idx%3*192,Math.floor(idx/3)*192,192,192,-w/2,-h,w,h);c.restore();if(game.freezeLeft){c.strokeStyle='#bee8ff';c.lineWidth=1.5;c.beginPath();c.arc(m.x,m.y-20,26,0,7);c.stroke();}}
  for(const b of game.bullets){c.strokeStyle='#fff0b6';c.lineWidth=2;c.beginPath();c.moveTo(b.x-Math.sign(b.vx)*13,b.y);c.lineTo(b.x,b.y);c.stroke();c.fillStyle='#fff9dc';c.beginPath();c.arc(b.x,b.y,4,0,7);c.fill();c.strokeStyle='#bd8a4f';c.stroke();}
  if(game.hitColor)this.paintedHero(character,game.player,game.hitColor,dt);
  else {this.hitAge=0;this.hero(character,game.player,game.monsterTime);}
  for(const e of game.effects){const k=e.age/1.1;c.save();c.globalAlpha=1-k;for(let n=0;n<9;n++){const a=n*Math.PI*2/9,x=e.x+Math.cos(a)*k*46,y=e.y+Math.sin(a)*k*37-k*20;c.fillStyle=COLORS[(e.sourceId??e.id)-1].hex;c.beginPath();c.arc(x,y,3*(1-k)+1,0,7);c.fill();}drawClueCard(c,e.x,e.y-5.5-k*42,22,29);c.restore();}

 }
 paintedHero(character,p,color,dt){
  this.hitAge=(this.hitAge||0)+Math.min(dt,.05);
  this.paintCache ||= new Map();
  const key=character.id+color;
  if(!this.paintCache.has(key)){
   const im=this.images[`${character.id}-actions.webp`],canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;
   const c=canvas.getContext('2d');c.drawImage(im,0,512,768,256,0,0,768,256);const pixels=c.getImageData(0,0,768,256),d=pixels.data;
   const hex=COLORS[color-1].hex,r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
   for(let i=0;i<d.length;i+=4){if(d[i+3]&&d[i+1]>d[i]*1.35&&d[i+1]>d[i+2]*1.35){const shade=d[i+1]/255;d[i]=r*shade;d[i+1]=g*shade;d[i+2]=b*shade;}}
   c.putImageData(pixels,0,0);this.paintCache.set(key,canvas);
  }
  const frame=Math.min(2,Math.floor(this.hitAge/.17)),c=this.c;c.save();spriteAnchor(c,p.x,p.y);const fit=Math.min(1,c.canvas.scene?.ratio||1);c.scale(p.face*fit,fit);c.drawImage(this.paintCache.get(key),frame*256,0,256,256,-SIDE_HERO_SIZE/2,-59.75*SIDE_HERO_SIZE/64,SIDE_HERO_SIZE,SIDE_HERO_SIZE);c.restore();
 }
 hero(character,p,time,ctx=this.c,scale=1){
  if(p.climbing){const frame=((Math.floor((p.climbDistance||0)/8)%6)+6)%6;ctx.save();spriteAnchor(ctx,p.x,p.y);const fit=Math.min(1,ctx.canvas.scene?.ratio||1);ctx.scale(scale*fit,scale*fit);ctx.drawImage(this.images[`${character.id}-actions.webp`],frame%3*256,Math.floor(frame/3)*256,256,256,-SIDE_HERO_SIZE/2,-59.75*SIDE_HERO_SIZE/64,SIDE_HERO_SIZE,SIDE_HERO_SIZE);ctx.restore();return;}

  const shooting=p.shotAge<.36,walking=p.walking&&p.vy===0,walk=p.walkDistance/MUSEUM.speed;
  const frame=shooting?Math.min(5,Math.floor(p.shotAge/.06)):p.vy<0?1:0;
  ctx.save();spriteAnchor(ctx,p.x,p.y);const fit=Math.min(1,ctx.canvas.scene?.ratio||1);ctx.scale((shooting?p.shotFace:p.face)*scale*fit,scale*fit);
  const walkImage=this.images[`${character.id}-walk.webp`],x=-SIDE_HERO_SIZE/2,y=-SIDE_HERO_SIZE*244/256;
  if(!walking&&!shooting&&p.vy===0)ctx.drawImage(this.images[`${character.id}-idle.webp`],3*256,0,256,256,-SIDE_HERO_SIZE/2,-SIDE_HERO_SIZE*244/256,SIDE_HERO_SIZE,SIDE_HERO_SIZE);
  else if(walking&&!shooting)drawSideWalk(ctx,walkImage,walk,3,x,y,SIDE_HERO_SIZE);
  else{
   const shot=this.images[`${character.id}-shoot.webp`],sx=frame%3*256,sy=Math.floor(frame/3)*256;
   if(walking)drawHeldWalk(ctx,walkImage,shot,{walkRow:3,walk,size:SIDE_HERO_SIZE,sx,sy,footY:239});
   else ctx.drawImage(shot,sx,sy,256,256,x,-SIDE_HERO_SIZE*239/256,SIDE_HERO_SIZE,SIDE_HERO_SIZE);
  }
  ctx.restore();
 }
}
