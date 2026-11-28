import {LANGUAGE_THROW,THROW_PALMS,languageThrowFrame,languageThrowPoint} from './language-throw.js';
import {heroWalkFrame} from './walk-cycle.js';
import {drawSideWalk} from './side-walk.js?v=155';
import {drawClueCard} from './clue-card-art.js?v245';
import {drawCarryCell} from './heroes.js?v=155';
import {SIDE_HERO_SIZE} from './hero-scale.js';
import {loadRecoveryArt,drawRecoveryItems,drawVitalityFx} from './game-items.js';
import {hasSource} from './clue-order.js';
import {beginScene} from './layout.js';
import {LANGUAGE,LAB_LADDER,LAB_EXIT,LAB_ROOMS} from './language-core.js';
import {paintLanguageBot} from './lab-damage-guide.js?v306';
const TAU=Math.PI*2,heroRows={haru:0,doyun:1,narin:2,soi:3};
const round=(c,x,y,w,h,fill,r=5)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const panel=(c,x,y,w,h,fill,outline='#56736b',r=5)=>{
 round(c,x,y,w,h,fill,r);c.strokeStyle=outline;c.lineWidth=.9;c.stroke();
};
const line=(c,points,color='#497d7a',width=1.5)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const ellipse=(c,x,y,rx,ry,fill)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
function metal(c,x,y,w,h){
 panel(c,x,y,w,h,'#b4ccbf','#567970');
 c.save();c.clip();c.fillStyle='#dbe5d1';c.fillRect(x,y,w,Math.min(5,h*.36));
 c.fillStyle='#88a99b';c.fillRect(x,y+h-Math.min(5,h*.27),w,Math.min(5,h*.27));
 if(w>8){c.fillStyle='#f0f1dc';c.fillRect(x+4,y+2,w-8,1);}
 c.restore();
}
export async function loadLanguageAssets(character){
 await loadRecoveryArt();
 const images={},files=[...[0,1,2].map(i=>['language-v306/room-'+i+'.webp','room'+i]),['language/zebra.webp','zebra'],['language/throw-v42.webp','throw'],['writer/heroes.webp','poses'],['robot/'+character.id+'-work.webp','carry'],['museum/'+character.id+'-actions.webp','climb'],...['walk','idle'].map(k=>['hero-v153/'+character.id+'-'+k+'.webp',k])];
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('언어연구소 그림: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));return images;
}
export class LanguageRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 block(c,b,selected=false,size=27){
  c.save();c.translate(b.x,b.y);ellipse(c,0,size*.54,size*.48,3,'#234c4d20');
  panel(c,-size/2,-size/2,size,size,selected?'#f4cb79':'#dab475',selected?'#7e603e':'#987346',4);
  round(c,-size/2+3,-size/2+3,size-6,size-6,selected?'#fff5c8':'#fff0d0',2);
  line(c,[[-size/2+4,-size/2+1.5],[size/2-4,-size/2+1.5]],'#fff7d9',1);
  c.fillStyle='#396968';c.font=`800 ${size*.65}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(b.char,0,1);c.restore();
 }
 pictogram(c,kind,x,y,t=0){
  c.save();c.translate(x,y);c.strokeStyle='#476b66';c.lineWidth=2;
  if(kind==='bridge'){for(let i=0;i<3;i++){line(c,[[-29,11+i*5],[-15,8+i*5],[-2,11+i*5],[13,8+i*5],[29,11+i*5]],'#7faeb1',1.2);}line(c,[[-30,4],[-22,-6],[22,-6],[30,4]],'#94734c',5);line(c,[[-28,-9],[-22,-18],[22,-18],[28,-9]],'#c7a96c',2);for(const x of [-22,0,22])line(c,[[x,-18],[x,-4]],'#9c7b49',2);}
  else if(kind==='steps'){
   c.beginPath();c.moveTo(-30,23);c.lineTo(-30,9);c.lineTo(-10,9);c.lineTo(-10,-5);c.lineTo(10,-5);c.lineTo(10,-19);c.lineTo(30,-19);c.lineTo(30,23);c.closePath();
   c.fillStyle='#bfd0bb';c.fill();c.strokeStyle='#648578';c.lineWidth=1.5;c.stroke();
   for(let i=0;i<3;i++)line(c,[[-30+i*20,9-i*14],[-10+i*20,9-i*14]],'#a48550',3);
   line(c,[[-30,23],[30,23]],'#648578',2);
  }
  else if(kind==='ladder'){line(c,[[-15,21],[-15,-24]],'#a27c49',4);line(c,[[15,21],[15,-24]],'#a27c49',4);for(let y=-18;y<22;y+=9)line(c,[[-15,y],[15,y]],'#dbc28c',3);}
  else if(kind==='push'){metal(c,0,-16,31,31);line(c,[[-34,0],[-6,0],[-13,-6],[-6,0],[-13,6]],'#6d9d8b',3);}
  else if(kind==='turn'){
   const end=2.45,r=24;c.strokeStyle='#4e8c78';c.lineWidth=3;c.lineCap='round';c.beginPath();c.arc(0,0,r,-2.45,end);c.stroke();
   c.save();c.translate(Math.cos(end)*r,Math.sin(end)*r);c.rotate(end+Math.PI/2);c.fillStyle='#4e8c78';c.beginPath();c.moveTo(5,0);c.lineTo(-5,-5);c.lineTo(-5,5);c.closePath();c.fill();c.restore();metal(c,-10,-10,20,20);
  }
  else if(kind==='open'){round(c,-21,-24,42,48,'#537f78',3);round(c,-16,-19,32,38,'#214c50',2);c.fillStyle='#e4d4a3';c.beginPath();c.moveTo(-16,-19);c.lineTo(8,-12);c.lineTo(8,19);c.lineTo(-16,19);c.fill();ellipse(c,3,5,2,2,'#856a43');}
  else if(kind==='small'){round(c,-27,-20,30,36,'#a4b9ab',5);round(c,12,0,17,18,'#d5b56d',3);line(c,[[2,-10],[24,-10],[19,-15],[24,-10],[19,-5]],'#5b8580',2);}
  else if(kind==='float'){ellipse(c,0,-10,17,21,'#e2bb75');line(c,[[0,10],[0,24]],'#806b4c',1);line(c,[[26,13],[26,-12],[21,-6],[26,-12],[31,-6]],'#6b9e90',2);}
  else{ellipse(c,0,-6,13,16,'#f0cf7d');metal(c,-7,9,14,9);for(let i=0;i<8;i++){const a=i*TAU/8;line(c,[[Math.cos(a)*21,-6+Math.sin(a)*23],[Math.cos(a)*27,-6+Math.sin(a)*29]],'#d4a451',1.5);}}
  c.restore();
 }
 board(c,s,g){
  const x=s.x,y=188;ellipse(c,x,441,39,5,'#244c4620');metal(c,x-8,310,16,126);metal(c,x-35,432,70,9);
  round(c,x-73,y+3,146,137,'#345e5c',11);metal(c,x-72,y,144,132);panel(c,x-65,y+7,130,116,s.errorLeft>0?'#f4d0be':'#f7f3df','#7b9586',7);
  c.fillStyle='#537674';c.font='800 9px sans-serif';c.textAlign='left';c.fillText('실험 '+String(s.id).padStart(2,'0'),x-56,y+23);
  ellipse(c,x+54,y+20,3,3,s.solved?'#6da48a':'#d9bd80');this.pictogram(c,s.kind,x,y+57,g.elapsed);
  const chars=[...s.word],w=chars.length*29-4;chars.forEach((char,i)=>{const xx=x-w/2+i*29;round(c,xx,y+93,25,25,i<s.inserted.length?'#d3e7d4':'#e8e8d7',4);c.strokeStyle=i===s.inserted.length&&!s.solved?'#bd984e':'#a4b8a4';c.lineWidth=1;c.stroke();if(i<s.inserted.length){c.fillStyle='#3f7061';c.font='800 17px sans-serif';c.textAlign='center';c.fillText(char,xx+12.5,y+111);}else{c.fillStyle='#9faf9a';c.font='10px sans-serif';c.textAlign='center';c.fillText('·',xx+12.5,y+110);}});
 }
 terrain(c,g){
  c.fillStyle='#263e4a';c.fillRect(g.camera.x,440,390,65);
  c.fillStyle='#31535a';c.fillRect(g.camera.x,440,390,16);
  for(const f of g.platforms().filter(f=>f.id.startsWith('floor-'))){if(f.x+f.w<g.camera.x||f.x>g.camera.x+390)continue;const x=Math.max(f.x,g.camera.x),w=Math.min(f.x+f.w,g.camera.x+390)-x;
   c.save();c.beginPath();c.rect(x,440,w,60);c.clip();
   c.fillStyle='#a6c2b3';c.fillRect(x,440,w,60);c.fillStyle='#bfd1bd';c.fillRect(x,446,w,32);
   c.fillStyle='#edf0d7';c.fillRect(x,440,w,4);c.fillStyle='#60877b';c.fillRect(x,444,w,3);
   for(let xx=Math.ceil(x/72)*72;xx<x+w;xx+=72)line(c,[[xx,447],[xx-15,500]],'#52766c55',1);line(c,[[x,477],[x+w,477]],'#52766c55',1);
   c.restore();
  }
 }
 device(c,s,g){
  const x=s.x,u=s.solved?Math.min(1,s.solvedAge/.8):0;
  const deck=(xx,yy,w)=>{metal(c,xx,yy,w,12);for(let i=8;i<w;i+=17)line(c,[[xx+i,yy+3],[xx+i,yy+9]],'#688c80',1);};
  const ledge=(xx,yy,w)=>{const h=440-yy;metal(c,xx,yy,w,h);round(c,xx+5,yy+12,w-10,h-19,'#a3bbab',3);for(let v=yy+30;v<435;v+=30)line(c,[[xx+7,v],[xx+w-7,v]],'#dce8ce',1);deck(xx,yy,w);};
  if(s.kind==='bridge'){
   for(let j=0;j<4;j++){const points=[];for(let i=0;i<=40;i++)points.push([x+90+i*6,465+j*9+Math.sin(i*.6+g.elapsed*2+j)*2]);line(c,points,j%2?'#70aaa9':'#b5dfcf',1.2);}
   for(const xx of[x+82,x+330]){metal(c,xx,416,8,25);ellipse(c,xx+4,416,5,5,'#d0ad6a');}
   if(u){deck(x+90,440,240*u);line(c,[[x+90,417],[x+90+240*u,417]],'#b6cabe',2);for(let i=30;i<240*u;i+=40)line(c,[[x+90+i,418],[x+90+i,439]],'#b9cbb9',1.5);}
  }else if(s.kind==='steps'){
   ledge(x+210,280,120);if(u)for(let i=0;i<3;i++){const yy=440-(40+i*40)*u;ledge(x+90+i*40,yy,40);}
  }else if(s.kind==='ladder'){
   deck(x+82,245,248);for(const xx of[x+82,x+321])line(c,[[xx,258],[xx,500]],'#72968b',5);
   if(u){const top=440-195*u;for(const xx of[x+LAB_LADDER.left,x+LAB_LADDER.right])metal(c,xx,top,4,440-top);for(let yy=top+10;yy<440;yy+=12)metal(c,x+LAB_LADDER.left,yy,28,4);}
   line(c,[[x+124,222],[x+330,222]],'#98b0a0',2);for(let xx=x+128;xx<x+330;xx+=41)line(c,[[xx,222],[xx,245]],'#a4bcaa',2);
  }else if(s.kind==='push'){
   const b=g.crate(s);line(c,[[x+95,449],[x+330,449]],'#d2b579',2);for(let xx=x+110;xx<x+330;xx+=22)ellipse(c,xx,450,5,3,'#6b8e81');
   c.save();c.beginPath();c.rect(x+85,230,260,272);c.clip();metal(c,b.x,b.y,80,160);panel(c,b.x+6,b.y+9,68,140,'#c3a476','#765d41',4);for(let yy=b.y+18;yy<b.y+150;yy+=34)line(c,[[b.x+9,yy],[b.x+71,yy]],'#e4cf9b',3);line(c,[[b.x+11,b.y+17],[b.x+68,b.y+142],[b.x+68,b.y+17],[b.x+11,b.y+142]],'#8e7753',5);
   for(const xx of[b.x+8,b.x+71])for(const yy of[b.y+12,b.y+147])ellipse(c,xx,yy,2,2,'#f2dba1');c.restore();
   metal(c,x+252,488,76,12);if(s.sink===1)deck(x+250,440,80);
  }else if(s.kind==='turn'){
   for(const xx of[x+86,x+326])metal(c,xx,426,8,70);const turn=Math.min(1,s.solvedAge/1.2),angle=s.solved?(-Math.PI/2)*(1-turn):-Math.PI/2;
   c.save();c.translate(x+210,446);c.rotate(angle);deck(-120,-6,240);c.restore();ellipse(c,x+210,446,14,14,'#aa8a57');ellipse(c,x+210,446,9,9,'#edd49b');ellipse(c,x+210,446,4,4,'#729888');
  }else if(s.kind==='open'){
   metal(c,x+170,70,58,11);
   for(const xx of [x+170,x+220])metal(c,xx,80,8,360);
   c.save();c.beginPath();c.rect(x+178,79,42,361);c.clip();
   metal(c,x+180,80-365*u,38,360);panel(c,x+185,124-365*u,28,180,'#85b5a6','#567970',5);line(c,[[x+187,326-365*u],[x+209,326-365*u]],'#497f71',3);
   c.restore();ellipse(c,x+199,64,5,3,s.solved?'#d6e8af':'#d4a78a');
  }else if(s.kind==='small'){
   for(const xx of[x+56,x+345]){metal(c,xx,356,7,84);ellipse(c,xx+3.5,353,7,7,s.solved?'#d4e69d':'#99b9ae');}
   metal(c,x+90,90,240,322);round(c,x+99,101,222,295,'#b9cbb7',6);for(let i=0;i<4;i++){round(c,x+107+i*52,118,43,92,'#557e73',5);for(let j=0;j<4;j++)round(c,x+112+i*52,126+j*18,33,12,['#c2d7b8','#e1c99b','#a6c9c1','#c9c5d3'][j],2);round(c,x+107+i*52,223,43,146,'#d4ddc4',3);for(let j=0;j<7;j++)line(c,[[x+114+i*52,238+j*17],[x+144+i*52,238+j*17]],'#91af9c',1);}
   line(c,[[x+94,411],[x+326,411]],'#526f64',2);if(s.solved)for(const xx of[x+62,x+348]){c.save();c.globalAlpha=.35;ellipse(c,xx,415,9,24,'#d7edab');c.restore();}
  }else if(s.kind==='float'){
   ledge(x+230,270,100);for(const xx of[x+110,x+224])line(c,[[xx,260],[xx,500]],'#73988c',3);const yy=440-s.lift*170;deck(x+110,yy,120);
   for(const xx of[x+132,x+208]){ellipse(c,xx,yy+22,12,16,s.solved?'#c7dfad':'#7f9b91');line(c,[[xx,yy+7],[xx,yy+12]],'#bba575',2);if(s.solved)for(let i=0;i<2;i++)line(c,[[xx-4,yy+41+i*7],[xx+4,yy+41+i*7]],'#adcfbc',1);}
  }else if(s.kind==='light'){
   c.save();c.globalAlpha=.94*(1-u)+.06;round(c,x+76,72,270,364,'#182c3c',4);c.restore();metal(c,x+76,70,270,11);for(const xx of[x+76,x+338])metal(c,xx,81,8,359);
   for(const xx of[x+132,x+231,x+322]){line(c,[[xx,86],[xx,122]],'#859f90',2);metal(c,xx-10,116,20,7);ellipse(c,xx,125,7,6,s.solved?'#fff0b1':'#58746e');if(u){const glow=c.createRadialGradient(xx,135,1,xx,180,165);glow.addColorStop(0,'#ffe6a35c');glow.addColorStop(1,'#ffe6a300');c.fillStyle=glow;c.fillRect(xx-130,125,260,315);}}
   for(const [a,b] of[[150,205],[255,330]]){metal(c,x+a,440,b-a,60);deck(x+a,440,b-a);}
   c.save();c.beginPath();c.rect(x+78,0,20,440);c.clip();metal(c,x+80,-440*u,16,440);c.restore();
  }
 }
 bot(c,b,t){
  paintLanguageBot(c,b);
  const face=Math.cos(t*b.speed+b.offset)>0?1:-1;c.save();c.translate(b.x,b.y);ellipse(c,0,0,20,4,'#234c5528');c.scale(face,1);const bob=Math.sin(t*8)*.7;
  panel(c,-19,-25+bob,38,23,'#c6808e','#784c5b',6);panel(c,-17,-26+bob,34,13,'#f5eadb','#986a70',4);line(c,[[-13,-23+bob],[12,-23+bob]],'#fff9ec',1);round(c,4,-18+bob,13,9,'#3b686b',3);for(const xx of [8,13])ellipse(c,xx,-14+bob,1.3,1.4,'#c2f2dc');round(c,-17,-5,34,5,'#406761',2);for(let i=0;i<4;i++)ellipse(c,-12+i*8,-2,3,3,'#54786d');line(c,[[-15,-30],[-10,-33],[0,-33]],'#bf9c6c',1);c.restore();
 }
 hero(c,g,character){
  const p=g.player,size=SIDE_HERO_SIZE*(p.small?.5:1);c.save();c.translate(p.x,p.y);const throwFace=p.throwAge<LANGUAGE_THROW.duration?(p.throwFace??(p.dir==='left'?-1:1)):(p.dir==='left'?-1:1);if(throwFace<0)c.scale(-1,1);if(g.invincibleLeft>0&&Math.floor(g.elapsed*12)%2)c.globalAlpha=.65;
  const cell=(image,col,row,n=256)=>c.drawImage(image,col*n,row*n,n,n,-size/2,-size*244/256,size,size);
  if(g.phase==='exiting'||g.reachedExit){const u=Math.min(1,g.exit.age/LAB_EXIT.walkTime);c.globalAlpha=Math.max(0,Math.min(1,(1-u)/.45));cell(this.images.walk,heroWalkFrame(p.walk,1),1);}
  else if(p.climbing){const frame=Math.floor(p.climbDistance/12)%6;cell(this.images.climb,frame%3,Math.floor(frame/3));}
  else if(p.throwAge<LANGUAGE_THROW.duration){const frame=languageThrowFrame(p.throwAge);cell(this.images.throw,frame,heroRows[character.id]);if(g.pendingThrow&&g.held){const q=languageThrowPoint(character.id,{...p,x:0,y:0},frame,1);this.block(c,{char:g.held.char,...q},false,22*(p.small?.5:1));const [hx,hy]=(THROW_PALMS[character.id]||THROW_PALMS.haru)[frame],k=size/256;c.save();c.beginPath();c.ellipse(q.x,q.y,10*k,8*k,0,0,TAU);c.clip();c.drawImage(this.images.throw,frame*256+hx-10,heroRows[character.id]*256+hy-8,20,16,(hx-138)*k,(hy-252)*k,20*k,16*k);c.restore();}}
  else if(g.stunLeft>0){cell(this.images.poses,3,heroRows[character.id]);}
  else if(g.held){drawCarryCell(c,this.images.walk,this.images.carry,{row:2,walkRow:3,walking:p.moving,walk:p.walk,size});if(g.held.phase==='held')this.block(c,{...g.held,x:17,y:-29},false,22);}
  else if(!p.onGround){cell(this.images.poses,p.vy<0?0:1,heroRows[character.id]);}
  else if(p.moving)drawSideWalk(c,this.images.walk,p.walk,3,-size/2,-size*244/256,size);
  else cell(this.images.idle,3,0);
  c.restore();if(g.stunLeft>0)for(let i=0;i<3;i++){const a=g.elapsed*4+i*TAU/3;c.fillStyle='#d9aa54';c.font='14px sans-serif';c.textAlign='center';c.fillText('✦',p.x+Math.cos(a)*18,p.y-57+Math.sin(a)*4);}
 }
 card(c,card,t){drawClueCard(c,card.x,card.y+Math.sin(t*3)*1.5,22,30);}
 exitDoor(c,g){
  const x=LAB_EXIT.x,u=g.exit.open;
  ellipse(c,x,442,48,6,'#355f5725');metal(c,x-43,294,86,148);round(c,x-34,304,68,136,'#274c4c',4);
  round(c,x-30,307,60,132,'#648e83',2);
  c.beginPath();c.moveTo(x-25,311);c.lineTo(x+26,311);c.lineTo(x+20,424);c.lineTo(x-19,424);c.closePath();c.fillStyle='#adcab3';c.fill();
  line(c,[[x-25,311],[x-19,424],[x+20,424],[x+26,311]],'#b9d1bc',1);line(c,[[x-30,439],[x-19,424],[x+20,424],[x+30,439]],'#e2ead1',1);
  c.save();c.beginPath();c.rect(x-34,304,68,136);c.clip();
  for(const side of [-1,1]){const xx=side<0?x-34-u*34:x+u*34;metal(c,xx,304,34,136);round(c,xx+5,320,24,70,'#7ca99b',3);line(c,[[xx+8,325],[xx+24,325]],'#d3e7d2',1);line(c,[[side<0?xx+29:xx+5,399],[side<0?xx+29:xx+5,416]],'#557f71',2);}
  c.restore();metal(c,x-43,438,86,5);round(c,x-32,276,64,20,'#3e7164',5);c.fillStyle='#eff6db';c.font='800 11px sans-serif';c.textAlign='center';c.fillText('출구',x,290);ellipse(c,x+35,299,2,2,u>0?'#c7efb0':'#a5b9a0');
 }
 background(c,g){
  c.fillStyle='#dedcc9';c.fillRect(0,0,390,500);
  for(let i=0;i<3;i++){const x=i*1620-g.camera.x,im=this.images['room'+i];if(x>390||x+1620<0)continue;c.drawImage(im,x,-20,1620,1620*im.height/im.width);}
  for(const wx of[1620,3240]){const x=wx-g.camera.x;if(x>-24&&x<414){metal(c,x-12,0,24,440);line(c,[[x-8,6],[x-8,434]],'#e1e7ce',1);line(c,[[x+8,6],[x+8,434]],'#88aa9d',1);panel(c,x-3,76,6,254,'#c8e5cf','#7ea492',3);}}
  const ex=4860-g.camera.x;if(ex<390){c.fillStyle='#d9e2d1';c.fillRect(Math.max(0,ex),0,390-Math.max(0,ex),440);for(let xx=ex+20;xx<390;xx+=90){metal(c,xx,65,76,142);round(c,xx+5,71,66,130,'#f0e9cf',3);c.fillStyle='#7c9b87';c.font='25px serif';c.textAlign='center';c.fillText(['가','A','あ'][Math.floor((xx-ex)/90)%3],xx+38,126);line(c,[[xx+14,156],[xx+62,156]],'#c2cdb4',2);line(c,[[xx+14,171],[xx+53,171]],'#c2cdb4',2);}}
 }
 draw(g,character){
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();this.background(c,g);
  c.save();c.translate(-g.camera.x,0);this.terrain(c,g);
  for(const s of g.stations){if(s.x<g.camera.x-370||s.x>g.camera.x+500)continue;this.device(c,s,g);this.board(c,s,g);if(g.ready(s)&&!hasSource(g,s.id))this.card(c,g.cardFor(s),g.elapsed);}
  for(const b of g.blocks)if(['rest','bounce','magnet'].includes(b.phase)&&b.x>g.camera.x-30&&b.x<g.camera.x+420){this.block(c,b,b===g.blockNear());}
  for(const b of g.bots)if(b.x>g.camera.x-30&&b.x<g.camera.x+420)this.bot(c,b,g.elapsed);
  if(g.camera.x>LANGUAGE.width-550)this.exitDoor(c,g);
  if(!g.reachedExit){c.save();if(g.phase==='exiting')c.globalAlpha=Math.max(0,1-g.exit.age/LAB_EXIT.walkTime);ellipse(c,g.player.x,g.player.y,15,4,'#244c5524');c.restore();}this.hero(c,g,character);drawVitalityFx(c,g,g.player.x,g.player.y-25,27);
  for(const sh of g.shots){const u=Math.min(1,sh.age/sh.duration);this.block(c,{char:sh.block.char,x:sh.from.x+(sh.to.x-sh.from.x)*u,y:sh.from.y+(sh.to.y-sh.from.y)*u-Math.sin(u*Math.PI)*45},false,23);}
  for(const e of g.effects){c.save();c.globalAlpha=Math.max(0,1-e.age);if(e.type==='magnet'){c.setLineDash([3,4]);line(c,[[e.x,e.y],[g.player.x,g.player.y-28]],'#69bda9',2);c.setLineDash([]);}else for(let j=0;j<8;j++){const a=j*TAU/8,r=e.age*33;ellipse(c,e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,2,2,j%2?'#d9b361':'#6eab94');}c.restore();}
  c.restore();round(c,13,14,364,31,'#f9f4dfe8',8);c.fillStyle='#3f6a65';c.font='800 12px sans-serif';c.textAlign='left';c.fillText(LAB_ROOMS[g.room],25,34);for(let i=0;i<9;i++)ellipse(c,256+i*12,29,3,3,hasSource(g,i+1)?'#c29b54':'#c0cbb8');
  c.restore();
 }
 entrance(c){
  c.save();ellipse(c,130,218,70,6,'#244c461c');
  metal(c,119,146,22,58);metal(c,82,201,96,12);line(c,[[89,204],[171,204]],'#f6f5d9',1.5);
  round(c,38,31,184,133,'#345e5c',12);metal(c,36,25,188,132);round(c,44,33,172,116,'#f5f1dc',8);
  line(c,[[57,47],[188,47]],'#d3c390',2);ellipse(c,203,47,3,3,'#7cac8a');
  const chars=['가','A','あ'];for(let i=0;i<3;i++){const x=57+i*50;round(c,x,70,45,57,'#cbdac8',5);round(c,x+2,72,41,51,'#fff6da',4);c.strokeStyle='#c8b578';c.lineWidth=.8;c.stroke();c.fillStyle='#3e7065';c.font='700 29px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(chars[i],x+22.5,99);}
  c.restore();
 }
 briefing(c,character,t){
  const u=t%3.6,start=1.1,age=u-start,active=age>=0&&age<LANGUAGE_THROW.duration,windup=active&&age<LANGUAGE_THROW.release-1e-9,held=u<start||windup,p={x:52,y:110,dir:'right',throwFace:1,moving:false,onGround:true,throwAge:active?age:99,walk:0},g={player:p,held:held?{char:'다',phase:'held'}:null,pendingThrow:windup?{}:null,elapsed:t,stunLeft:0,invincibleLeft:0};
  metal(c,111,29,52,70);round(c,116,34,42,60,'#f7f1d9');c.fillStyle='#648578';c.font='800 12px sans-serif';c.textAlign='center';c.fillText(age>=.43?'다 리':'□ 리',137,80);this.hero(c,g,character);
  if(age>=LANGUAGE_THROW.release-1e-9&&age<.43){const k=Math.max(0,(age-LANGUAGE_THROW.release)/LANGUAGE_THROW.flight),from=languageThrowPoint(character.id,p);this.block(c,{x:from.x+(137-from.x)*k,y:from.y+(55-from.y)*k-Math.sin(k*Math.PI)*25,char:'다'},false,22);}

 }
}
