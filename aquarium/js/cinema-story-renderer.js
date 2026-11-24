// Native pixel props are independent from the complete authored human figures.
// Every irreversible story event reads the clamped shot time.
import {drawCinema178} from './cinema-story178.js?v178';
import {GHOST_MUZZLES178,KINGSMAN_SHIELD_EDGES178} from './asset-performance178.js?v178';
const source=frame=>{const n=frame+1;return[n%3*320,Math.floor(n/3)*180,320,180]};
const layer=(c,im,frame=0,x=0,y=0)=>{const k=(im.width||960)/960;c.drawImage(im,...source(frame).map(v=>v*k),x,y,320,180)};
const actor=(c,e,p)=>{if(e.performance){const im=e.performance,w=im.width/4,h=im.height/4,n=p.performanceIndex;c.drawImage(im,n%4*w,Math.floor(n/4)*h,w,h,0,0,320,180)}else layer(c,e.actor,p.frame)};
const prop=(c,im,x=0,y=0)=>c.drawImage(im,0,0,im.width||320,im.height||180,x,y,320,180);
const line=(c,x1,y1,x2,y2,color,width=1)=>{c.fillStyle=color;const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)));for(let i=0;i<=n;i++){const p=i/n;c.fillRect(Math.round(x1+(x2-x1)*p),Math.round(y1+(y2-y1)*p),width,width)}};
function spark(c,x,y,time,color='#ffdda2',size=9){for(let i=0;i<7;i++){const a=i/7*Math.PI*2+time*2,r=size*(.5+.5*Math.sin(time*13+i));line(c,x+Math.cos(a)*2,y+Math.sin(a)*2,x+Math.cos(a)*r,y+Math.sin(a)*r,color)}}
function feather(c,x,y){line(c,x-9,y+3,x+9,y-3,'#cfccc0');for(let i=-7;i<8;i+=2){const dy=-i/3;line(c,x+i,y+dy,x+i+2,y+dy-3,'#fff4dc',2);line(c,x+i,y+dy,x+i-2,y+dy+3,'#f0e6cf',1)}}
export function drawCinemaStory(c,film,p,e,atlas){
 const t=p.time,a=p.extra;
 if(drawCinema178.call(this,c,film,p,e,atlas))return true;
 if(film.id==='panslabyrinth'&&e.monster){
  layer(c,e.monster,a.monsterFrame,a.monsterX-225);prop(c,e.front);layer(c,e.girl,a.girlFrame,a.girlX-118);return true;
 }
 if(film.id==='jurassic'&&e.trexStop){
  // One dinosaur identity throughout the shot; no size change at the lunge.
  const df=t<3.8?Math.floor(t*7)%2:a.dinoFrame;
  layer(c,e.trexStop,df,a.dinoX);
  layer(c,e.runners,a.runnersFrame,a.runnersX);
  // Reuse only the foreground Jeep painting to occlude children taking cover.
  c.drawImage(atlas,0,75,40,88,0,75,40,88);return true;
 }
 if(film.id==='jaws'&&e.shark){
  layer(c,e.fisher,p.frame);
  if(t>.9&&t<2.3){const x=285-(t-.9)*29;c.fillStyle='#526771';for(let row=0;row<9;row++)c.fillRect(Math.round(x-row*.6),146+row,1+row,1)}
  if(a.sharkVisible){c.save();c.beginPath();c.rect(0,0,320,151);c.clip();prop(c,e.shark,a.sharkX,a.sharkY);c.restore()}
  return true;
 }
 if(film.id==='matrix'&&(e.actor||e.performance)){
  actor(c,e,p);
  for(const b of a.bullets)if(b.active){line(c,b.x,b.y,b.x+19,b.y,'#c68a46');line(c,b.x,b.y,b.x+6,b.y,'#ffe9a0',2);c.fillStyle='#fff7d6';c.fillRect(Math.round(b.x),Math.round(b.y),3,2)}return true;
 }
 if(film.id==='backfuture'&&(e.car||e.carHD)){
  actor(c,e,p);
  if(a.jumped){const end=274;c.fillStyle='#a75326';for(let x=141;x<end;x+=4){for(const y of [164,170]){const h=3+Math.floor((Math.sin(x*1.7+t*18)+1)*4);for(let row=0;row<h;row++){const taper=row/h,lean=Math.round(Math.sin(x+t*8)*taper*2);c.fillStyle=taper>.5?'#e6742a':'#f9ad3f';c.fillRect(x+lean,y-row,Math.max(1,Math.round(4*(1-taper))),1)}c.fillStyle='#ffe6a1';c.fillRect(x,y-2,2,2);}}}
  if(a.carVisible){prop(c,e.carHD||e.car,a.carX);if(t>=3.4)spark(c,191+a.carX,131,t,'#b7dfff',7+6*Math.min(1,(t-3.4)/2))}
  if(a.flash){spark(c,a.flashX,145,t,'#a9d9ff',38*a.flash);spark(c,a.flashX,145,t+.2,'#fffaf0',20*a.flash)}
  if(a.jumped){c.fillStyle='#a7c0cb66';for(let i=0;i<9;i++)c.fillRect(178+i*11+Math.sin(t+i)*3,159-(t-5.4)*8-i%3*3,5,2)}return true;
 }
 if(film.id==='ghostbusters'&&e.ghost){
  prop(c,a.sealed?e.trapClosed:e.trapOpen);actor(c,e,p);
  if(a.beam){const end=a.ghost,start=GHOST_MUZZLES178[p.performanceIndex];for(let i=0;i<75;i++){const k=i/74,x=start[0]+(end[0]-start[0])*k,y=start[1]+(end[1]-start[1])*k+Math.sin(k*38-t*17)*2;c.fillStyle=i%3?'#e4a9fa':'#fff6d0';c.fillRect(Math.round(x),Math.round(y),2,2)}}
  if(a.ghostVisible){c.save();c.translate(...a.ghost);c.scale(Math.max(.02,a.ghostScale),Math.max(.02,a.ghostScale));c.translate(-203,-123);prop(c,e.ghost);c.restore()}
  if(a.sealed){for(let y=155;y<167;y++){c.fillStyle=y%3?'#687775':'#84928c';c.fillRect(188-Math.floor((y-155)*.7),y,42,1)}c.fillStyle='#91d46a';c.fillRect(206,160,2,1);for(let i=0;i<5;i++){const y=158-(t-6.35)*8-i*3;c.fillStyle='#b7c6a155';c.fillRect(201+i*3,y,4,2)}}return true;
 }
 if(film.id==='indiana'&&e.escape){
  if(a.escaping){prop(c,e.sandbag);layer(c,e.escape,p.frame,a.escapeX-122)}else layer(c,atlas,p.frame);
  if(t>3.2){for(let i=0;i<13;i++){const fall=(t-3.2)*23-i*6;if(fall>0&&fall<153){c.fillStyle=i%2?'#a27c50':'#6c5741';c.fillRect(158+i*11,fall,2+i%3,3)}}}
return true;
 }
 if(film.id==='mission'&&e.actor){
  line(c,158,0,158+a.side,97+a.drop,'#d4cdc0',2);layer(c,e.actor,p.frame,a.side,a.drop);
  if(t>=3.65){c.fillStyle='#143b42';c.fillRect(208,109,15,3);c.fillStyle=a.copied?'#99e6ad':'#58bbd6';c.fillRect(208,109,Math.round(15*a.copyProgress),2)}return true;
 }
 if(film.id==='harrypotter'&&e.actor){layer(c,e.actor,p.frame);feather(c,...a.feather);if(t>=1.45&&t<3.1){const tip=[null,[146.333,97.667],[147.667,102.667],[147.667,103],[147,104],[147.667,101.5],[147.667,102.333],null][p.frame];if(tip)spark(c,tip[0],tip[1],t,'#efe2a7',5)};return true;}
 if(film.id==='kingsman'&&(e.actor||e.performance)){actor(c,e,p);for(const b of a.bullets)if(b.active){const edge=KINGSMAN_SHIELD_EDGES178[p.performanceIndex][Math.round((b.y-120)/6)];if(b.x>edge)line(c,b.x,b.y,b.x+13,b.y,'#ffe3a0',2);else spark(c,edge,b.y,t,'#ffdc75',7)}return true;}
 if(film.id==='jumanji'&&e.actor){
  layer(c,e.actor,p.frame);const q=a.roll;
  for(let i=0;i<2;i++){const x=q?133+q*(35+i*10):127+i*7,y=q?128+q*17-Math.sin(q*Math.PI)*21:132+i*3;c.save();c.translate(x,y);if(q<1)c.rotate(q*Math.PI*5+i);c.fillStyle='#754f2e';c.fillRect(-4,-4,9,9);c.fillStyle='#e0b068';c.fillRect(-3,-3,7,7);c.fillStyle='#70452e';for(let j=0;j<(i?3:5);j++)c.fillRect(-2+j%2*3,-2+Math.floor(j/2)*2,1,1);c.restore()}
  if(t>3.25){const q=Math.min(1,(t-3.25)/1.35);c.fillStyle='#d8b86c';c.fillRect(173+q*11,142-q*3,3,4)}
  if(a.awakening){const h=a.awakening*42;for(let i=0;i<h;i++){const x=173+Math.sin(i*.13)*5;c.fillStyle=i%5?'#47764b':'#91a65b';c.fillRect(Math.round(x),139-i,2,2);if(i%8===0)c.fillRect(Math.round(x)-4,138-i,7,2)}}return true;
 }
 if(film.id==='nightmuseum'&&e.guard){
  const back=-Math.max(0,t-3.4)*3;
  layer(c,e.dino,p.frame,-Math.min(16,Math.max(0,t-2.5)*4));
  layer(c,e.guard,p.frame,back);
  if(t>.85){for(let i=0;i<36;i++){c.fillStyle='#f8e6a008';c.fillRect(97+back+i*2,126-i*.7,2,3+i*.8)}}return true;
 }
 if(film.id==='homealone'&&e.boy){
  layer(c,e.boy,Math.min(p.frame,7));
  if(e.recoil&&a.hit){const f=Math.min(7,Math.floor(a.hitAge*2.8));layer(c,e.recoil,f)}else layer(c,e.people,Math.min(p.frame,3));
  const theta=-1.262+2.142616*Math.min(.962334,a.swing)+(t>5.6?Math.sin((t-5.6)*1.5)*.025:0),x=203+Math.sin(theta)*142,y=5+Math.cos(theta)*142;
  line(c,203,5,x,y-7,'#65563f');c.save();c.translate(x,y);c.rotate(-theta*.2);c.fillStyle='#34454c';c.fillRect(-8,-8,16,17);c.fillStyle='#c3ced0';c.fillRect(-7,-7,14,15);c.fillStyle='#c44733';c.fillRect(-7,-1,14,7);c.fillStyle='#f0e8ca';c.fillRect(-6,-6,12,2);c.restore();return true;
 }
 return false;
}
export {line as cinemaPixelLine,spark as cinemaSpark};
