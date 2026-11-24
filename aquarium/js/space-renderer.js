import {drawClueCard} from './clue-card-art.js';
import {loadRecoveryArt,drawRecoveryItems,drawVitalityFx} from './game-items.js';
import {hasSource} from './clue-order.js';
import {beginScene} from './layout.js';
import {SPACE,SPACE_DRONES,cardPosition,dronePosition} from './space-core.js';
import {SPACE_STATION,SPACE_EXIT} from './space-geometry.js';
import {SPACE_HERO_SIZE,spaceHeroFrame,spaceHeroAngle,spaceDebrisInfo,spaceDebrisAngle,spaceDroneAngle} from './space-sprites.js';
const TAU=Math.PI*2;
const round=(c,x,y,w,h,fill,r=7)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const oxygenMark=(c,x,y)=>{round(c,x-5,y-6,10,12,'#071d30',3);round(c,x-3.5,y-4.5,7,9,'#52c7b2',2);c.fillStyle='#d8fff2';c.fillRect(x-1.5,y-6.5,3,2);c.fillStyle='#fff';c.fillRect(x-.8,y-2.5,1.6,5);c.fillRect(x-2.5,y-.8,5,1.6);};
export async function loadSpaceAssets(character){
 await loadRecoveryArt();
 const images={},files=['cosmos','station-v33','drone-a','drone-b','debris-a','debris-b','debris-c','beacon','rabbit',character.id+'-eva'];
 await Promise.all(files.map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[name]=im;resolve();};im.onerror=()=>reject(Error('우주정거장 그림: '+name));im.src=new URL('../assets/space/'+name+'.webp',import.meta.url).href;})));return images;
}
export class SpaceRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 sprite(c,name,x,y,w,angle=0,alpha=1){const im=this.images[name];if(!im)return;const h=w*im.height/im.width;c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=alpha;c.drawImage(im,-w/2,-h/2,w,h);c.restore();}
 backdrop(c,g,t){c.fillStyle='#091d31';c.fillRect(0,0,390,500);const im=this.images.cosmos;c.drawImage(im,-90-g.camera.x*.13,-100-g.camera.y*.11,900,900);
  for(let i=0;i<65;i++){const x=((i*173.79+41-g.camera.x*.27)%470+470)%470-40,y=((i*83.31+19-g.camera.y*.27)%580+580)%580-40;c.globalAlpha=.3+.35*(.5+.5*Math.sin(i*2.71+t*.6));c.fillStyle=i%4?'#d6eaf4':'#efce8d';c.beginPath();c.arc(x,y,i%7===0?1.3:.65,0,TAU);c.fill();}c.globalAlpha=1;
 }
 station(c,g,t){this.sprite(c,'station-v33',SPACE_STATION.x,SPACE_STATION.y,SPACE_STATION.width);c.save();c.scale(1.25,1.25);for(const [i,x,y] of [[0,360,1115],[1,650,525],[2,1010,760]]){this.sprite(c,'beacon',x,y,25);c.fillStyle=`rgba(120,228,234,${.3+.25*Math.sin(t*2+i)})`;c.beginPath();c.arc(x,y-5,4,0,TAU);c.fill();}c.restore();}

 card(c,card,g){const p=cardPosition(card,g.elapsed);c.save();c.translate(p.x,p.y+Math.sin(g.elapsed*2+card.id)*2);c.rotate(card.kind==='drift'?Math.sin(g.elapsed*.6+card.id)*.12:0);drawClueCard(c,0,0,24,32);c.restore();}
 drone(c,d,g){const q=dronePosition(d,g.elapsed);c.save();c.translate(d.x,d.y);c.strokeStyle='#b7dddc28';c.lineWidth=1;c.setLineDash([2,8]);c.beginPath();for(let i=0;i<=64;i++){const a=i/64*TAU,x=Math.cos(a)*d.rx,y=Math.sin(2*a)*d.ry;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();c.restore();
  const vx=Math.cos(q.angle),vy=Math.sin(q.angle);c.save();c.strokeStyle='#a3e5ef8c';c.lineWidth=2;c.beginPath();c.moveTo(q.x-vx*18,q.y-vy*18);c.lineTo(q.x-vx*(25+Math.sin(g.elapsed*21+d.id)*3),q.y-vy*25);c.stroke();c.restore();this.sprite(c,d.id%2?'drone-b':'drone-a',q.x,q.y,47,spaceDroneAngle(d,g.elapsed));
 }
 debris(c,d,g){const warning=d.age<d.warning;if(warning){c.save();c.strokeStyle=`rgba(255,189,104,${.3+.22*Math.sin(g.elapsed*13)})`;c.lineWidth=13;c.setLineDash([4,14]);c.beginPath();c.moveTo(d.startX,d.startY);c.lineTo(d.startX+d.vx*3.1,d.startY+d.vy*3.1);c.stroke();c.restore();return;}
  const speed=Math.hypot(d.vx,d.vy),nx=d.vx/speed,ny=d.vy/speed;c.save();c.strokeStyle='#d8e3e55e';c.lineWidth=1.2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(d.x-nx*(19+i*5)-ny*i*5,d.y-ny*(19+i*5)+nx*i*5);c.lineTo(d.x-nx*(36+i*5)-ny*i*5,d.y-ny*(36+i*5)+nx*i*5);c.stroke();}c.restore();const piece=spaceDebrisInfo(d.kind);this.sprite(c,piece.asset,d.x,d.y,piece.width,spaceDebrisAngle(d,g.elapsed));
 }
 hero(c,g,character,t,size=SPACE_HERO_SIZE){const p=g.player,{row,col,flip}=spaceHeroFrame(p),im=this.images[character.id+'-eva'];
  c.save();c.translate(p.x,p.y);c.rotate(spaceHeroAngle(t,g.stunLeft));
  if(p.thrust&&g.stunLeft<=0){const speed=Math.hypot(p.vx,p.vy)||1,nx=p.vx/speed,ny=p.vy/speed;c.save();c.translate(-nx*16,-ny*16+2);c.rotate(Math.atan2(-ny,-nx));const length=(g.boostLeft>0?25:13)+Math.sin(t*36)*3;c.fillStyle='#73d7f0a8';c.beginPath();c.moveTo(0,-4);c.quadraticCurveTo(length*.7,-6,length,0);c.quadraticCurveTo(length*.7,6,0,4);c.fill();c.fillStyle='#edfaff';c.beginPath();c.moveTo(0,-2);c.lineTo(length*.55,0);c.lineTo(0,2);c.fill();c.restore();}
  if(g.invincibleLeft>0&&g.stunLeft===0)c.globalAlpha=.6+.4*Math.sin(t*22)**2;
  c.save();if(flip)c.scale(-1,1);if(im)c.drawImage(im,col*256,row*256,256,256,-size/2,-size*.54,size,size);c.restore();c.globalAlpha=1;c.restore();
  if(g.recoveryGlow>0){c.save();c.translate(p.x,p.y);c.globalAlpha=g.recoveryGlow/.7;c.strokeStyle='#bdfaf0';c.lineWidth=1.8;for(let i=0;i<4;i++){const a=i*TAU/4,r=27+(1-g.recoveryGlow/.7)*13;c.beginPath();c.arc(0,0,r,a+.15,a+.85);c.stroke();c.fillStyle='#e8ffed';c.beginPath();c.arc(Math.cos(a+.85)*r,Math.sin(a+.85)*r,2,0,TAU);c.fill();}c.restore();}
  if(g.stunLeft>0){c.fillStyle='#ffe8a0';for(let i=0;i<3;i++){const a=t*5+i*TAU/3;c.beginPath();c.arc(p.x+Math.cos(a)*23,p.y-30+Math.sin(a)*5,2,0,TAU);c.fill();}}
 }
 miniMap(c,g){const x=12,y=335,w=96,h=129,pad=7,innerW=w-pad*2,innerH=88;round(c,x,y,w,h,'#102b3bed',7);c.strokeStyle='#82b6bc66';c.lineWidth=.7;c.stroke();c.fillStyle='#c5dfe0';c.font='9px sans-serif';c.textAlign='left';c.fillText('단서 · 산소 위치',x+pad,y+13);
  const X=v=>x+pad+v/SPACE.width*innerW,Y=v=>y+18+v/SPACE.height*innerH;c.strokeStyle='#78a2ac66';c.lineWidth=3;c.beginPath();c.moveTo(X(325),Y(937.5));c.lineTo(X(1387.5),Y(937.5));c.moveTo(X(825),Y(475));c.lineTo(X(825),Y(1625));c.stroke();
  c.strokeStyle='#c4ebeb99';c.lineWidth=.7;c.strokeRect(X(g.camera.x),Y(g.camera.y),390/SPACE.width*innerW,500/SPACE.height*innerH);
  for(const card of g.cards){if(hasSource(g,card.id))continue;const q=cardPosition(card,g.elapsed),cx=X(q.x),cy=Y(q.y);drawClueCard(c,cx,cy,7,9);}
  for(const item of g.recoveryItems||[])if(item.kind==='oxygen'&&!item.collected)oxygenMark(c,X(item.x),Y(item.y));
  c.fillStyle='#fff';c.strokeStyle='#66e7ed';c.lineWidth=1.3;c.beginPath();c.arc(X(g.player.x),Y(g.player.y),2.8,0,TAU);c.fill();c.stroke();
  oxygenMark(c,x+12,y+118);c.fillStyle='#c9eee6';c.font='8px sans-serif';c.textAlign='left';c.fillText('산소 캡슐',x+22,y+121);
 }
 directionHint(c,g){const candidates=g.cards.filter(a=>!hasSource(g,a.id)).map(card=>({card,p:cardPosition(card,g.elapsed)})).sort((a,b)=>Math.hypot(a.p.x-g.player.x,a.p.y-g.player.y)-Math.hypot(b.p.x-g.player.x,b.p.y-g.player.y));const n=candidates[0];if(!n)return;const sx=n.p.x-g.camera.x,sy=n.p.y-g.camera.y;if(sx>20&&sx<370&&sy>24&&sy<476)return;const cx=g.player.x-g.camera.x,cy=g.player.y-g.camera.y,dx=sx-cx,dy=sy-cy,f=Math.min(dx>0?(367-cx)/dx:dx<0?(23-cx)/dx:Infinity,dy>0?(474-cy)/dy:dy<0?(26-cy)/dy:Infinity),x=cx+dx*f,y=cy+dy*f;
  c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));c.fillStyle='#ffe3a0';c.strokeStyle='#846e40';c.lineWidth=1;c.beginPath();c.moveTo(6,0);c.lineTo(-4,-5);c.lineTo(-1,0);c.lineTo(-4,5);c.closePath();c.fill();c.stroke();c.restore();
 }
 draw(g,character,t=0){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;t=g.elapsed;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();this.backdrop(c,g,t);c.save();c.translate(-g.camera.x,-g.camera.y);this.station(c,g,t);for(const card of g.cards)if(!hasSource(g,card.id))this.card(c,card,g);for(const d of SPACE_DRONES)this.drone(c,d,g);for(const d of g.debris)this.debris(c,d,g);c.save();if(g.phase==='depart'){c.beginPath();c.ellipse(SPACE_EXIT.x,SPACE_EXIT.y,SPACE_EXIT.rx,SPACE_EXIT.ry,0,0,TAU);c.rect(0,SPACE_EXIT.y+SPACE_EXIT.ry*.35,SPACE.width,SPACE.height);c.clip();}drawRecoveryItems(c,g);this.hero(c,g,character,t);drawVitalityFx(c,g,g.player.x,g.player.y,27);c.restore();
  for(const e of g.effects){c.save();c.globalAlpha=Math.max(0,1-e.age/1.2);c.strokeStyle=e.type==='hit'?'#ffc999':'#a8f1ef';c.lineWidth=1.5;c.beginPath();c.arc(e.x,e.y,12+e.age*25,0,TAU);c.stroke();if(e.type==='card'){c.fillStyle='#fff1b9';c.font='bold 12px sans-serif';c.textAlign='center';c.fillText('+1',e.x,e.y-24-e.age*22);}c.restore();}c.restore();this.directionHint(c,g);this.miniMap(c,g);c.restore();
 }
 briefing(c,character,t){const phase=t%6,g={player:{x:90+Math.sin(t*.9)*23,y:61+Math.cos(t*.9)*5,dir:Math.cos(t*.9)>0?'right':'left',walk:t,moving:true,thrust:Math.sin(t%4)<.9,vx:Math.cos(t*.9)*45,vy:0},stunLeft:0,boostLeft:phase>=2&&phase<5?1:0,invincibleLeft:0,recoveryGlow:phase>=3.4&&phase<4.1?4.1-phase:0};this.hero(c,g,character,t,91);}
}
