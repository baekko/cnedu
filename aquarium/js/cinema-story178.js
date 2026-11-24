import {MISSION_ANCHORS178,MISSION_PRESS_DX178,MUSEUM_FLASHLIGHT_ANCHORS178,MARTIAN_ANCHORS178} from './asset-anchor178.js?v178';
// Finite, authored shots. Every action cell is visited at most once per shot.
const seq=(c,im,index,columns,rows,x=0,y=0)=>{const w=im.width/columns,h=im.height/rows;c.drawImage(im,index%columns*w,Math.floor(index/columns)*h,w,h,x,y,320,180)};
const image=(c,im,x,y,w,h)=>c.drawImage(im,0,0,im.width,im.height,x,y,w,h);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const line=(c,a,b,color,width=.7)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke()};
function glint(c,x,y,r,alpha=1){c.save();c.globalAlpha=alpha;line(c,[x-r,y],[x+r,y],'#fff5bf',.65);line(c,[x,y-r],[x,y+r],'#fff5bf',.65);c.restore()}
export function drawCinema178(c,film,p,e,atlas){
 const a=p.extra,t=p.time;
 if(film.id==='rocky'&&e.boxerA&&e.boxerB&&e.bag){seq(c,p.performanceIndex<16?e.boxerA:e.boxerB,p.performanceIndex%16,4,4);const b=a.bag;c.save();c.translate(...b.ring);c.rotate(-b.theta);image(c,e.bag,-b.localRing[0],-b.localRing[1],...b.drawSize);c.restore();return true}
 if(e.performanceA&&e.performanceB){seq(c,p.performanceIndex<16?e.performanceA:e.performanceB,p.performanceIndex%16,4,4);return true}
 if(film.id==='cinderella'&&e.run16){seq(c,e.run16,p.performanceIndex,4,4);return true}
 if(film.id==='lalaland'&&e.danceA){seq(c,a.index<16?e.danceA:e.danceB,a.index<16?a.index:a.index-16,4,4);return true}
 if(film.id==='soundmusic'&&e.singing){seq(c,e.singing,a.index,4,4);return true}
 if(film.id==='titanic'&&e.openArms){seq(c,e.openArms,a.index,3,3);return true}
 if(film.id==='mission'&&e.spy){
  const index=a.index,anchor=MISSION_ANCHORS178[index];
  const dy=a.drop+(anchor?.safeY??-10.345123),dx=MISSION_PRESS_DX178;
  const back=anchor.harnessWorld;
  line(c,[158,0],[back[0]+dx,back[1]+dy],'#d2d3cf',.9);
  seq(c,e.spy,index,4,4,dx,dy);
  if(t>2.05){c.fillStyle='#153b43';c.fillRect(210,107,12,2);c.fillStyle=a.copied?'#a0e3a7':'#65bbce';c.fillRect(210,107,12*a.copyProgress,1)}return true;
 }
 if(film.id==='indiana'&&e.runner){
  // Roof y127 and clear x143..170 gap are fixed world geometry.
  
  seq(c,e.runner,a.index,4,4,a.runnerX-160,a.runnerY);
  // A single approaching trackside crossbeam, never respawned.
  const bx=a.beamX;if(bx>-35&&bx<355){c.fillStyle='#343b37';c.fillStyle='#666e65';c.fillRect(bx-25,49,50,5);c.fillStyle='#bec4b6';c.fillRect(bx-25,49,50,.7)}
  return true;
 }
 if(film.id==='interstellar'&&e.rescue){
  const h=e.wave.height/e.wave.width*230;image(c,e.wave,a.waveX,a.waveBottom-h,230,h);
  // Foam moves along the independently advancing wall, not the fixed ship.
  for(let i=0;i<19;i++){const y=101+i*2.2,x=a.waveX+34+i*6+Math.sin(t*1.9+i)*1.5;c.fillStyle='#d4f2f292';c.fillRect(x,y,2.4,.5)}
  seq(c,e.rescue,a.index,4,4,a.groupX,0);return true;
 }
 if(film.id==='jurassic'&&e.help){
  const d=e.trexStop,w=d.width/3,h=d.height/3,n=a.dinoFrame+1;
  c.drawImage(d,n%3*w,Math.floor(n/3)*h,w,h,a.dinoX,a.dinoY,320,180);
  seq(c,e.help,a.index,4,4,a.runnersX,0);return true;
 }
 if(film.id==='martian'&&e.farmer){
  // Working lane stays in front of the valve, later moving toward the nearsoil.
  const progress=clamp((t-3.1)/1.6,0,1),dx=-17.825503+progress*17.825503,dy=-23.804196+progress*26.804196;
  seq(c,e.farmer,a.index,4,4,dx,dy);
  if(a.machineOn){
   // Apparatus tube and outlet are read from the fixed habitat painting.
   for(let i=0;i<6;i++){const q=(t*.8+i/6)%1;c.fillStyle='#d6eef1';c.fillRect(183,128+q*10,.5,1)}
   const q=clamp((t-1.2)/1.2,0,1);c.fillStyle='#9cc8d9';c.fillRect(181.9,136,.7,4*q);
   if(t>2.2){const z=(t*1.9)%1;c.fillStyle='#d6eff4';c.fillRect(183,139+z*5,.7,1)}
  }
  return true;
 }
 if(film.id==='jumanji'&&e.elephant){
  // Low board and both children stay in foreground; elephant uses the rear lane.
  c.fillStyle='#654329';c.beginPath();c.moveTo(104,153);c.lineTo(149,153);c.lineTo(154,161);c.lineTo(99,161);c.closePath();c.fill();c.fillStyle='#779066';c.beginPath();c.moveTo(106,153.7);c.lineTo(148,153.7);c.lineTo(151,159.2);c.lineTo(102,159.2);c.closePath();c.fill();line(c,[127.7,153.8],[127.7,159.3],'#5a4935',.5);for(let q=0;q<14;q++){c.fillStyle=q%2?'#d3be73':'#a7b488';c.fillRect(107+q*2.6,156.6+Math.sin(q*.7)*1.4,.7,.5)}
  const travel=a.diceProgress,dx=-60+travel*28,dy=travel*5-Math.sin(travel*Math.PI)*13;
  if(t>=.35)seq(c,e.dice,a.diceIndex,3,3,dx,dy);
  if(a.elephantVisible)seq(c,e.elephant,a.elephantIndex,3,3,a.elephantX-160,0);
  // Original complete seated figures, now in the near-left working area.
  if(e.friends){seq(c,e.friends,p.performanceIndex,4,4)}else if(e.actor){const f=Math.min(7,p.frame),n=f+1,s=e.actor.width/960;c.drawImage(e.actor,n%3*320*s,Math.floor(n/3)*180*s,320*s,180*s,-42,5,320,180)}
  if(t>3.1)for(let i=0;i<18;i++){const q=clamp((t-3.1-i*.09)/3.9,0,1);if(q>0&&q<1){c.fillStyle='#b7a48a45';c.fillRect(275-i*7-t*4,146-q*9,2.5,1)}}return true;
 }
 if(film.id==='pi'&&e.whale){
  const bob=a.boatBob;
  for(let i=0;i<30;i++){const x=(i*59+t*3)%320,y=122+i%6*8;c.fillStyle=i%3?'#4fcad262':'#8cf5e580';c.fillRect(x,y,1.1,.5)}
  if(a.whaleVisible){c.save();c.beginPath();c.rect(0,0,320,145);c.clip();seq(c,e.whale,a.whaleIndex,3,3,a.whaleX-160,a.whaleY-90);c.restore()}
  const bh=e.boat.height/e.boat.width*149;image(c,e.boat,85,162-bh+bob,149,bh);
  seq(c,e.reaction,a.index,3,3,0,bob);
  // One exact hull foreground occludes hips/legs inside the boat correctly.
  const crop=clamp((140-(162-bh))/bh,0,1);c.drawImage(e.boat,0,e.boat.height*crop,e.boat.width,e.boat.height*(1-crop),85,140+bob,149,bh*(1-crop));
  if(t>4.7){const q=clamp((t-4.7)/3.3,0,1);for(let i=0;i<28;i++){const r=10+q*63,angle=i/28*Math.PI*2;c.fillStyle='#7af1e98c';c.fillRect(76+Math.cos(angle)*r,146+Math.sin(angle)*(2+q*5),2,.7)}}
  return true;
 }
 if(film.id==='lotr'&&e.wizard){
  const fall=a.fall;
  // The demon's supporting feet reach the removable span before it collapses.
  seq(c,e.balrog,a.demonIndex,3,3,a.demonX,fall);
  // Solid abutment faces occlude anything falling BEHIND them.
  if(a.bridgeBroken){const im=e.plate;c.drawImage(im,0,128/180*im.height,128/320*im.width,52/180*im.height,0,128,128,52);c.drawImage(im,186/320*im.width,128/180*im.height,134/320*im.width,52/180*im.height,186,128,134,52)}
  if(!a.bridgeBroken){c.fillStyle='#766c5b';c.fillRect(128,128,58,13);c.fillStyle='#b1a28a';c.fillRect(128,127,58,2);c.fillStyle='#453f38';for(let x=134;x<186;x+=10)c.fillRect(x,130,1,10);if(t>2.45)line(c,[129,128],[164,133],'#211e1c',.8)}
  else if(fall<70){c.fillStyle='#665e52';c.fillRect(128,128+fall,58,11);c.fillStyle='#a4977e';c.fillRect(128,127+fall,58,1.3)}
  seq(c,e.wizard,a.wizardIndex,3,3,-22,0);
  if(a.flash){glint(c,103,128,31*a.flash,a.flash);c.save();c.globalAlpha=a.flash*.11;c.fillStyle='#f4e8c3';c.fillRect(0,0,320,180);c.restore()}
  return true;
 }
 if(film.id==='nightmuseum'&&e.skeleton){
  const light=MUSEUM_FLASHLIGHT_ANCHORS178[p.frame],tip=light.tipWorld,d=light.direction,x=tip[0]+a.guardX,y=tip[1],len=93,width=21;
  if(t>.65){c.save();c.globalAlpha=.22;c.fillStyle='#f2e6b9';c.beginPath();c.moveTo(x,y);c.lineTo(x+d[0]*len-d[1]*width,y+d[1]*len+d[0]*width);c.lineTo(x+d[0]*len+d[1]*width,y+d[1]*len-d[0]*width);c.closePath();c.fill();c.restore()}
  seq(c,e.skeleton,p.frame,3,3,a.dinoX,0);
  const n=p.frame+1,w=e.guard.width/3,h=e.guard.height/3;c.drawImage(e.guard,n%3*w,Math.floor(n/3)*h,w,h,a.guardX,0,320,180);return true;
 }
 if(film.id==='chocolate'&&e.boy){
  // One bank slip, a current to the actual pipe inlet, then upward suction.
  if(a.index>=6&&a.index<=9){c.save();c.beginPath();c.rect(0,0,320,129);c.clip();seq(c,e.boy,a.index,4,4,a.boyX-160,a.boyFoot-128);c.restore()}
  else seq(c,e.boy,a.index,4,4,a.boyX-160,a.boyFoot-128);
  if(a.index>=6&&a.index<=9){for(let i=0;i<12;i++){c.fillStyle=i%2?'#cc793f90':'#f7bd6e9e';c.fillRect(a.boyX-19+i*3,129+Math.sin(i+t*3)*1.2,3,.6)}}
  if(a.inPipe){c.fillStyle='#b8dcf20c';c.fillRect(217,28,39,98);line(c,[219,38],[219,123],'#d8f3ff8a',.7);line(c,[254,32],[254,122],'#eaf6ff77',.6)}
  for(let i=0;i<18;i++){const q=(t*.62+i/18)%1;c.fillStyle='#e8a16b70';c.fillRect(93+i%7*10,56+q*51,.6,2)}
  return true;
 }
 if(e.performance&&!['matrix','backfuture','ghostbusters','kingsman'].includes(film.id)){seq(c,e.performance,p.performanceIndex,film.id==='topgun'?3:4,film.id==='topgun'?3:4);return true}
 return false;
}
