import {drawRabbitOpeningActor, RABBIT_OPENING_TIMING as timing} from './rabbit-depth-motion.js';
const BRIDGE_PAUSE = 2;
export const PORTAL_CUT = BRIDGE_PAUSE + (timing.departureEnd - timing.turnEnd);
/** The first bridge illustration and the following film share the exact same frame. */
export const PORTAL_ASSETS=['assets/story/v6/rabbit/p21-bridge.webp','assets/cinema/v7/rabbit-depth-atlas.png'];
const images=[];let pending;
export function loadPortalAssets(){
 return pending||=Promise.all(PORTAL_ASSETS.map((src,i)=>new Promise((resolve,reject)=>{
  const im=new Image();im.onload=async()=>{try{await im.decode();images[i]=im;resolve()}catch(e){reject(e)}};im.onerror=reject;im.src=new URL(src,import.meta.url).href;
 }))).catch(e=>{pending=null;throw e});
}
export function drawPortalFrame(ctx,t=0){
 if(images.length<2)return;
 ctx.save();ctx.clearRect(0,0,768,512);ctx.imageSmoothingEnabled=true;ctx.drawImage(images[0],0,0,768,512);
 if(t<=PORTAL_CUT){
  // Project the actor at the same display size as the fully zoomed opening mirror.
  const zoom=3.95, scaleX=zoom*164/768, scaleY=zoom*109/512;
  ctx.translate(384-384*scaleX,395-445*scaleY);
  ctx.scale(scaleX,scaleY);
  drawRabbitOpeningActor(ctx,timing.turnEnd+Math.max(0,t-BRIDGE_PAUSE),{depth:images[1]});
 }
 ctx.restore();
}
export async function revealPortal(figure){
 try{await loadPortalAssets();if(!figure.isConnected)return;drawPortalFrame(figure.querySelector('canvas').getContext('2d'),0);figure.querySelector('canvas').hidden=false;figure.querySelector('.scene-status').hidden=true;figure.setAttribute('aria-busy','false');}
 catch{if(!figure.isConnected)return;const status=figure.querySelector('.scene-status');status.textContent='그림을 불러오지 못했어요. ';const retry=document.createElement('button');retry.textContent='다시 불러오기';retry.onclick=()=>revealPortal(figure);status.append(retry);}
}
