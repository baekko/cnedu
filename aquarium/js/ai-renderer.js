import {drawClueCard} from './clue-card-art.js';
import {AI,BODIES,POWERS,INKS,CAST,SLOTS,TABLES,LABELS} from './ai-core.js';
import {ImageDecoder,POWER_WORDS,ENV_WORDS} from './ai-inference.js';
import {PODS,podY,socket,sampleRect,fitArtwork} from './ai-art-layout.js';
import {ART_CELL,ART_BOUNDS,SAMPLE_BOUNDS} from './ai-frames.js';
import {landscape,air,motionTrail,skyCell,SUBJECTS} from './ai-print-art.js';
import {beginScene} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
const TAU=2*Math.PI,C=216,rows=['haru','doyun','narin','soi'],clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const INK='#23484b',cream='#fff5d9',yellow='#ffcf53',mint='#a8e2cf',COLORS=['#287e80','#bd6547','#795993'];
function box(c,x,y,w,h,col,r=0){c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function ellipse(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
function path(c,pts,col,w=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke();}
function label(c,s,x,y,sz=12,col=INK,align='center'){c.font='bold '+sz+'px system-ui,sans-serif';c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);}
function drawCell(c,img,col,row,x,y,size){c.drawImage(img,col*C,row*C,C,C,x-size/2,y-size/2,size,size);}
const ACC=['#73edec','#ffbd74','#c1a0ff'],DIG='#dff9ef';
const circ=(c,x,y,r,color)=>ellipse(c,x,y,r,r,color);
export async function loadAIAssets(character){const im={},files=[['ai/press-cutouts.webp','cutouts'],['ai/picture-worlds.webp','worlds'],['ai/picture-effects.webp','fx'],...[0,1,2].map(n=>['ai/picture-motion-'+n+'.webp','motion'+n]),...['room','body','part','ink','press'].map(n=>['ai/neural-'+n+'.webp',n]),['zoo/heroes-camera.webp','camera'],...['idle','walk'].map(n=>['hero-v153/'+character.id+'-'+n+'.webp',character.id+'-'+n+'.webp'])];
 const images=files.map(([f,k])=>new Promise((res,rej)=>{const img=new Image();img.onload=()=>{im[k]=img;res();};img.onerror=()=>rej(Error('생성실 그림을 열 수 없어요: '+f));img.src=new URL('../assets/'+f,import.meta.url).href;}));
 await Promise.all([...images,fetch(new URL('../assets/ai/studio-decoder.bin',import.meta.url)).then(r=>{if(!r.ok)throw Error('생성 모델을 열 수 없어요');return r.arrayBuffer();}).then(buf=>{im.model=new ImageDecoder(buf);})]);return im;}
export class AIRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.tile=document.createElement('canvas');this.tile.width=this.tile.height=ART_CELL;this.drafts=new Map();this.wallArt=null;}
 effect(){}
 stamp(c,kind,x,y,s){const i=CAST.indexOf(kind);if(i>=0)drawCell(c,this.images.cutouts,i%4,i>>2,x,y,s);}
 token(c,kind,x,y,s,glow=false){const pal=ACC[Math.max(0,Math.min(2,Math.floor(CAST.indexOf(kind)/6)))]||ACC[0];
  c.save();c.translate(x,y);box(c,-s/2,-s/2,s,s,'#113346db',6);c.strokeStyle=glow?'#fff2a5':pal;c.lineWidth=glow?2.1:1;c.stroke();if(kind)this.stamp(c,kind,0,-1,s*.96);else label(c,'···',0,-1,s*.45,'#aac9da');c.restore();}
 entrance(c){const im=this.images.press,k=Math.min(208/im.width,190/im.height);ellipse(c,130,202,67,5,'#5a9fb82e');c.drawImage(im,(260-im.width*k)/2,202-im.height*k,im.width*k,im.height*k);}
 hero(c,g,char){const p=g.player;ellipse(c,p.x,p.y,12,3,'#10213653');if(g.scanAge<.45&&g.receipt){const f=g.scanAge<.16?3:2;c.drawImage(this.images.camera,f*256,Math.max(0,rows.indexOf(char.id))*256,256,256,p.x-28,p.y-53.4,56,56);}else drawExplorer(c,this.images,char,p);}
 briefing(c,char,t){const u=t%4;const press=this.images.press;c.drawImage(press,94,44,50,62);this.hero(c,{player:{x:43,y:106,dir:'right',moving:false,walk:0,hammerAge:99},scanAge:u<.42?u:99,receipt:u<.42?{}:null},char);
  if(u<1.5){this.token(c,'wing',72+29*clamp(u/1.5),69,23,true);path(c,[[51,82],[72+29*clamp(u/1.5),69]],'#459fa8',1.2);}
  else {const v=(u-1.5)/2.5,w={body:'fox',part:'wing',powerLevel:v<.5?0:2};c.drawImage(this.plate(w.body,w.part,null,t,w.powerLevel),67,27,44,44);}}
 plate(body,part,ink,t,powerLevel=1,inkLevel=1){
  const tc=this.tile.getContext('2d'),N=ART_CELL;tc.setTransform(1,0,0,1,0,0);tc.clearRect(0,0,N,N);tc.imageSmoothingQuality='high';
  const sx=POWERS.indexOf(part)*N,sy=BODIES.indexOf(body)*N,im=this.images['motion'+powerLevel];
  // Margins are baked around the common footprint. A resting subject is drawn directly from the atlas.
  if(t&&part==='wing'){const w=N/16;for(let j=0;j<16;j++){const f=1-j/15;tc.drawImage(im,sx+j*w,sy,w,N,j*w,Math.sin(t*4.4)*f*f*(2+powerLevel*1.5),w+.2,N);}}
  else if(t&&part==='octopus'){const h=N/16;for(let j=0;j<16;j++){const f=j/15;tc.drawImage(im,sx,sy+j*h,N,h,Math.sin(t*5+f*6)*Math.max(0,f-.47)*(4+powerLevel*2.5),j*h,N,h+.2);}}
  else tc.drawImage(im,sx,sy,N,N,0,0,N,N);
  return this.tile;
 }
 picture(c,w,x,y,width,height,t=0){
  const lev=w.powerLevel??1,env=w.inkLevel??1,body=BODIES.indexOf(w.body),part=POWERS.indexOf(w.part);
  if(body<0||part<0)return;
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.beginPath();c.roundRect(x,y,width,height,4);c.clip();
  landscape(c,this.images.worlds,w,x,y,width,height);
  air(c,this.images.fx,w,x,y,width,height,t);motionTrail(c,w,x,y,width,height,t);
  const frame=fitArtwork(ART_BOUNDS[body*6+part],ART_CELL,x,y,width,height,...SUBJECTS[skyCell(w)]);
  c.drawImage(this.plate(w.body,w.part,w.ink,t,lev,env),frame.x,frame.y,frame.size,frame.size);
  c.restore();
 }
 monitor(c,g){
  // Cache a full resolution still. The wall never shows the small model-prediction thumbnail.
  const key=[g.reference.body,g.reference.part,g.reference.ink,g.reference.powerLevel,g.reference.inkLevel].join('/');
  if(this.wallArt?.key!==key){const cv=document.createElement('canvas');cv.width=750;cv.height=282;
   const ctx=cv.getContext('2d');ctx.scale(3,3);this.picture(ctx,g.reference,0,0,250,94,0);this.wallArt={key,cv};}
  c.save();box(c,61,4,268,111,'#10223c',10);c.strokeStyle='#58779d';c.lineWidth=2;c.stroke();
  box(c,66,7,258,100,'#263e56',6);c.strokeStyle='#91b5c9';c.lineWidth=.8;c.stroke();
  box(c,69,9,252,96,'#0e1a32',5);c.drawImage(this.wallArt.cv,70,10,250,94);
  path(c,[[76,111],[147,111]],'#567695',1.3);path(c,[[242,111],[312,111]],'#567695',1.3);
  circ(c,315,110,1.3,'#8effd4');c.restore();
 }
 draftImage(work){const key=[work.body,work.part,work.ink,work.powerLevel,work.inkLevel].join('/');if(this.drafts.has(key))return this.drafts.get(key);const model=this.images.model,rgb=model.predict(work);const cv=document.createElement('canvas');cv.width=cv.height=model.size;const ctx=cv.getContext('2d'),data=ctx.createImageData(cv.width,cv.height);for(let j=0;j<rgb.length/3;j++){data.data[j*4]=rgb[j*3];data.data[j*4+1]=rgb[j*3+1];data.data[j*4+2]=rgb[j*3+2];data.data[j*4+3]=255;}ctx.putImageData(data,0,0);if(this.drafts.size>=32)this.drafts.delete(this.drafts.keys().next().value);this.drafts.set(key,cv);return cv;}
 generated(c,w,x,y,width,height,age,t){
  const u=ease((age-.26)/.59);if(u<1){c.save();c.imageSmoothingEnabled=age>.34;c.drawImage(this.draftImage(w),x,y,width,height);c.restore();}
  if(u>0){c.save();c.globalAlpha=u;this.picture(c,w,x,y,width,height,t);c.restore();}
 }
 station(c,g,b,focus){
  const im=this.images[b.id],w=b.w,core=b.id==='press',active=b.id!=='ink'||!!g.order.ink,pal=core?'#a5f4d8':ACC[SLOTS.indexOf(b.id)];
  c.save();c.imageSmoothingQuality='high';ellipse(c,b.x,b.y+1,w*.44,6,'#08193665');
  if(core){const h=w*im.height/im.width;c.drawImage(im,b.x-w/2,b.y-h,w,h);c.save();c.globalAlpha=.15+.09*Math.sin(g.elapsed*3);ellipse(c,b.x,b.y-h*.61,14,16,'#a4ffff');c.restore();}
  else{
   const p=PODS[b.id],k=w/320,top=b.y-podY(p,p.height)*k,edges=[0,...p.band,p.height];
   for(let i=0;i<3;i++){const a=edges[i],z=edges[i+1],Y=top+podY(p,a)*k,H=(podY(p,z)-podY(p,a))*k;
    c.drawImage(im,0,a,320,z-a,b.x-w/2,Y,w,H+.15);}
   for(const a of g.samples.filter(a=>a.slot===b.id)){
    const well=socket(b,a.bay),idx=CAST.indexOf(a.kind),bounds=SAMPLE_BOUNDS[idx],r=sampleRect(well,bounds);
    const sel=a===focus,chosen=g.photos[a.slot]?.kind===a.kind;
    c.save();c.beginPath();c.ellipse(well.x,well.y,well.rx,well.ry,0,0,TAU);c.clip();
    const light=c.createLinearGradient(0,well.y-well.ry,0,well.y+well.ry);light.addColorStop(0,'#14283ed9');light.addColorStop(1,'#273c504a');
    c.fillStyle=light;c.fillRect(well.x-well.rx,well.y-well.ry,2*well.rx,2*well.ry);
    ellipse(c,well.x,r.y+r.h-.55,Math.min(well.rx*.76,r.w*.46),1.8,'#0e183e93');
    const [X,Y,W,H]=bounds;c.drawImage(this.images.cutouts,(idx%4)*C+X,(idx>>2)*C+Y,W,H,r.x,r.y,r.w,r.h);c.restore();
    if(sel||chosen){c.beginPath();c.ellipse(well.x,well.y,well.rx,well.ry,0,0,TAU);c.strokeStyle=sel?'#fff1b8':'#9ae5e4';c.lineWidth=sel?1.9:1.25;c.stroke();}
    // Permanent nameplates make a small or unusually shaped silhouette readable on a phone.
    const words=LABELS[a.kind],tagW=Math.max(26,words.length*8.5+8),yy=well.y+well.ry+2;
    box(c,well.x-tagW/2,yy,tagW,11,'#132840e8',4);label(c,words,well.x,yy+5.8,8,sel?'#ffecaf':'#e9f3fa');
   }
  }
  const name=core?'생성 코어':b.name,pw=name.length*9.6+12;box(c,b.x-pw/2,b.y+2,pw,14,'#13233fe8',5);label(c,active?name:'대기 · 프리즘',b.x,b.y+9,9,active?pal:'#a1acc1');c.restore();
 }
 room(c,g,char){
  const p=g.player,focus=g.target,t=g.elapsed,core=TABLES[3];g.displayed={target:focus,t,px:p.x,py:p.y};c.drawImage(this.images.room,0,0,390,500);
  // Each selected condition travels along a floor circuit to the synthesis core.
  for(let j=0;j<g.order.slots.length;j++){const b=TABLES[j],on=!!g.photos[b.id],from={x:b.x,y:b.y-4},to={x:core.x,y:core.y-1};
   const pts=[from,{x:from.x+(to.x-from.x)*.36,y:from.y},{x:from.x+(to.x-from.x)*.75,y:to.y},to];path(c,pts.map(v=>[v.x,v.y]),on?ACC[j]:'#7790b35e',on?2:1);
   if(on){const q=(t*1.1+j*.29)%1,k=Math.min(2,Math.floor(q*3)),f=q*3-k;circ(c,pts[k].x+(pts[k+1].x-pts[k].x)*f,pts[k].y+(pts[k+1].y-pts[k].y)*f,2.3,'#ecfff5');}}
  // The synthetic paths light up only for inputs the player actually supplied.
  if(g.photos.body){const nodes=[[305,23],[328,36],[346,18],[359,47],[334,61],[371,28]];const pulse=(t*1.5)%nodes.length;nodes.forEach(([nx,ny],i)=>{const v=nodes[(i+1)%nodes.length];path(c,[[nx,ny],v],'#73e9f15c',.8);if(i===Math.floor(pulse)){const f=pulse%1;circ(c,nx+(v[0]-nx)*f,ny+(v[1]-ny)*f,1.8,'#e6ffff');}});}
  this.monitor(c,g);
  const src=[...TABLES.map(b=>({y:b.y,paint:()=>this.station(c,g,b,focus)})),{y:p.y,paint:()=>this.hero(c,g,char)}];src.sort((a,b)=>a.y-b.y).forEach(a=>a.paint());
  if(focus&&g.phase==='collect'){const name=focus.type==='press'?'생성 코어':'스캔 · '+LABELS[focus.kind],b=focus.type==='press'?core:TABLES.find(v=>v.id===focus.slot),w=name.length*9+13;
   box(c,b.x-w/2,b.y+21,w,15,'#16304af2',5);label(c,name,b.x,b.y+29,9,'#fff3b0');}
  if(g.receipt&&g.scanAge<.83){const a=g.receipt,q=ease(g.scanAge/.8);const xx=a.drawX+(core.x-a.drawX)*q,yy=a.drawY+(core.y-48-a.drawY)*q-Math.sin(q*Math.PI)*22;
   this.token(c,a.kind,xx,yy,22,true);if(g.scanAge<.18)path(c,[[p.x+5,p.y-30],[a.drawX,a.drawY]],'#c9ffd9',2.3);}
  const msg=g.noticeLeft>0?g.notice:g.full?'중앙 코어에 다가가 생성을 누르세요':'상단 모니터를 보고 특징을 스캔하세요';
  box(c,49,428,292,20,'#112b43e8',6);label(c,msg,195,438,10.5,'#edf7ea');
  const n=g.order.slots.length;box(c,195-(n*71+12)/2,453,n*71+12,40,'#112b43ed',7);
  g.order.slots.forEach((s,j)=>{const x=195+(j-(n-1)/2)*71,sh=g.photos[s];this.token(c,sh?.kind,x-15,472,24,!!sh);label(c,sh?LABELS[sh.kind]:['형태','동작','효과'][j],x+2,472,10,'#d8e9ec','left');});
 }
 inference(c,g){
  const a=g.synthesis,w=g.draft;if(!a||!w)return;box(c,0,0,390,500,'#0a182bc7');box(c,14,34,362,426,'#13263efb',12);c.strokeStyle='#75c4cb';c.lineWidth=1.2;c.stroke();
  label(c,'AI 생성 코어',32,59,16,'#e4f6f0','left');label(c,'조건 미리보기',351,59,10,'#aeddd6','right');
  label(c,'주문 원본',109,94,11,'#acdfd9');label(c,a.age<.65?'AI가 그리는 중…':'생성 초안',265,94,11,'#ffd899');
  this.picture(c,g.reference,33,104,152,152,0);
  this.generated(c,w,205,104,152,152,a.age,g.elapsed);
  // The model's low-resolution prediction stays inspectable after refinement.
  c.save();c.imageSmoothingEnabled=false;c.drawImage(this.draftImage(w),34,268,32,32);c.restore();label(c,'모델 예측',71,284,9,'#a9c7d7','left');
  g.order.slots.forEach((s,i)=>{const x=181+i*58;this.token(c,g.photos[s].kind,x,285,22);if(i<g.order.slots.length-1)path(c,[[x+14,285],[x+36,285]],ACC[i],1.1);});
  const control=(j,yy,s)=>{const on=a.channel===j,idx=s==='part'?w.powerLevel:w.inkLevel,words=s==='part'?POWER_WORDS[w.part]:ENV_WORDS;
   box(c,29,yy,329,32,on?'#36546d':'#1c364e',7);if(on){c.strokeStyle='#7ce9dc';c.lineWidth=1.2;c.stroke();}
   label(c,j===0?LABELS[w.part]:LABELS[w.ink],40,yy+16,11,'#eef9ef','left');
   for(let k=0;k<3;k++){const x=113+k*92;box(c,x-37,yy+5,74,22,k===idx?(on?'#b1ede0':'#a5c8cf'):'#253e57',5);label(c,words[k],x,yy+16,10,k===idx?'#204351':'#c4d8df');}};
  control(0,314,'part');if(w.ink)control(1,354,'ink');
  label(c,g.noticeLeft>0?g.notice:(w.ink?'↑↓ 바꿀 특징  ·  ←→ 강도 조절':'←→ 동작을 조절해 원본과 비교하세요'),195,407,11,'#ffdf9d');
  label(c,'초안이 마음에 들면 출력',195,432,10,'#b3ced6');
 }
 develop(c,g){const r=g.print;if(!r)return;const work={body:r.body.kind,part:r.part.kind,ink:r.ink?.kind,powerLevel:r.powerLevel,inkLevel:r.inkLevel};
  box(c,0,0,390,500,'#10213abb');box(c,41,72,308,344,'#152e47',11);c.strokeStyle='#7bd8ce';c.lineWidth=1.3;c.stroke();label(c,r.developed?'출력 완료':'출력 중',195,100,15,DIG);
  this.picture(c,work,56,123,278,213,g.elapsed);label(c,[work.ink&&LABELS[work.ink],LABELS[work.part],LABELS[work.body]].filter(Boolean).join(' · '),195,357,16,'#eef3dd');
  label(c,r.developed?(r.good?'원본 재현 · 단서 획득':'다른 장면이에요 · 틀린 특징만 바꿔요'):'완성된 그림을 출력하고 있어요',195,385,11,'#a7ded5');if(r.developed&&r.good)drawClueCard(c,128,385,14,18);}
 draw(g,char){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();this.room(c,g,char);if(g.phase==='infer')this.inference(c,g);else if(g.print)this.develop(c,g);c.restore();}
}
