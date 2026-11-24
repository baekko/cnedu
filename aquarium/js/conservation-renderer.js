import {paperPattern} from './conservation-patterns.js';
import {FieldRenderer,box,oval,text,TAU} from './field-renderer.js?v=155';
import {workshopAssets,artMetadata,loadWorkshopEntrance} from './workshop-art.js?v=155';
import {beginScene,drawRoom} from './layout.js';
import {bookWorm,patchTarget,patchSeams,BOOK_WORK} from './conservation-core.js';
export async function loadConservationAssets(){const images=await workshopAssets('conservation-v128',null,['room','books','hands','worm','entrance']);images.room0=images.room;[images.booksAtlas,images.handsAtlas,images.wormAtlas]=await Promise.all(['books','hands','worm'].map(k=>artMetadata('conservation-v128',k)));await loadWorkshopEntrance(images,'conservation');images.helpBrush=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('책 복원 동작 그림 오류'));im.src=new URL('../assets/conservation-v132/help-brush.webp',import.meta.url).href;});images.helpBrushAtlas=await artMetadata('conservation-v132','help-brush');return images;}
function patchPath(c,book,x,y,rotation=0){const points=paperPattern(book).points;c.save();c.translate(x,y);c.rotate(rotation*Math.PI/2);c.beginPath();for(const[i,p]of points.entries())i?c.lineTo(...p):c.moveTo(...p);c.closePath();c.restore();}
export class ConservationRenderer extends FieldRenderer{
 hand(c,index,x,y,size=93,lift=0){const f=this.images.handsAtlas.frames[index],k=size/384,tip=f.toolTip||f.contact;c.save();if(lift)c.globalAlpha=.82;oval(c,x+4,y+5,9,3,'#5b463d20');c.drawImage(this.images.hands,f.sx,f.sy,384,384,x-tip[0]*k,y-tip[1]*k-lift,384*k,384*k);c.restore();}
 draw(g){if(!g)return;const c=this.begin(g),b=g.book,f=this.images.booksAtlas.frames[b.id],k=300/468;
  oval(c,195,350,150,10,'#5238232b');c.drawImage(this.images.books,f.sx,f.sy,512,512,195-256*k,350-430*k,512*k,512*k);
  if(b.protected){c.save();c.strokeStyle='#75a9a5';c.lineWidth=3;c.beginPath();c.roundRect(40,201,310,155,7);c.stroke();c.restore();}
  if(!b.done&&b.mode===0){
   c.save();c.beginPath();for(const r of f.pageRects)c.rect(195+(r[0]-256)*k,350+(r[1]-430)*k,r[2]*k,r[3]*k);c.clip();
   for(const [i,d]of b.dust.entries())if(d.left>0){c.globalAlpha=d.left;for(let n=0;n<9;n++){const x=d.x+Math.sin(i*19+n*7)*15,y=d.y+Math.cos(i*13+n*5)*9;oval(c,x,y,5+n%3,1.5+n%2,'#89714d63');}for(let n=0;n<7;n++)oval(c,d.x+Math.sin(n*7+i)*18,d.y+Math.cos(n*4+i)*10,.7, .7,'#594a35a0');}c.restore();
   const w=bookWorm(b,g.elapsed);if(w.warning){c.save();c.strokeStyle='#b29a6690';c.setLineDash([3,5]);c.beginPath();c.moveTo(81,w.y);c.lineTo(310,w.y);c.stroke();c.restore();box(c,b.id%2?310:64,w.y-8,16,16,'#f7dfac',4);text(c,'!',b.id%2?318:72,w.y,11,'#946a3e');}if(w.active){const a=this.images.wormAtlas;c.save();c.translate(w.x,w.y);c.scale(b.id%2?1:-1,1);c.rotate(Math.sin(g.elapsed*12)*.05);c.drawImage(this.images.worm,a.sx,a.sy,a.sw,a.sh,-12,-3,24,24*a.sh/a.sw);c.restore();}
   this.hand(c,Math.floor(g.player.walk*8)%4,g.player.x,g.player.y,93,g.holding?0:9);
  }else if(!b.done&&b.mode===1){
   const target=patchTarget(b,g.elapsed);patchPath(c,b,target.x,target.y);c.fillStyle='#66513fbb';c.fill();c.strokeStyle=g.patchAligned||b.pinned?'#72a48b':'#c8a56d';c.lineWidth=1.3;c.setLineDash(b.pinned?[]:[3,2]);c.stroke();c.setLineDash([]);
   const p=b.pinned?target:g.player;patchPath(c,b,p.x,p.y,b.pinned?0:b.rotation);c.fillStyle='#f3e2b4f5';c.fill();c.strokeStyle='#c9b486';c.lineWidth=.8;c.stroke();c.save();c.beginPath();patchPath(c,b,p.x,p.y,b.pinned?0:b.rotation);c.clip();for(let i=0;i<7;i++){c.strokeStyle=i%2?'#aa916b24':'#fff8d870';c.beginPath();c.moveTo(p.x-32,p.y-21+i*8);c.lineTo(p.x+32,p.y-20+i*8);c.stroke();}c.restore();
   if(b.pinned){for(const[i,s]of patchSeams(b).entries()){oval(c,s.x,s.y,3,3,b.seams[i]>=1?'#79a68c':'#d5af62');if(b.seams[i]<1){c.strokeStyle='#f6e2a9';c.lineWidth=.8;c.beginPath();c.arc(s.x,s.y,5+Math.sin(g.elapsed*4)*1,0,TAU);c.stroke();}}this.hand(c,8,target.x-23,target.y,75);this.hand(c,4+Math.floor(g.player.walk*8)%4,g.player.x,g.player.y,91,g.holding?0:8);}
   else this.hand(c,8+Math.floor(g.workAge*5)%4,g.player.x-12,g.player.y,86,g.holding?0:8);
  }else if(!b.done&&b.mode===2){
   for(const[i,p]of[BOOK_WORK.pressLeft,BOOK_WORK.pressRight].entries()){box(c,p.x-30,242,60,80,'#a8844a20',4);const x=p.x-26;box(c,x,333,52,10,'#5e5749dd',3);box(c,x+52*.43,335,52*.27,6,'#aac798',1);box(c,x+Math.min(49,b.pressure[i]*49),332,3,12,'#f4d188',1);if(g.holding&&g.lastPressSide===i)this.hand(c,(i?14:12)+Math.floor(g.workAge*7)%2,p.x,p.y,92);else{c.strokeStyle='#b7996566';c.lineWidth=1;c.strokeRect(p.x-24,p.y-13,48,26);}}oval(c,g.player.x,g.player.y,5,5,'#f2d591c0');
  }
  if(b.done){box(c,147,365,96,23,'#e1ecd9ed',6);text(c,'✓ 복원 완료',195,377,11,'#5c876d');}
  box(c,12,10,366,38,'#fff0d8ec',7);text(c,(b.id+1)+'/9 · '+b.name+' · '+['먼지 털기','찢어진 종이 붙이기','들뜬 책장 펴기'][b.mode],24,23,11,'#735f42','left');box(c,24,36,342,3,'#d8c8a4',2);box(c,24,36,342*g.progress,3,'#85a889',2);
  // Tool and material names are on the physical drawer label below the work surface.
  box(c,124,447,142,23,'#e5cda4e8',4);text(c,['부드러운 붓','보존지 · 주걱','왼쪽 · 오른쪽 압착판'][b.mode],195,459,10,'#7c6244');this.end(c,g,false);
 }
 briefing(c,character,t=0){
  const a=this.images.helpBrushAtlas,frames=a.characters[character.id].frames,f=frames[Math.floor(t*4)%4],size=115,k=size/256,x=90-size/2,y=111-244*k;
  c.drawImage(this.images.helpBrush,f.sx,f.sy,256,256,x,y,size,size);
  if(f.brushTouchesPage){const q=f.brushTip;for(let i=0;i<4;i++){const u=(t*1.5+i/4)%1;oval(c,x+q[0]*k+u*8+i,y+q[1]*k-u*8,.5,.5,'#b1986680');}}
 }
}
