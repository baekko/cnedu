import {drawClueCard} from './clue-card-art.js';
import {beginScene,drawRoom} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
export const TAU=Math.PI*2;
export function box(c,x,y,w,h,color,r=5){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
export function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
export function text(c,s,x,y,size=10,color='#526353',align='center'){c.fillStyle=color;c.font=`700 ${size}px sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);}
export async function loadFieldAssets(kind,character,overrides={}){
 const images={},folder=kind+'-v117',files=[...['room0','room1','room2','entrance','clue',kind==='photo'?'subjects':'plants'].map(n=>[folder+'/'+n+'.webp',n]),...['idle','walk'].map(n=>['hero-v153/'+character.id+'-'+n+'.webp',character.id+'-'+n+'.webp'])];
 if(kind==='photo')files.push([folder+'/subjects-alt.webp','subjectsAlt']);
 await Promise.all(files.map(([original,key])=>new Promise((resolve,reject)=>{const file=overrides[key]||original,im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('그림을 불러오지 못했어요: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));
 const response=await fetch(new URL('../assets/'+folder+'/atlas.json',import.meta.url));if(!response.ok)throw Error('그림 위치 정보 오류');images.atlas=await response.json();return images;
}
export class FieldRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 begin(g){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);drawRoom(c,this.images['room'+g.room]);c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();return c;}
 end(c,g,exits=true){
  for(const e of g.effects)if(e.type==='card'){const u=e.age/1.2;c.save();c.globalAlpha=1-u;drawClueCard(c,e.x,e.y+13-u*38,20,26);c.restore();}
  if(exits)for(const [x,arrow]of [[18,'‹'],[372,'›']]){box(c,x-11,447,22,29,'#fff5d9df',6);text(c,arrow,x,460,22,'#697c64');}
  if(g.transitionLeft>0){c.fillStyle='#fff5e7';c.globalAlpha=g.transitionLeft/.25;c.fillRect(0,0,390,500);c.globalAlpha=1;}c.restore();
 }
 sprite(c,key,b,x,foot,h=53){if(!b)return;const w=h*b.sw/b.sh;c.drawImage(this.images[key],b.sx,b.sy,b.sw,b.sh,x-w/2,foot-h,w,h);}
 hero(c,g,character){oval(c,g.player.x,g.player.y+1,11,3.5,'#33473a2c');drawExplorer(c,this.images,character,g.player);}
 entrance(c){const im=this.images.entrance,k=Math.min(235/im.width,205/im.height);c.drawImage(im,(260-im.width*k)/2,(230-im.height*k)/2,im.width*k,im.height*k);}
 briefing(c,character,t=0){drawExplorer(c,this.images,character,{x:61+Math.sin(t)*8,y:108,dir:'right',moving:true,walk:t,hammerAge:99});const im=this.images.entrance,k=Math.min(70/im.width,65/im.height);c.drawImage(im,106,40,im.width*k,im.height*k);}
}
