import {drawClueCard} from './clue-card-art.js?v245';
import {CAST} from './literature-layout.js';
import {drawLiteratureWork} from './literature-work.js';
import {hasSource} from './clue-order.js';
import {beginScene} from './layout.js';
import {drawExplorer,drawCarryCell} from './heroes.js?v=155';
import {BOOKS,roomBase,lockAt,BACK_PORTAL} from './literature-core.js';
import {FLOORS,EXITS,ropePoints,valvePoints,reelAt,windProps,knightPoint,salvagePoints,raftPoint,surfAt,sheepAt,patrolAt,patrolMembers,ropeWorkPoint,tentacleAt,tentaclePose,elephantGates,elephantObstacles,valveWorkPoint,VALVE_SECONDS,FISHING,SEWING,LOCK_WORK,seamX,elephantStart} from './literature-rules.js';
const TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,n));
const box=(c,x,y,w,h,fill,r=3)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const line=(c,x,y,xx,yy,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
const oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const stroke=(c,col='#927d55',w=.8)=>{c.strokeStyle=col;c.lineWidth=w;c.stroke();};
const text=(c,s,x,y,size=10,col='#355957',align='center')=>{c.fillStyle=col;c.font=`700 ${size}px sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);};
function poly(c,pts,col){c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function shadow(c,x,y,r=18){oval(c,x,y,r,r*.27,'#254c4b28');}
export async function loadLiteratureAssets(character){
 const images={},files=[['literature-v130/soldier.webp','soldier-walk-v58'],...Array.from({length:9},(_,i)=>[BOOKS[i].id==='anne'?'literature-v184/anne.webp':'literature/scene-'+i+(i===3?'-v86':[1,4].includes(i)?'-v55':'')+'.webp','scene-'+i]),...['npc-cast-v79','work-v68','anne-v58','barrel-roll-v58','elephant-walk-v57','tentacle-strip-v57','squid-window-v57','untie-v57','npc-crusoe-v55','crusoe-work-v56','prop-raft-base-v55','prop-raft-v55','prop-tentacle-v55','prop-sheep-v55','npc-lilliputian-v55','npc-elephant-front-v55','npc-elephant-back-v55','npc-elephant-left-v55','npc-elephant-right-v55','prop-rock-v55','prop-log-v55','prop-mud-v55','entry','panda','guards','npc-prince','prop-rose','prop-marlin','prop-meteor','prop-chest','prop-chest-open','prop-barrel','prop-carriage','prop-shield','prop-lance','prop-ticket','prop-suitcase','prop-mill-rotor','prop-mill-tower','prop-valve','prop-cart'].map(n=>['literature/'+n+'.webp',n]),...Array.from({length:4},(_,i)=>['literature/npc-'+i+'.webp','npc-'+i]),['robot/'+character.id+'-work.webp','carry'],...['walk','idle'].map(n=>['hero-v153/'+character.id+'-'+n+'.webp',character.id+'-'+n+'.webp'])];
 await Promise.all(files.map(([file,key])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('문학관 그림: '+file));im.src=new URL('../assets/'+file,import.meta.url).href;})));return images;
}
export class LiteratureRenderer{
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 effect(){}
 depth(c,y,paint){if(!this.layers){paint();return;}const transform=c.getTransform();this.layers.push({y,paint:()=>{c.save();c.setTransform(transform);paint();c.restore();}});}
 cast(c,name,s){const a=CAST[name],im=this.images['npc-cast-v79'],row=name==='fisherman'?0:1,frame=s.solved?1:0,h=a.height*640/580,w=h*512/640;this.depth(c,a.y,()=>{shadow(c,a.x,a.y,a.rx);c.drawImage(im,frame*512,row*640,512,640,a.x-w/2,a.y-h*620/640,w,h);});}

 sprite(c,key,x,y,w,foot=false){const im=this.images[key];if(!im)return;const h=w*im.height/im.width;c.drawImage(im,x-w/2,foot?y-h:y-h/2,w,h);}
 ring(c,x,y,t,r=21){c.save();c.strokeStyle='#f7d892';c.lineWidth=1.3;c.setLineDash([3,4]);c.beginPath();c.ellipse(x,y,r,r*.45,0,t*.25,t*.25+TAU);c.stroke();c.restore();}
 target(c,x,y,t,label){c.save();oval(c,x,y,23,11,'#fff2c838');c.setLineDash([5,4]);c.lineDashOffset=-t*7;c.lineWidth=4;c.strokeStyle='#5f6049';c.beginPath();c.ellipse(x,y,23,11,0,0,TAU);c.stroke();c.lineWidth=2.3;c.strokeStyle='#ffe47f';c.stroke();c.setLineDash([]);box(c,x-30,y+15,60,16,'#fff7dff0',5);text(c,label,x,y+23,9,'#365e57');c.restore();}
 glass(c,x,y,size=1,rose=false){c.save();c.translate(x,y);c.scale(size,size);shadow(c,0,4,18);oval(c,0,1,18,6,'#be9b5d');oval(c,0,-1,15,5,'#e2c382');
  if(rose)this.sprite(c,'prop-rose',0,-2,23,true);
  const gl=c.createLinearGradient(-17,-40,18,0);gl.addColorStop(0,'#b6e0de50');gl.addColorStop(.5,'#efffff18');gl.addColorStop(1,'#9bc7d369');c.fillStyle=gl;c.beginPath();c.moveTo(-16,-2);c.lineTo(-16,-31);c.bezierCurveTo(-16,-53,16,-53,16,-31);c.lineTo(16,-2);c.quadraticCurveTo(0,6,-16,-2);c.fill();stroke(c,'#d3e6df',1.2);line(c,-11,-29,-11,-12,'#f9ffedb0',2);c.restore();
 }
 rose(c,x,y,t,covered){if(covered){this.glass(c,x,y,1.25,true);return;}shadow(c,x,y,16);c.save();c.translate(x,y);c.rotate(Math.sin(t)*.018);this.sprite(c,'prop-rose',0,0,29,true);c.restore();}
 card(c,id,x,y,t,pickup=false){const yy=y-(pickup?34:10)+Math.sin(t*3+id)*2;if(pickup){this.target(c,x,y,t,'단서 줍기');poly(c,[[x-4,y-12],[x+4,y-12],[x,y-6]],'#fff2b3');}else shadow(c,x,y+5,15);drawClueCard(c,x,yy,24,32);}
 progress(c,x,y,n,total){for(let i=0;i<total;i++){oval(c,x+(i-(total-1)/2)*12,y,3.5,3.5,i<n?'#6c9d82':'#ede1c1');c.strokeStyle='#b69b69';c.lineWidth=.65;c.stroke();}}
 sword(c,x,y,a,size=55){c.save();c.translate(x,y);c.rotate(a);line(c,0,0,size,0,'#74878b',3);line(c,1,-.9,size,-.9,'#ebf2e8',1.4);poly(c,[[size,-1.5],[size+7,0],[size,1.5]],'#dbe8e4');line(c,2,-7,2,7,'#b39255',2);line(c,-9,0,0,0,'#775c45',3);oval(c,-11,0,2,2,'#c6a66a');c.restore();}
 npc(c,key,x,y,h,t=0){this.depth(c,y,()=>{const im=this.images[key],w=h*im.width/im.height;shadow(c,x,y,w*.3);c.save();c.translate(x,y);c.drawImage(im,-w/2,-h,w,h);c.restore();});}
 crusoe(c,s){const t=s.time;
  this.depth(c,424,()=>{this.sprite(c,'prop-raft-base-v55',195,424,110,true);
  if(s.built>0)this.sprite(c,'prop-log-v55',181,411,75,true);
  if(s.build){const u=clamp(s.build.age/s.build.duration);c.save();c.translate(220-26*u,404-u*4);c.rotate(-.14*u);this.sprite(c,'prop-log-v55',0,0,63,true);c.restore();}
  if(s.solved){c.save();c.globalAlpha=clamp(s.solvedAge/.5);this.sprite(c,'prop-raft-v55',195,424,110,true);c.restore();}
  });
  const worker=this.images['crusoe-work-v56'],frame=s.build?Math.min(3,Math.floor(s.build.age/.4)):s.solved?3:0,w=66*640/720;
  const a=CAST.crusoe;this.depth(c,a.y,()=>{shadow(c,a.x,a.y,20);c.drawImage(worker,frame*640,0,640,720,a.x-w*.6,a.y-66*688/720,w,66);});
  if(s.build)this.depth(c,424,()=>{const u=clamp(s.build.age/s.build.duration);c.save();c.strokeStyle='#dec393';c.lineWidth=1.8;c.beginPath();c.ellipse(207,404,5,10,-.45,-Math.PI/2,-Math.PI/2+TAU*u);c.stroke();c.restore();});
  salvagePoints.forEach((p,k)=>{if(!s.flags.has(k)&&s.heldIndex!==k){this.depth(c,p.y,()=>{shadow(c,p.x,p.y,24);this.sprite(c,'prop-log-v55',p.x,p.y,62,true);});this.ring(c,p.x,p.y+3,t,27);}});
  if(!s.solved){const w=surfAt(t);c.save();c.beginPath();FLOORS[1].forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();if(w.warning){for(let j=0;j<3;j++){c.strokeStyle='#d6ede8a0';c.lineWidth=1;c.beginPath();c.ellipse(352+j*8,288,5,55+j*8,0,-1.4,1.4);c.stroke();}}
  if(w.active)for(const [top,bottom]of [[214,w.gap-w.gapWidth/2],[w.gap+w.gapWidth/2,370]]){if(bottom-top<3)continue;const len=bottom-top,crest=y=>{const u=(y-top)/len;return w.x+12*(2*u-1)**2+Math.sin(y*.09+t*3)*1.8;},spread=y=>56*Math.sqrt(Math.max(0,Math.sin(Math.PI*(y-top)/len)));
   const water=c.createLinearGradient(w.x-2,0,w.x+66,0);water.addColorStop(0,'#e4f0d991');water.addColorStop(.19,'#a5d2bf91');water.addColorStop(.55,'#7db8ae62');water.addColorStop(1,'#a1c6b500');c.fillStyle=water;c.beginPath();c.moveTo(crest(top),top);for(let y=top;y<=bottom;y+=2)c.lineTo(crest(y),y);c.lineTo(crest(bottom),bottom);for(let y=bottom;y>=top;y-=2)c.lineTo(crest(y)+spread(y),y);c.closePath();c.fill();
   // A curled, tapered wash: no rectangular ends or opaque strip on the sand.
   for(let y=top+2;y<bottom-2;y+=2){const u=(y-top)/len,fade=Math.sin(Math.PI*u);line(c,crest(y),y,crest(y+2),y+2,`rgba(246,247,222,${fade*.88})`,2.5+fade*.8);}
   for(let j=0;j<Math.ceil(len/6);j++){const y=top+4+j*6;if(y>=bottom-3)continue;const u=(y-top)/len,fade=Math.sin(Math.PI*u),x=crest(y),roll=3+Math.sin(j*1.8+t*2)*1.5;oval(c,x+roll,y,2.7*fade,1.4*fade,'#fffbe5b0');c.strokeStyle=`rgba(234,244,218,${fade*.5})`;c.lineWidth=.8;c.beginPath();c.ellipse(x+9+roll,y+1,5*fade,2.3,.2,-1.8,1.2);c.stroke();}
   for(let j=0;j<3;j++){c.strokeStyle=`rgba(204,227,203,${.22-j*.05})`;c.lineWidth=1;c.beginPath();for(let y=top+len*.08;y<bottom-len*.08;y+=2){const x=crest(y)+spread(y)*(.25+j*.22);y===top+len*.08?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}}

  c.restore();}}
 fish(c,x,y,t,success,dir=1){c.save();c.translate(x,y);c.scale(dir,1);c.rotate(Math.sin(t*3)*.13);this.sprite(c,'prop-marlin',0,0,102);c.restore();if(success)for(let i=0;i<5;i++)oval(c,x-30+i*15,y+15+Math.sin(t*3+i)*3,3,1,'#f4fbeb');}
 fishing(c,s,gam){const t=s.time;
  for(let i=0;i<8;i++){const xx=90+i*28;line(c,xx,165+Math.sin(t*2+i)*8,xx+15,165+Math.sin(t*2+i)*8,'#d6e6da70',1);}
  this.cast(c,'fisherman',s);
  if(s.solved){const u=clamp(s.solvedAge/1.1);if(u<1)this.fish(c,195-100*u,205+60*u-Math.sin(u*Math.PI)*48,t,false);else this.sprite(c,'prop-marlin',95,269,67);return;}
  const amount=s.reelGauge/FISHING.taps,fx=195+Math.sin(t*4)*12*(1-amount),fy=170+amount*34;
  this.fish(c,fx,fy,t,false,1);
  const pull=Math.max(0,1-s.pullAge/.2),p=gam.local,near=gam.room===2&&Math.hypot(p.x-195,p.y-282)<100,rx=near?p.x+11:176,ry=near?p.y-28:255;
  line(c,rx,ry,219-pull*13,198-pull*20,'#896345',3);line(c,rx,ry,219-pull*13,198-pull*20,'#d6b982',.8);
  c.strokeStyle='#ece5cd';c.lineWidth=1.2;c.beginPath();c.moveTo(219-pull*13,198-pull*20);c.quadraticCurveTo(fx+17,s.hooked?181:212,fx,fy);c.stroke();
  this.ring(c,195,282,t,35);box(c,109,321,172,57,'#fff4ddf5',7);
  text(c,s.hooked?'물었어요! 빠르게 연타!':'찌를 바라봐요',195,336,13,s.hooked?'#34774e':'#986139');
  text(c,s.hooked?'당겨 버튼을 연속으로 눌러요':'곧 물고기가 물어요',195,352,9,'#697864');
  box(c,123,365,144,8,'#d8d4be',4);if(amount>0){const gr=c.createLinearGradient(123,0,267,0);gr.addColorStop(0,'#7aaf82');gr.addColorStop(1,'#e8c66f');box(c,123,365,144*amount,8,gr,4);}
  text(c,Math.round(amount*100)+'%',195,391,11,'#3c6e60');
 }
 anne(c,s){const im=this.images['anne-v58'],frame=s.solved?(s.solvedAge<.5?1:s.solvedAge<1?2:3):0,size=72;
  this.depth(c,CAST.anne.y,()=>{shadow(c,268,236,18);c.drawImage(im,frame*(im.width/4),0,im.width/4,im.height,232,236-size*478/512,size,size);});
  if(!s.solved&&!s.sewing){this.ring(c,SEWING.point.x,SEWING.point.y,s.time,24);text(c,'재봉',SEWING.point.x,SEWING.point.y+22,10,'#537369');}
  if(!s.sewing||s.sewApproach<.35)return;
  // The moving cloth meets the seated explorer's hands at the low desktop.
  box(c,125,154,14,10,'#f4e8c9',1);for(let j=0;j<3;j++)line(c,127+j*4,155,127+j*4,164,'#ceba92',.5);line(c,131,145,131,153+Math.sin(s.sewTime*24)*1.1,'#cbd3cc',1);
  // A close view of the flowing fabric, while the explorer works at the machine.
  box(c,65,289,260,166,'#785744',10);box(c,71,295,248,154,'#d7a982',7);
  c.save();c.beginPath();c.roundRect(79,302,232,138,5);c.clip();
  const linen=c.createLinearGradient(79,0,311,0);linen.addColorStop(0,'#cead84');linen.addColorStop(.2,'#f0dfbc');linen.addColorStop(.7,'#efe0c4');linen.addColorStop(1,'#c3a17f');c.fillStyle=linen;c.fillRect(79,302,232,138);
  for(let x=82;x<311;x+=5)line(c,x,302,x,440,'#9d825d10',.7);
  const y0=399,rate=30;
  for(let j=-4;j<24;j++){const phase=s.sewTime+j*.12,y=y0-j*.12*rate,x=seamX(phase);if(phase<0||phase>SEWING.seconds)continue;line(c,x,y,x+1,y+2,j<=0?'#526f5b':'#ad8243',j<=0?2.1:1.2);}
  const target=seamX(s.sewTime),good=Math.abs(s.needle-target)<=SEWING.tolerance;
  c.strokeStyle='#c7a15f88';c.lineWidth=SEWING.tolerance*2;c.beginPath();for(let j=0;j<=28;j++){const t=s.sewTime+j*.1,x=seamX(t),y=y0-j*.1*rate;j?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  const ny=399-(good?Math.sin(s.time*27)*3:0);line(c,s.needle,318,s.needle,ny-3,'#58696b',3);line(c,s.needle-.7,321,s.needle-.7,ny-9,'#e9efdf',.8);poly(c,[[s.needle-2,ny-5],[s.needle,ny+2],[s.needle+2,ny-5]],'#56686a');
  oval(c,s.needle,399,5,3,good?'#529375':'#b57551');line(c,s.needle-9,405,s.needle+9,405,'#607a76',3);c.restore();
  text(c,'←  봉제선에 바늘을 맞춰요  →',195,278,11,'#446b62');
  box(c,93,461,204,5,'#c6b395',2);box(c,93,461,204*clamp(s.sewTime/SEWING.seconds),5,'#6c9d82',2);
 }

 thanks(c,x,y,label){c.save();c.font='700 10px sans-serif';const w=c.measureText(label).width+18,cx=Math.max(w/2+7,Math.min(383-w/2,x));box(c,cx-w/2,y-12,w,25,'#fff5dfef',7);poly(c,[[x-4,y+12],[x+3,y+12],[x,y+18]],'#fff5dfef');text(c,label,cx,y+1,10,'#4c6e5d');c.restore();}
 walkSprite(c,key,x,y,size,dir,frame){const im=this.images[key],cell=im.width/4;c.save();c.translate(x,y);if(dir<0)c.scale(-1,1);c.drawImage(im,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,-size/2,-size*470/512,size,size);c.restore();}
 suitcase(c,x,y,k=1){shadow(c,x,y,18*k);this.sprite(c,'prop-suitcase',x,y,43*k,true);}
 expedition(c,s){
  elephantObstacles.forEach((o,k)=>{shadow(c,o.x,o.y,o.rx*.85);this.sprite(c,['prop-log-v55','prop-mud-v55','prop-rock-v55'][k],o.x,o.y,o.rx*2);});
  if(!s.mounted)this.depth(c,s.park?.y??elephantStart.y,()=>this.elephant(c,s.park?.x??elephantStart.x,s.park?.y??elephantStart.y,'up',0,false));
  if(!s.solved&&!s.mounted){this.ring(c,elephantStart.x,elephantStart.y,s.time,27);text(c,'탑승',elephantStart.x,elephantStart.y+23,10,'#536d5c');}
 }
 elephant(c,x,y,dir,t,moving){const im=this.images['elephant-walk-v57'],frame=moving?[0,1,3,5][Math.floor(t*4)%4]:1,size=120;shadow(c,x,y+2,31);c.drawImage(im,frame%4*512,Math.floor(frame/4)*512,512,512,x-size/2,y-size*470/512,size,size);}
 nautilus(c,s){
  // The squid approaches outside the existing brass-framed portholes.
  for(let k=0;k<2;k++){const h=this.armPose(s,k),x=k?350:40;
   c.save();c.beginPath();c.ellipse(x,k?75:78,32,53,0,0,TAU);c.clip();
   c.globalAlpha=s.flags.has(k)?.12:.25+.55*(h.present?Math.min(1,(h.phase+.5)/1.4):.25);
   const size=80+(h.present?Math.min(1,h.phase/1.4)*24:0);this.sprite(c,'squid-window-v57',x+(k?-8:8),82,size);c.fillStyle='#17778735';c.fillRect(x-36,20,72,120);c.restore();
   if(h.present){
    c.save();c.strokeStyle=h.warning?'#1b3e4045':'#193c4260';c.lineCap='round';c.lineJoin='round';
    for(let j=22;j<h.ground.length-1&&j/40<h.reach;j++){const a=h.ground[j],b=h.ground[j+1];c.lineWidth=12+28*(1-a.u);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}c.restore();
    if(h.warning){for(let j=0;j<4;j++)oval(c,x+(j-1.5)*10,130+Math.sin(s.time*6+j)*4,2,4,'#bde2d7a0');}
   }
  }
  valvePoints.forEach((p,k)=>{const done=s.flags.has(k),job=s.job?.k===k?s.job:null;this.depth(c,p.y,()=>this.valve(c,p.x,p.y,done,job?s.time*12:0));if(!done){const w=valveWorkPoint(k);this.ring(c,w.x,w.y,s.time,17);}if(job){box(c,p.x-25,p.y+12,50,7,'#e5d9bb',2);box(c,p.x-25,p.y+12,50*clamp(job.age/VALVE_SECONDS),7,'#75a68a',2);}});
  oval(c,195,203,28,12,s.solved?'#203f48':'#879e8c');c.strokeStyle='#d1bb84';c.lineWidth=4;c.stroke();if(s.progress===2&&!s.solved){this.ring(c,195,205,s.time,31);text(c,'열기',195,180,10,'#f4e8c1');}
 }
 armPose(s,k){const r=s.retiringArms[k];if(!r)return s.solved?{...tentaclePose(s.armTime[k],k),present:false}:tentaclePose(s.armTime[k],k);const u=clamp((s.time-r.started)/.95),v=1-u*u*(3-2*u),p=r.pose;return {...p,present:p.present&&u<1,active:false,warning:false,reach:p.reach*v,points:p.points.map(a=>({...a,x:p.root.x+(a.x-p.root.x)*v,y:p.root.y+(a.y-p.root.y)*v-18*Math.sin(u*Math.PI)*a.u}))};}
 tentacles(c,s){for(let k=0;k<2;k++){const h=this.armPose(s,k);if(!h.present||h.reach<.015)continue;
   this.ribbon(c,this.images['tentacle-strip-v57'],h.points,60,h.reach);
   if(h.active){const p=valvePoints[k];for(let j=0;j<7;j++){const a=j*TAU/7;oval(c,p.x+Math.cos(a)*28,p.y+12+Math.sin(a)*12,2,1,'#d5e7cb9a');}}
  }}
 ribbon(c,im,points,height,reach=1){
  const q=points.filter((p,j)=>j%2===0),edge=q.map((p,j)=>{const a=q[Math.max(0,j-1)],b=q[Math.min(q.length-1,j+1)],d=Math.hypot(b.x-a.x,b.y-a.y)||1,nx=-(b.y-a.y)/d*height/2,ny=(b.x-a.x)/d*height/2;return [{x:p.x+nx,y:p.y+ny},{x:p.x-nx,y:p.y-ny}];});
  for(let i=0;i<q.length-1;i++){const u=(1-reach+q[i].u*reach)*im.width,v=(1-reach+q[i+1].u*reach)*im.width;this.imageTriangle(c,im,[[u,0],[v,0],[v,im.height]],[edge[i][0],edge[i+1][0],edge[i+1][1]]);this.imageTriangle(c,im,[[u,0],[v,im.height],[u,im.height]],[edge[i][0],edge[i+1][1],edge[i][1]]);}
 }
 imageTriangle(c,im,s,d){const [a,b,e]=s,[p,q,r]=d,det=(b[0]-a[0])*(e[1]-a[1])-(e[0]-a[0])*(b[1]-a[1]);if(Math.abs(det)<.001)return;const A=((q.x-p.x)*(e[1]-a[1])-(r.x-p.x)*(b[1]-a[1]))/det,B=((q.y-p.y)*(e[1]-a[1])-(r.y-p.y)*(b[1]-a[1]))/det,C=((r.x-p.x)*(b[0]-a[0])-(q.x-p.x)*(e[0]-a[0]))/det,D=((r.y-p.y)*(b[0]-a[0])-(q.y-p.y)*(e[0]-a[0]))/det;
  c.save();c.beginPath();const cx=(p.x+q.x+r.x)/3,cy=(p.y+q.y+r.y)/3;for(let j=0;j<3;j++){const v=d[j],dx=v.x-cx,dy=v.y-cy,n=Math.hypot(dx,dy)||1;const x=v.x+dx/n*.35,y=v.y+dy/n*.35;j?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.clip();c.transform(A,B,C,D,p.x-A*a[0]-C*a[1],p.y-B*a[0]-D*a[1]);c.drawImage(im,0,0);c.restore();
 }
 valve(c,x,y,done,t){shadow(c,x,y,28);this.sprite(c,'prop-valve',x,y,72,true);const wx=x+21.8,wy=y-23;if(t){c.save();c.strokeStyle='#ffe3a3';c.lineWidth=1.8;c.beginPath();c.ellipse(wx,wy,13,17,0,t,t+Math.PI*.8);c.stroke();c.restore();}oval(c,x-4,y-55,2.8,2.8,done?'#b9dfaa':'#efd09b');}
 ropes(c,s){ropePoints.forEach((p,k)=>{const cut=s.flags.has(k),job=s.job?.k===k?s.job:null,u=job?clamp(job.age/1.6):0,age=cut?s.time-s.unboundAt[k]:0;
  shadow(c,p.x,p.y,13);box(c,p.x-5,p.y-17,10,18,'#8d693f',2);box(c,p.x-3,p.y-17,3,16,'#bf9c68',1);oval(c,p.x,p.y-17,5,2,'#d0b180');
  c.save();c.lineCap='round';c.lineWidth=2.5;c.strokeStyle='#ad8d57';
  if(!cut){c.beginPath();c.moveTo(p.x,p.y-8);c.bezierCurveTo(p.x+20*u,p.y-40+20*u,180,148,195,115);c.stroke();c.lineWidth=.8;c.strokeStyle='#f0d29a';c.stroke();
   for(let j=0;j<3;j++){c.beginPath();c.ellipse(p.x+u*8,p.y-11+j*3,8+u*8,2+u*2,0,0,TAU*(1-u*.9));c.strokeStyle='#d9bd80';c.lineWidth=2;c.stroke();}
   if(job){const f=Math.sin(job.age*12);line(c,p.x+5,p.y-5,p.x+19+f*3,p.y-8,'#d1b27c',2);}
   const w=ropeWorkPoint(k);if(!job)this.ring(c,w.x,w.y,s.time,13);
  }else{
   if(age<.65){c.globalAlpha=1-age/.65;c.beginPath();c.moveTo(p.x+age*90,p.y-10-age*190);c.quadraticCurveTo(182,146,195,115);c.stroke();c.globalAlpha=1;}
   for(let j=0;j<3;j++){c.beginPath();c.ellipse(p.x-12,p.y+7,10-j*2,4-j*.7,-.15,0,TAU);c.strokeStyle='#c9aa70';c.lineWidth=2;c.stroke();}line(c,p.x-5,p.y+10,p.x+8,p.y+14,'#c9aa70',2);
  }c.restore();if(job){box(c,p.x-20,p.y+27,40,5,'#e4d7b5',2);box(c,p.x-20,p.y+27,40*u,5,'#719c85',2);}
  if(!s.solved)for(const h of patrolMembers(s.time,k))this.depth(c,h.y,()=>{shadow(c,h.x,h.y,7);this.walkSprite(c,'soldier-walk-v58',h.x,h.y,44,h.dir,h.moving?Math.floor(s.time*5+h.j)%4:4);});
 });}
 cart(c,x,y,t,k){shadow(c,x,y+2,27*k);this.sprite(c,'prop-cart',x,y+Math.sin(t*9)*.35,59*k,true);}
 chest(c,s){const x=195,y=211;this.depth(c,y+3,()=>{shadow(c,x,y+4,34);this.sprite(c,s.solved?'prop-chest-open':'prop-chest',x,y+3,72,true);});if(s.solved)return;
  this.depth(c,Infinity,()=>this.lockDial(c,s,x,112));this.progress(c,x,y+13,s.progress,3);
 }
 lockDial(c,s,x,y){const l=lockAt(s.time,s.progress);c.save();shadow(c,x,y+29,27);oval(c,x,y,29,29,'#b49659');oval(c,x,y,27,27,'#f1e3bf');oval(c,x,y,24,24,'#526e65');
  for(let k=0;k<12;k++){const a=k*TAU/12;line(c,x+Math.cos(a)*19,y+Math.sin(a)*19,x+Math.cos(a)*21,y+Math.sin(a)*21,'#c3cbb1',.8);}
  c.strokeStyle=l.good?'#ffe67b':'#e5be63';c.lineWidth=6;c.beginPath();c.arc(x,y,20,l.target-.58,l.target+.58);c.stroke();
  line(c,x-Math.cos(l.angle)*5,y-Math.sin(l.angle)*5,x+Math.cos(l.angle)*21,y+Math.sin(l.angle)*21,l.good?'#fff6bf':'#fff4dd',2.4);oval(c,x,y,3,3,'#e5c275');c.restore();
 }
 footprint(c,x,y,correct,done,t=0){c.save();c.translate(x,y);c.rotate(-.13);const col=done?'#93b298':'#576c68';oval(c,0,-5,8,12,col);box(c,-5,9,10,7,col,2);line(c,-5,1,5,1,'#cfceb2',.8);if(correct)poly(c,[[0,-10],[4,-5],[0,0],[-4,-5]],'#fff0c1');else if(Math.floor(x)%2)oval(c,0,-5,2.8,2.8,'#eee1b3');else line(c,-3,-5,3,-5,'#eee1b3',2);if(done){line(c,13,3,17,7,'#58866b',2);line(c,17,7,23,-3,'#58866b',2);}c.restore();}
 holmes(c,g,s){this.depth(c,176,()=>{box(c,173,149,44,27,'#ab895e',3);box(c,177,155,36,17,s.solved?'#605943':'#d0b37b',2);oval(c,195,162,2,2,'#7e7756');});if(s.progress===3&&!s.solved)this.ring(c,195,177,s.time,26);this.cast(c,'holmes',s);box(c,285,64,57,61,'#f1e6cbe8',5);this.footprint(c,314,89,true,false);text(c,'같은 모양',314,115,8,'#64786c');for(const f of g.footprints()){if(f.row>s.progress)c.globalAlpha=.42;this.footprint(c,f.x,f.y,f.correct,f.done);c.globalAlpha=1;if(f.row===s.progress&&!s.solved)this.ring(c,f.x,f.y+8,s.time,21);}
  if(!s.solved){const x=195+Math.sin(s.time*.92)*116,active=s.time%3.6>1.65;const grad=c.createLinearGradient(x,188,x,400);grad.addColorStop(0,active?'#f4d99180':'#e7c98515');grad.addColorStop(1,'#f6dfb000');poly(c,[[x-6,188],[x+6,188],[x+27,400],[x-27,400]],grad);oval(c,x,187,9,7,active?'#f6deb0':'#c4bb96');line(c,x,175,x,181,'#66746b',3);}
 }
 hazard(c,h,t){
  if(h.type==='tentacleSwipe'){const warning=h.age<h.warn;if(warning){box(c,48,h.y-14,294,28,'#edbc6e30',10);c.save();c.setLineDash([5,5]);line(c,49,h.y,341,h.y,'#e5b367',1.7);c.restore();text(c,'촉수 주의',195,h.y-22,10,'#f7e3b2');}else{const left=h.side>0,x0=left?3:387,x1=left?339:51;c.save();c.lineCap='round';c.strokeStyle='#497b87';c.lineWidth=19;c.beginPath();c.moveTo(x0,h.y-18);c.bezierCurveTo(left?110:280,h.y-36,left?240:150,h.y+19,x1,h.y);c.stroke();c.strokeStyle='#92b9ae';c.lineWidth=8;c.stroke();for(let x=65;x<330;x+=24)oval(c,x,h.y+Math.sin(x/100)*8,3,2,'#cfdfbe');c.restore();}return;}
  const warning=h.age<h.warn,u=clamp(h.age/h.warn);if(warning){c.save();c.globalAlpha=.3+u*.5;c.strokeStyle='#b47558';c.lineWidth=1.3;c.setLineDash([3,3]);c.beginPath();c.ellipse(h.x,h.y,h.r+8, (h.type==='barrel'?15:h.r+8)*.6,0,0,TAU);c.stroke();c.setLineDash([]);oval(c,h.x,h.y,h.r+4,(h.r+4)*.6,'#d3906248');c.restore();if(h.type==='barrel')text(c,'↓',h.x,h.y,16,'#a56c45');if(h.type==='meteor'&&u>.4)this.sprite(c,'prop-meteor',h.x,h.y-12-(1-u)*115,27+u*13);return;}
  const age=h.age-h.warn;if(h.type==='meteor'){c.save();c.translate(h.x,h.y-12);c.rotate(age*.8);this.sprite(c,'prop-meteor',0,0,40);c.restore();}
  else if(h.type==='shark'){const jump=Math.sin(age/.45*Math.PI)*25;shadow(c,h.x,282,27);c.save();c.translate(h.x,263-jump);poly(c,[[-21,11],[-14,-13],[5,-27],[19,-8],[22,11]],'#739da6');c.beginPath();c.moveTo(-15,4);c.quadraticCurveTo(0,-8,17,4);c.lineTo(13,16);c.lineTo(-12,16);c.fillStyle='#516974';c.fill();for(let i=0;i<5;i++)poly(c,[[-10+i*5,4],[-8+i*5,9],[-6+i*5,4]],'#f5f0d3');oval(c,-8,-10,2,2,'#2c505c');oval(c,10,-10,2,2,'#2c505c');c.restore();for(let i=0;i<6;i++)oval(c,h.x-27+i*10,281+Math.sin(i+t*4)*3,3,1,'#e9f0d9');}
  else if(h.type==='tentacle'){const sx=h.x<195?12:378,sy=h.y-75;c.save();c.strokeStyle='#608d91';c.lineWidth=15;c.lineCap='round';c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(sx+(h.x-sx)*.7,sy-40,h.x-20,h.y-33,h.x,h.y);c.stroke();c.strokeStyle='#a7c6b7';c.lineWidth=6;c.stroke();for(let i=0;i<5;i++)oval(c,h.x-(h.x-sx)*i*.06,h.y-i*8,2,2,'#e0d9b0');c.restore();}
  else if(h.type==='barrel'){shadow(c,h.x,h.y,21);const im=this.images['barrel-roll-v58'],frame=Math.floor(Math.max(0,h.y-151)/90*8)%8,size=54;c.drawImage(im,frame%4*512,Math.floor(frame/4)*512,512,512,h.x-size/2,h.y-size*428/512,size,size);}
 }
 room(c,g,i,character){const s=g.scenes[i];c.save();c.translate(0,roomBase(i));c.beginPath();c.rect(0,0,390,500);c.clip();this.layers=[];c.drawImage(this.images['scene-'+i],0,0,390,500);
  // Shared gallery thresholds give the nine distinctive rooms a physical link.
  for(const y of[0,484]){const gr=c.createLinearGradient(0,y,0,y+16);gr.addColorStop(0,'#e8dfc3bb');gr.addColorStop(1,'#e8dfc300');box(c,0,y,390,16,gr,0);}for(const x of[0,247]){box(c,x,488,143,12,'#c3b48c',0);line(c,x,489,x+143,489,'#e9d9b5',1);}
  if(i<8){const exit=EXITS[i];c.save();oval(c,exit.x,exit.y,23,14,'#6d53234d');c.lineCap='round';c.strokeStyle='#6a5427';c.lineWidth=4.5;c.setLineDash([6,4]);c.lineDashOffset=-s.time*8;c.beginPath();c.ellipse(exit.x,exit.y,23,14,0,0,TAU);c.stroke();c.strokeStyle='#ffe447';c.lineWidth=2.8;c.stroke();c.setLineDash([]);poly(c,[[exit.x-7,exit.y+3],[exit.x,exit.y-5],[exit.x+7,exit.y+3]],'#ffeb64');c.restore();text(c,'다음',exit.x,exit.y+24,10,'#466854');}

  switch(i){case 0:{const npc=this.images['npc-prince'],frame=s.solved?1:0;this.depth(c,CAST.prince.y,()=>{shadow(c,238,168,15);c.drawImage(npc,frame*512,0,512,512,209,168-480*58/512,58,58);});if(!s.solved){box(c,177,78,125,25,'#fff5dce8',7);text(c,'장미를 지켜 줄래?',239,91,10,'#526e57');}}if(!s.carrying&&!s.solved){this.depth(c,340,()=>this.glass(c,78,340));this.ring(c,78,344,s.time);}this.depth(c,166,()=>this.rose(c,285,166,s.time,s.solved));if(s.carrying)this.ring(c,285,171,s.time,24);break;case 1:this.crusoe(c,s);break;case 2:this.fishing(c,s,g);break;case 3:this.anne(c,s);break;case 4:this.expedition(c,s);break;case 5:this.nautilus(c,s);break;case 6:this.ropes(c,s);break;case 7:this.chest(c,s);break;case 8:this.holmes(c,g,s);break;}
  for(const h of s.hazards)this.depth(c,h.y,()=>this.hazard(c,h,s.time));
  // The lock is on the chest's front-right face, above its lowest left foot.
  // Working at that face must render in front even though the knees are higher.
  if(g.room===i&&character){const frontOfChest=i===7&&g.local.x>=219&&g.local.y>=207;this.depth(c,frontOfChest?Math.max(215,g.local.y):g.local.y,()=>{c.translate(0,-roomBase(i));this.hero(c,g,character);});}
  const layers=this.layers;this.layers=null;layers.sort((a,b)=>a.y-b.y);for(const layer of layers)layer.paint();
  if(i===1&&!s.solved)this.target(c,raftPoint.x,raftPoint.y,s.time,'나무 전달');
  if(i===5)this.tentacles(c,s);
  if(s.solved){const thanks={0:[239,99,'장미를 지켜 줘서 고마워!'],1:[272,346,'뗏목을 도와줘서 고마워!'],2:[80,169,'같이 잡아 줘서 고맙구나!'],3:[266,149,'이런 소매를 꿈꿨어. 고마워!'],6:[142,62,'자유롭게 해 줘서 고마워!'],8:[85,102,'단서를 찾아 줘서 고맙네!']}[i];if(thanks)this.thanks(c,...thanks);}
  if(i>0){const p=BACK_PORTAL;c.save();c.strokeStyle='#e5b84d';c.lineWidth=2;c.setLineDash([5,4]);c.lineDashOffset=s.time*7;c.beginPath();c.ellipse(p.x,p.y,23,11,0,0,TAU);c.stroke();c.setLineDash([]);poly(c,[[p.x-6,p.y-3],[p.x,p.y+4],[p.x+6,p.y-3]],'#e8c766');text(c,'이전',p.x+38,p.y,10,'#486d68');c.restore();}
  if(s.card&&!hasSource(g,i+1))this.card(c,s.card.id,s.card.x,s.card.y-roomBase(i),g.elapsed,true);
  c.restore();
 }
 hero(c,g,character){const p=g.player;
  if((g.room===3&&g.scene.sewing&&g.scene.sewApproach>=.35)||(g.room===7&&g.scene.lockWork?.age>=.3)){const sewing=g.room===3,contact=sewing?SEWING.contact:LOCK_WORK.contact,age=sewing?g.scene.sewTime:g.scene.lockWork.age-.3;shadow(c,p.x,p.y,14);drawLiteratureWork(c,this.images['work-v68'],character.id,sewing?'sew':'lock',age,{x:contact.x,y:roomBase(g.room)+contact.y},sewing?p:undefined);return;}
  if(g.room===4&&g.scene.mounted){const park=g.motion?g.scene.park:null;this.elephant(c,park?.x??p.x,park?roomBase(4)+park.y:p.y,'up',p.walk,!park&&p.moving);if(g.motion){const u=clamp(g.motion.age/.62);drawExplorer(c,this.images,character,{...p,y:p.y-58*(1-u),dir:'left',moving:false},.85);return;}c.save();c.beginPath();c.rect(p.x-21,p.y-112,42,36);c.clip();drawExplorer(c,this.images,character,{...p,dir:'up',y:p.y-58,moving:false},.85);c.restore();return;}
  if(g.room===6&&g.scene.job){const job=g.scene.job,frame=Math.min(3,Math.floor(job.age/.4)),row=['haru','doyun','narin','soi'].indexOf(character.id),size=56;shadow(c,p.x-3,p.y,15);c.drawImage(this.images['untie-v57'],frame*256,Math.max(0,row)*256,256,256,p.x-size*176/256,p.y-size*238/256,size,size);return;}
  c.save();shadow(c,p.x,p.y,14);if(g.invincibleLeft>0)c.globalAlpha=.65+.35*Math.abs(Math.sin(g.elapsed*14));
  const busy=g.scene.carrying||g.actionAge<.38,row=p.dir==='up'?1:['left','right'].includes(p.dir)?2:0;
  if(busy){const col=g.actionAge<.38?Math.min(3,Math.floor(g.actionAge/.095)):0;c.save();c.translate(p.x,p.y);if(p.dir==='left')c.scale(-1,1);drawCarryCell(c,this.images[character.id+'-walk.webp'],this.images.carry,{row,frame:col,walking:p.moving,walk:p.walk});c.restore();}else drawExplorer(c,this.images,character,p);
  if(g.scene.carrying){if(g.room===0)this.glass(c,p.x+(row===2?(p.dir==='left'?-14:14):0),p.y-18,.62);else if(g.room===1)this.sprite(c,'prop-log-v55',p.x+(row===2?(p.dir==='left'?-12:12):0),p.y-17,43,true);else this.suitcase(c,p.x+(row===2?(p.dir==='left'?-13:13):0),p.y-10,.7);}
  c.restore();if(g.stunLeft>0)for(let i=0;i<3;i++){const a=g.elapsed*5+i*TAU/3;poly(c,[[p.x+Math.cos(a)*15,p.y-55+Math.sin(a)*4-3],[p.x+Math.cos(a)*15+2,p.y-55+Math.sin(a)*4],[p.x+Math.cos(a)*15,p.y-55+Math.sin(a)*4+3],[p.x+Math.cos(a)*15-2,p.y-55+Math.sin(a)*4]],'#e7c275');}
 }
 entrance(c){const im=this.images['npc-prince'],sw=354,sh=474,k=208/sh;c.drawImage(im,94,17,sw,sh,(260-sw*k)/2,12,sw*k,sh*k);}
 briefing(c,character,t){c.save();this.rose(c,133,89,t,t%4>2.2);const x=t%4<2.2?50+Math.min(1,t%4/1.8)*54:104;const fake={player:{x,y:106,dir:'right',moving:t%4<1.8,walk:t,hammerAge:99},scene:{carrying:t%4<2.2},room:0,actionAge:99,invincibleLeft:0,stunLeft:0,elapsed:t};this.hero(c,fake,character);c.restore();}
 draw(g,character){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);if(!g)return;c.save();c.translate(0,170);c.beginPath();c.rect(0,0,390,500);c.clip();c.fillStyle='#e6dec7';c.fillRect(0,0,390,500);c.save();c.translate(0,-g.camera.y);
  for(let i=0;i<9;i++)if(roomBase(i)+500>=g.camera.y&&roomBase(i)<=g.camera.y+500)this.room(c,g,i,character);
  for(const e of g.effects){c.save();c.globalAlpha=clamp(1-e.age);if(e.type==='card')this.card(c,e.id,e.x,e.y-e.age*35,g.elapsed);else{c.strokeStyle=e.type==='recover'?'#b9e2c6':'#f3d795';c.lineWidth=e.type==='recover'?2:1;c.beginPath();c.ellipse(e.x,e.y-20,12+e.age*35,8+e.age*24,0,0,TAU);c.stroke();}c.restore();}c.restore();
  box(c,10,9,171,45,'#fff6e5ed',8);c.strokeStyle='#d1c09b';c.lineWidth=.7;c.stroke();text(c,BOOKS[g.room].name,20,25,11.5,'#365b58','left');text(c,BOOKS[g.room].author,20,42,8.5,'#879084','left');
  c.restore();
 }
}
