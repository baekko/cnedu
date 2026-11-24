import {drawClueCard} from './clue-card-art.js';
import {beginScene} from './layout.js';
import {drawExplorer,drawCarryCell} from './heroes.js?v=155';
import {ARTICLES,NEWSROOM,NEWSPAPER} from './newspaper-core.js';
const TAU=Math.PI*2;
const box=(c,x,y,w,h,fill,r=4)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const stroke=(c,color='#927951',w=.8)=>{c.strokeStyle=color;c.lineWidth=w;c.stroke();};
const line=(c,x,y,x2,y2,color,w=1)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const text=(c,s,x,y,size=10,color='#345d59',align='center',weight=700)=>{c.fillStyle=color;c.font=`${weight} ${size}px sans-serif`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y);};
export async function loadNewspaperAssets(character){
 const images={},files=[['newspaper-v130/photos-a.webp','photos-a'],['newspaper-v130/photos-b.webp','photos-b'],...['room','photos','giraffe'].map(n=>['newspaper/'+n+'.webp',n]),['robot/'+character.id+'-work.webp','carry'],...['walk','idle'].map(n=>['hero-v153/'+character.id+'-'+n+'.webp',character.id+'-'+n+'.webp'])];
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('신문사 그림: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));return images;
}
export class NewspaperRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];this.articles=ARTICLES;}
 effect(){}
 photo(c,id,x,y,w,h){const artId=this.articles[id]?.artId??id;id=artId%9;const im=this.images[artId<9?'photos':artId<18?'photos-a':'photos-b'],sx=im.width/3,sy=im.height/3;c.save();c.beginPath();c.roundRect(x,y,w,h,2);c.clip();const crop=Math.min(sx,sy)*.95,sw=w>=h?crop:crop*w/h,sh=w>=h?crop*h/w:crop;c.drawImage(im,(id%3)*sx+(sx-sw)/2,Math.floor(id/3)*sy+(sy-sh)/2,sw,sh,x,y,w,h);c.restore();}
 paper(c,x,y,w=30,h=37,id=0){
  box(c,x,y,w,h,'#fff9e8',1);stroke(c,'#c1b698',.6);text(c,'THE DAILY',x+w/2,y+h*.15,w*.12,'#40635b');line(c,x+3,y+h*.21,x+w-3,y+h*.21,'#61786c',.6);this.photo(c,id,x+3,y+h*.28,w*.45,h*.38);
  for(let i=0;i<4;i++)line(c,x+w*.57,y+h*(.3+i*.095),x+w-3,y+h*(.3+i*.095),'#a4aa95',.55);for(let i=0;i<3;i++)line(c,x+3,y+h*(.75+i*.08),x+w-3,y+h*(.75+i*.08),'#b0af96',.5);
 }
 printer(c,x,y,width=90,time=0,active=false,id=0){
  c.save();c.translate(x,y);c.scale(width/110,width/110);
  oval(c,0,1,53,8,'#284f4924');
  // A single coherent press: paper feed, ink cylinders, cabinet and output tray.
  box(c,-43,-11,12,14,'#344b4a',3);box(c,30,-11,12,14,'#344b4a',3);
  box(c,-49,-65,99,56,'#396e69',7);stroke(c,'#264e4b',1);
  const side=c.createLinearGradient(-47,-60,47,-12);side.addColorStop(0,'#9bc0b1');side.addColorStop(.45,'#6b9c8d');side.addColorStop(1,'#41776c');box(c,-46,-62,92,49,side,5);
  box(c,-41,-86,78,31,'#f0e5c6',4);stroke(c,'#9d957a');box(c,-34,-93,64,29,'#dedbc1',3);stroke(c,'#9d957a');
  for(let i=0;i<4;i++)line(c,-29,-88+i*4,26,-88+i*4,'#fcf9e7',2);
  box(c,-34,-59,60,31,'#204c4c',4);stroke(c,'#b6b49a');
  for(let i=0;i<3;i++){const yy=-54+i*9;box(c,-28,yy,48,7,['#8b8980','#405759','#b78a55'][i],3);line(c,-26,yy+1,17,yy+1,'#d9cfb0',.8);if(active){const off=time*32%8;for(let j=0;j<6;j++)line(c,-28+j*8+off,yy+1,-26+j*8+off,yy+5,'#d7d4ba',.65);}}
  box(c,30,-55,11,20,'#d6cc9e',3);oval(c,35.5,-49,2,2,active?'#e7cf79':'#80ae88');oval(c,35.5,-40,2.2,2.2,'#9e7159');
  line(c,-40,-20,40,-20,'#c1cdb0',1);box(c,-40,-16,80,7,'#2c5856',2);box(c,-35,-7,70,6,'#c5b88c',2);
  const amount=active?Math.min(1,time/NEWSPAPER.printSeconds):.6;c.save();c.beginPath();c.rect(-35,-14,70,42);c.clip();this.paper(c,-26,-47+amount*38,52,43,id);c.restore();
  for(const xx of[-39,39])for(const yy of[-58,-23]){oval(c,xx,yy,1.5,1.5,'#c8c69c');line(c,xx-1,yy,xx+1,yy,'#6a8272',.5);}
  c.restore();
 }
 material(c,m,x=m.x,y=m.y,width=68,selected=false){
  c.save();c.translate(x,y);c.scale(width/68,width/68);oval(c,1,25,32.6,3,'#213e4738');
  box(c,-34,-23.5,68,47,'#fff8e4',3);stroke(c,selected?'#458f80':'#baab87',selected?2:1);
  if(m.kind==='photo')this.photo(c,m.article,-30,-19.5,60,39);
  else {const a=this.articles[m.article];a.title.forEach((s,i)=>text(c,s,0,-3+i*13,9.2,'#395b56'));line(c,-26,17,26,17,'#d4c39c',.7);}
  c.restore();
 }
 carriedCard(c,m,x,y,angle=0){
  c.save();c.translate(x,y);c.rotate(angle);box(c,-11,-9,22,18,'#fff6db',1);stroke(c,'#bbad83',.5);
  if(m.kind==='photo')this.photo(c,m.article,-9,-7,18,14);else for(let i=0;i<3;i++)line(c,-7,-4+i*4,7,-4+i*4,'#7a8a72',.7);c.restore();
 }
 satchel(c,x,y){
  c.save();c.translate(x,y);line(c,-7,-20,8,0,'#6d6852',2);box(c,-9,-7,19,18,'#b3834f',3);stroke(c,'#775c40',.7);box(c,-8,-8,17,9,'#d2ac6c',3);stroke(c,'#8d704a',.7);box(c,-2,-1,5,5,'#efd18d',1);stroke(c,'#92774c',.6);line(c,-5,8,6,8,'#e5c38b',.6);c.restore();
 }
 belt(c,g){
  const y=NEWSROOM.beltY;oval(c,195,y+31,180,7,'#39584c24');box(c,12,y-33,366,66,'#6a8175',8);stroke(c,'#456259');
  box(c,17,y-33,356,6,'#d5bb83',2);box(c,17,y+27,356,6,'#b0935b',2);
  c.save();c.beginPath();c.roundRect(19,y-27,352,54,3);c.clip();c.fillStyle='#3e5652';c.fillRect(18,y-27,354,54);const off=g.elapsed*NEWSROOM.beltSpeed%13;
  for(let x=off-13;x<390;x+=13){box(c,x,y-26,10,52,'#6c8175',1);line(c,x+1,y-25,x+1,y+25,'#9ba793',.8);}
  const near=g.materialNear();for(const m of g.materials)if(m.kind)this.material(c,m,m.x,m.y,68,near?.id===m.id);c.restore();
  for(const x of[13,377]){box(c,x-5,y-33,10,66,'#b79860',3);stroke(c,'#7e7856');for(const yy of[y-27,y+27])oval(c,x,yy,1.5,1.5,'#e8d6a7');}
  for(const x of[32,358]){box(c,x-6,y+31,12,14,'#557269',2);line(c,x-3,y+33,x-3,y+43,'#b8b798',1);}
 }
 board(c,g,b){
  const selected=g.boardNear()?.id===b.id,x=b.x,y=145,w=166,h=132;
  oval(c,x,286,62,5,'#284e4623');for(const xx of[x-58,x+58]){box(c,xx-4,264,8,23,'#738d7b',2);line(c,xx-2,265,xx-2,283,'#e0d8b5',1);}
  box(c,x-w/2,y,w,h,'#4b756b',7);stroke(c,selected?'#c49a46':'#355c55',selected?2.1:1);
  box(c,x-w/2+4,y+4,w-8,h-8,'#f7f0d7',5);line(c,x-w/2+10,y+27,x+w/2-10,y+27,'#cab791',.8);
  if(b.article===null){text(c,'편집 완료',x,y+57,13,'#538673');text(c,'모든 기사를 보냈어요',x,y+78,10,'#7a8874');return;}
  const a=this.articles[b.article];text(c,'기사 '+String(a.id+1).padStart(2,'0'),x-w/2+12,y+20,9,'#608073','left');text(c,a.category,x+w/2-12,y+20,9,'#ab8550','right');
  a.brief.forEach((s,i)=>text(c,s,x,y+43+i*15,10.4,'#344f49', 'center',600));
  const slots=[{key:'photo',xx:x-72,ww:55},{key:'title',xx:x-11,ww:83}];
  for(const {key,xx,ww} of slots){const red=b.errorFields.includes(key),mat=b[key];box(c,xx,y+70,ww,47,mat?'#fffaf0':red?'#f7e0cd':'#e4e8d7',3);stroke(c,red?'#bd7359':selected&&g.carried.some(m=>m.kind===key)?'#b49552':'#b4bba1',.9);
   if(mat){if(key==='photo')this.photo(c,mat.article,xx+3,y+73,ww-6,41);else this.articles[mat.article].title.forEach((s,i)=>text(c,s,xx+ww/2,y+88+i*13,9.6,'#3c5e56'));}
   else{text(c,key==='photo'?'사진':'제목',xx+ww/2,y+98,10,red?'#a05e48':'#83907b');}
  }
  if(['correcting','printing','published'].includes(b.status)){
   box(c,x-66,y+118,132,13,b.status==='correcting'?'#b1765b':'#477d6c',3);text(c,b.status==='correcting'?'교정 중 · '+Math.ceil(Math.max(0,3-b.age))+'초':b.status==='printing'?'인쇄 중…':'발행 완료!',x,y+127,8.2,'#fff2ce');
  }else if(selected){oval(c,x,294,26,5,'#cbac6145');}
 }
 hero(c,g,character){
  this.articles=g.articles||this.articles;const p=g.player;c.save();oval(c,p.x,p.y+1,14,4,'#244b5230');
  if(!g.held&&!g.motion&&!g.bagActive){drawExplorer(c,this.images,character,p);c.restore();return;}
  const row=p.dir==='up'?1:['left','right'].includes(p.dir)?2:0,col=g.motion?Math.min(3,Math.floor(g.motion.age/g.motion.duration*4)):0;
  c.translate(p.x,p.y);if(p.dir==='left')c.scale(-1,1);drawCarryCell(c,this.images[character.id+'-walk.webp'],this.images.carry,{row,frame:col,walking:p.moving,walk:p.walk});
  if(g.bagActive)this.satchel(c,-11,-17);
  if(g.packed)this.carriedCard(c,g.packed,-11,-24,-.14);
  if(g.held){const x=row===1?14:row===2?17:0;this.carriedCard(c,g.held,x,-24,row===2?-.12:.05);}
  c.restore();
 }
 action(c,g){
  const m=g.motion;if(!m||!m.material)return;const u=Math.min(1,m.age/m.duration),b=g.boards[m.board];
  for(const material of m.materials||[m.material]){
   const from=m.kind==='pick'?m.from:{x:g.player.x,y:g.player.y-26},to=m.kind==='pick'?{x:g.player.x,y:g.player.y-26}:{x:b.x+(material.kind==='photo'?-44:30),y:238};
   this.carriedCard(c,material,from.x+(to.x-from.x)*u,from.y+(to.y-from.y)*u-Math.sin(u*Math.PI)*13);
  }
 }
 draw(g,character){
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;this.articles=g.articles;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();c.drawImage(this.images.room,0,0,390,500);
  // Keep the room's frame; its cork centre starts empty and fills after printing.
  box(c,125,9,143,57,'#c7a474',1);for(let j=0;j<72;j++){c.fillStyle=j%2?'#af8b5e35':'#ecd1a235';c.fillRect(127+(j*31)%138,11+(j*19)%53,1,1);}
  (g.publishedArticles||[]).forEach((id,i)=>{const x=130+(i%3)*44,y=13+Math.floor(i/3)*17;this.paper(c,x,y,39,15,id);oval(c,x+19.5,y+1,1,1,'#8d5d46');});
  const printing=g.boards.find(b=>b.status==='printing'),last=g.boards.find(b=>b.status==='published');this.printer(c,322,127,79,g.printerAge,!!printing,printing?.article??last?.article??0);
  // A small pinboard name is part of the room, not another gameplay instruction.
  box(c,132,111,110,22,'#395f58',4);stroke(c,'#bca576');text(c,'오늘의 편집실',187,126,10,'#eee2bb');
  for(const b of g.boards)this.board(c,g,b);
  this.belt(c,g);box(c,331,316,38,18,'#729280',3);stroke(c,g.held&&g.returnNear()?'#d3a752':'#4c7565');box(c,334,318,32,8,'#d4d0a9',2);text(c,'반납',350,332,8,'#fff3d2');this.hero(c,g,character);this.action(c,g);
  for(const e of g.effects){const u=e.age/1.5;c.save();c.globalAlpha=Math.min(1,(1-u)*3);c.translate(e.x,e.y-u*53);drawClueCard(c,0,0,22,30);c.restore();}
  if(g.bagActive){box(c,13,446,104,19,'#fcf0cce8',5);text(c,'취재 가방 · '+g.carried.length+' / 2',65,459,9,'#7d6d40');}
  c.restore();
 }
 entrance(c){this.printer(c,130,190,226,0,false,0);}
 briefing(c,character,t){
  const u=t%3.2,photo={kind:'photo',article:0};c.save();box(c,98,20,68,69,'#588778',5);box(c,102,24,60,61,'#f8edd2',3);box(c,108,33,22,18,'#e4e3cc',1);for(let i=0;i<4;i++)line(c,138,34+i*6,157,34+i*6,'#a29d7a',1);line(c,108,65,157,65,'#cab689');line(c,108,71,149,71,'#cab689');
  const held=u<1.8?photo:null,moving=u>=1.8&&u<2.15;
  const g={player:{x:70,y:109,dir:'right',moving:false,walk:0,hammerAge:99},held,motion:moving?{kind:'place',age:u-1.8,duration:.35}:null};this.hero(c,g,character);
  // The same 22×18 card is used in the hand, in flight, and on the board.
  if(moving){const k=(u-1.8)/.35;this.carriedCard(c,photo,87+32*k,85-43*k,-.12*(1-k));}
  else if(u>=2.15)this.carriedCard(c,photo,119,42);
  c.restore();
 }
}
