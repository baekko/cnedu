/** The first bridge illustration and the following film share the exact same frame. */
export const PORTAL_ASSETS=['assets/story/v6/rabbit/p21-bridge.webp','assets/cinema/v6/rabbit-rear-hops.png'];
const images=[];let pending;
export function loadPortalAssets(){
 return pending||=Promise.all(PORTAL_ASSETS.map((src,i)=>new Promise((resolve,reject)=>{
  const im=new Image();im.onload=async()=>{try{await im.decode();images[i]=im;resolve()}catch(e){reject(e)}};im.onerror=reject;im.src=new URL(src,import.meta.url).href;
 }))).catch(e=>{pending=null;throw e});
}
export function drawPortalFrame(ctx,t=0){
 if(images.length<2)return;
 ctx.save();ctx.clearRect(0,0,768,512);ctx.imageSmoothingEnabled=true;ctx.drawImage(images[0],0,0,768,512);
 if(t<7.8){
  const p=Math.max(0,Math.min(1,(t-.45)/7.1)),q=1-Math.pow(1-p,1.35);
  const size=190+(32-190)*q,feet=151+(395-151)*size/190;
  const frame=t<=.45?0:Math.floor((t-.45)*8)%8;
  ctx.fillStyle='#57457725';ctx.beginPath();ctx.ellipse(384,feet+1,size*.14,size*.025,0,0,Math.PI*2);ctx.fill();
  // The projected height and ground contact share one horizon. No sideways
  // travel or fade-out: the rabbit remains on the bridge until the scene cut.
  ctx.drawImage(images[1],frame%4*256,Math.floor(frame/4)*256,256,256,384-128*size/256,feet-236*size/256,size,size);
 }
 ctx.restore();
}
export async function revealPortal(figure){
 try{await loadPortalAssets();if(!figure.isConnected)return;drawPortalFrame(figure.querySelector('canvas').getContext('2d'),0);figure.querySelector('canvas').hidden=false;figure.querySelector('.scene-status').hidden=true;figure.setAttribute('aria-busy','false');}
 catch{if(!figure.isConnected)return;const status=figure.querySelector('.scene-status');status.textContent='그림을 불러오지 못했어요. ';const retry=document.createElement('button');retry.textContent='다시 불러오기';retry.onclick=()=>revealPortal(figure);status.append(retry);}
}
