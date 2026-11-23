import { LETTER_FILM_DURATION, drawLetterFilmFrame } from './letter-credits-film.js';
/** Timeline rendering at 768 × 512. Every sprite pose is a single authored frame. */
import {happyPose} from './character-motion.js';
import {drawRabbitOpeningActor} from './rabbit-depth-motion.js?hop=50';
import {LETTER_CREDITS_ASSETS,loadLetterCredits,drawLetterCredits} from './letter-credits.js';
import {PORTAL_CUT,PORTAL_ASSETS,loadPortalAssets,drawPortalFrame} from './portal-scene.js?bridge=2s-v2';
const W=768,H=512;
export const CINEMA_DURATIONS={'rabbit-opening':14.5,'rabbit-portal':PORTAL_CUT+2.7,'rabbit-success':4.6,'rabbit-ending':10,'letter-opening':14,'letter-success':5.5,'letter-ending':15,'credits-rabbit':35,'credits-letter':LETTER_FILM_DURATION};
export const LABELS={'rabbit-opening':'교실 거울 안에서 다가와 인사하고 돌아 뛰어가는 보라토끼','rabbit-portal':'거울 안으로 돌아간 토끼와 책 열매 나무','rabbit-success':'당근을 차례로 내려놓고 떠나는 보라토끼','rabbit-ending':'잠에서 깨어 친구와 다시 만나는 두 아이','letter-opening':'도서관에 걸어와 선생님에게 편지를 건네받는 소녀','letter-success':'기뻐하는 소녀','letter-ending':'창가에서 쓴 편지를 사서 선생님께 맡기고 돌아가는 소녀','credits-rabbit':'책 열매 나무에서 다섯 장소를 돌아 다시 나무로 오는 토끼','credits-letter':'다섯 권의 책 속을 걸어 도서관에서 사서 선생님과 인사하는 소녀'};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*clamp(t);
const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
const ramp=(t,a,b)=>ease((t-a)/(b-a));
const LETTER_LOCATIONS=['villa','creek','study','mailbox','bookshop'];
const letterLocation=index=>'letterLocation'+clamp(index,0,LETTER_LOCATIONS.length-1);
const PATHS={
 happy:'v14/happy.png',classEnding:'v7/classroom-ending-atlas.webp',
 tree:'v2/meadow-pixel-bg.webp',classroom:'v6/classroom-pixel-bg.webp',bridge:'v3/bridge-pixel-bg.webp',
 rabbit:'v2/rabbit-atlas.png',depth:'v7/rabbit-depth-atlas.png',turn:'v7/rabbit-turn-atlas.png',deposit:'v3/rabbit-deposit-atlas.png',carrot:'v3/carrot.png',
 ...Object.fromEntries(Array.from({length:5},(_,i)=>['location'+i,`v2/rabbit-location-${i}.webp`])),
 ...Object.fromEntries(LETTER_LOCATIONS.map((name,index)=>[letterLocation(index),`letter-locations/${name}.webp`]))
};
export const CINEMA_ASSETS=[...Object.values(PATHS).map(p=>'assets/cinema/'+p),...PORTAL_ASSETS,...LETTER_CREDITS_ASSETS];
const bank=new Map(),pending=new Map(),base=new URL('./assets/cinema/',import.meta.url);
let titleFont;
function loadTitleFont(){return titleFont||=(async()=>{const font=new FontFace('RabbitTitle',`url(${new URL('./assets/fonts/jua-rabbit.woff',import.meta.url).href})`);await font.load();document.fonts.add(font)})();}
export function loadCinemaAssets({kind,location=0}={}){
 let names=Object.keys(PATHS);
 if(kind==='letter-opening')names=[];
 else if(kind==='letter-success')names=['happy',letterLocation(location)];
 else if(kind==='letter-ending')names=[];
 else if(kind==='credits-letter')names=[];
 else if(kind==='rabbit-portal')names=['tree','rabbit'];
 else if(kind==='rabbit-success')names=['rabbit','turn','deposit','carrot','location'+clamp(location,0,4)];
 else if(kind==='credits-rabbit')names=['rabbit','turn','tree',...Array.from({length:5},(_,i)=>'location'+i)];
 else if(kind==='rabbit-ending')names=['classEnding'];
 else if(kind)names=['classroom','bridge','tree','rabbit','depth','turn'];
 const extras=[];if(!kind||['letter-opening','letter-ending'].includes(kind))extras.push(loadLetterCredits());if(!kind||kind==='rabbit-portal')extras.push(loadPortalAssets());if(!kind||kind==='rabbit-opening')extras.push(loadTitleFont());
 return Promise.all([...extras,...names.map(name=>{
  if(bank.has(name))return Promise.resolve();if(pending.has(name))return pending.get(name);
  const p=new Promise((resolve,reject)=>{const im=new Image();im.onload=async()=>{try{await im.decode();bank.set(name,im);pending.delete(name);resolve();}catch(error){pending.delete(name);reject(error);}};im.onerror=()=>{pending.delete(name);reject(Error(`장면 그림: ${name}`))};im.src=new URL(PATHS[name],base).href;});pending.set(name,p);return p;
 })]);
}
function background(ctx,name){const im=bank.get(name);if(im)ctx.drawImage(im,0,0,W,H);}
function fullFrame(ctx,name,frame){const im=bank.get(name);if(!im)return;const w=im.width/4,h=im.height/2;ctx.drawImage(im,(frame%4)*w,Math.floor(frame/4)*h,w,h,0,0,W,H);}
function camera(ctx,z=1,x=W/2,y=H/2){x=clamp(x,W/(2*z),W-W/(2*z));y=clamp(y,H/(2*z),H-H/(2*z));ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-x,-y);}
function shadow(ctx,x,y,size=180,air=0){ctx.save();ctx.globalAlpha=.13*Math.max(.45,1-air/100);ctx.fillStyle='#483052';ctx.beginPath();ctx.ellipse(x,y+2,size*.12*Math.max(.6,1-air/90),size*.022,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function sprite(ctx,key,frame,x,y,size=180,{cell=256,cols=4,anchor=[128,246],flip=false,air=0,ground=true}={}){
 const im=bank.get(key);if(!im)return;if(ground)shadow(ctx,x,y,size,air);ctx.save();ctx.translate(x,y-air);if(flip)ctx.scale(-1,1);ctx.drawImage(im,(frame%cols)*cell,Math.floor(frame/cols)*cell,cell,cell,-anchor[0]*size/cell,-anchor[1]*size/cell,size,size);ctx.restore();
}
function fade(ctx,a,color='#fff7e7'){ctx.save();ctx.globalAlpha=clamp(a);ctx.fillStyle=color;ctx.fillRect(0,0,W,H);ctx.restore();}
function cutFade(ctx,t,cuts,width=.18){for(const cut of cuts){if(t>cut-width&&t<cut)fade(ctx,ramp(t,cut-width,cut));else if(t>=cut&&t<cut+width)fade(ctx,1-ramp(t,cut,cut+width));}}
function sparkle(ctx,x,y,a=.6){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#fff6ce';ctx.fillRect(x-2,y,5,1);ctx.fillRect(x,y-2,1,5);ctx.restore();}
function motes(ctx,t){for(let i=0;i<16;i++)sparkle(ctx,30+(i*137.7)%700,35+(i*71.9)%330+Math.sin(t*.6+i)*4,(Math.sin(t*1.25+i*1.7)+1)*.15);}
function title(ctx,text,t,start){const a=ramp(t,start,start+.65);if(a<=0)return;ctx.save();ctx.globalAlpha=a;const g=ctx.createLinearGradient(0,270,0,H);g.addColorStop(0,'#30243d00');g.addColorStop(1,'#30243dba');ctx.fillStyle=g;ctx.fillRect(0,270,W,242);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff8e9';ctx.font='600 42px "Noto Serif KR", serif';ctx.shadowColor='#3b244799';ctx.shadowBlur=6;ctx.fillText(text,W/2,413);ctx.restore();}
function sideHops(ctx,t,start,end,x0,x1,feet=445,size=180){
 const p=clamp((t-start)/(end-start)),phase=(p*Math.abs(x1-x0)/105)%1,moving=p>0&&p<1;
 sprite(ctx,'rabbit',moving?Math.min(7,Math.floor(phase*8)):7,lerp(x0,x1,p),feet,size,{flip:x1<x0,air:moving?Math.sin(phase*Math.PI)*27:0});
}
function depthRabbit(ctx,p,back=false){
 const q=back?1-ease(p):ease(p),y=lerp(174,445,q),size=lerp(16,320,q),phase=(p*7)%1;
 sprite(ctx,'depth',(p>0&&p<1?Math.floor(phase*8):7)+(back?8:0),384,y,size,{air:p>0&&p<1?Math.sin(phase*Math.PI)*size*.105:0});
}
let mirrorCanvas;
function bridgeAction(ctx,t,departOnly=false){
 background(ctx,'bridge');
 const opening=drawRabbitOpeningActor(ctx,t,{depth:bank.get('depth'),turn:bank.get('turn')});
 if(opening.titleAlpha>0){ctx.save();ctx.globalAlpha=opening.titleAlpha;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='100px RabbitTitle, sans-serif';ctx.lineJoin='round';ctx.lineWidth=12;ctx.strokeStyle='#fff9ed';ctx.shadowColor='#7c4fac66';ctx.shadowBlur=8;ctx.strokeText('래빗홀',384,258);ctx.shadowBlur=0;ctx.fillStyle='#b46ab7';ctx.fillText('래빗홀',384,258);ctx.restore();}
}
function classroomMirror(ctx,t,departOnly=false){
 mirrorCanvas ||= Object.assign(document.createElement('canvas'),{width:W,height:H});
 const mirror=mirrorCanvas.getContext('2d');mirror.imageSmoothingEnabled=false;bridgeAction(mirror,t);
 const zoom=1+2.95*ramp(t,.25,2.8);
 ctx.save();camera(ctx,zoom,388,124);background(ctx,'classroom');
 ctx.save();ctx.beginPath();ctx.ellipse(387.5,123.5,36.5,53,0,0,Math.PI*2);ctx.clip();ctx.drawImage(mirrorCanvas,306,69,164,109);ctx.restore();ctx.restore();
}
function happy(ctx,t,location){
 background(ctx,letterLocation(location));
 const {frame,air}=happyPose(t);sprite(ctx,'happy',frame,384,444,260,{anchor:[128,244],air:air*2/3});
}
function carrot(ctx,x,y){const im=bank.get('carrot');if(im)ctx.drawImage(im,x-16,y-16,32,32);}
const PALMS=[[167,171],[181,190],[202,237],[189,217]];
function reward(ctx,t,score,location){
 background(ctx,'location'+clamp(location,0,4));const n=clamp(Math.round(score),0,2),size=190,x=425,feet=445;
 if(t<.25)sprite(ctx,'deposit',0,x,feet,size);
 else if(t<.45)sprite(ctx,'deposit',1,x,feet,size);
 else if(t<.95)sprite(ctx,'deposit',2,x,feet,size);
 else if(t<1.15)sprite(ctx,'deposit',3,x,feet,size);
 else if(t<3.9)sideHops(ctx,t,1.15,3.9,x,865,feet,size);
 const hand=PALMS[t<.25?0:t<.45?1:2],hx=x+(hand[0]-128)*size/256,hy=feet+(hand[1]-246)*size/256;
 for(let i=0;i<n;i++){const release=.52+i*.21,land=release+.13,groundX=x+55+i*34,groundY=440+i*3;if(t<release){if(i===0||t>.52)carrot(ctx,hx,hy);}else if(t<land)carrot(ctx,lerp(hx,groundX,(t-release)/.13),lerp(hy,groundY,(t-release)/.13));else carrot(ctx,groundX,groundY);}
}
function childrenEnding(ctx,t){const frame=t<1?0:t<2?1:t<3.6?2:t<4.8?3:t<6?4:t<7.4?5:t<8.6?6:7;fullFrame(ctx,'classEnding',frame);cutFade(ctx,t,[3.6,7.4]);}
const ROUTE=['tree','location0','location1','location2','location3','location4','tree'];
function rabbitCredits(ctx,t){
 const index=Math.min(6,Math.floor(t/5)),u=t-index*5;background(ctx,ROUTE[index]);
 if(index===6){if(u<3.4)sideHops(ctx,u,0,3.4,-75,474,445,177);else sprite(ctx,'turn',u<4?0:1,474,445,177);}
 else sideHops(ctx,u,.15,4.85,-75,840,445,177);
 motes(ctx,t);cutFade(ctx,t,[5,10,15,20,25,30]);
}
export function drawCinemaFrame(ctx,kind,time,score=2,{location=0}={}){
 if(kind==='credits-letter')return drawLetterFilmFrame(ctx,time);
 const t=clamp(time,0,CINEMA_DURATIONS[kind]||14);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);ctx.fillStyle='#f7efdf';ctx.fillRect(0,0,W,H);
 if(kind==='rabbit-opening')classroomMirror(ctx,t);
 else if(kind==='rabbit-portal'){if(t<PORTAL_CUT)drawPortalFrame(ctx,t);else{background(ctx,'tree');sideHops(ctx,t,PORTAL_CUT,PORTAL_CUT+2.5,130,490,445,177);motes(ctx,t);}cutFade(ctx,t,[PORTAL_CUT],.3);}
 else if(kind==='rabbit-success')reward(ctx,t,score,location);
 else if(kind==='rabbit-ending')childrenEnding(ctx,t);
 else if(kind==='letter-opening'){drawLetterCredits(ctx,t*8/14);title(ctx,'편지왔어요',t,11.5);}
 else if(kind==='letter-success')happy(ctx,t,location);
 else if(kind==='letter-ending')drawLetterCredits(ctx,12+t*18/15);
 else if(kind==='credits-rabbit')rabbitCredits(ctx,t);
 ctx.restore();
}
