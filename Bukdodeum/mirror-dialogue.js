/** A single fixed camera for dialogue and the following departure shot. */
export const MIRROR_ASSETS=['assets/story/v5/rabbit/mirror-empty.webp','assets/cinema/v5/rabbit-dialogue-atlas.png'];
const images=[];let pending;
export function loadMirrorAssets(){
 return pending||=Promise.all(MIRROR_ASSETS.map((path,index)=>new Promise((resolve,reject)=>{
  const image=new Image();image.onload=async()=>{try{await image.decode();images[index]=image;resolve()}catch(e){reject(e)}};image.onerror=reject;image.src=new URL(path,import.meta.url).href;
 }))).catch(error=>{pending=null;throw error});
}
export const MIRROR_RABBIT={x:384,feet:430,size:285};
export function drawMirrorDialogue(ctx,pose=0,{departure=null}={}){
 if(images.length<2)return;
 ctx.save();ctx.clearRect(0,0,768,512);ctx.imageSmoothingEnabled=true;ctx.drawImage(images[0],0,0,768,512);
 let frame=pose,{x,feet,size}=MIRROR_RABBIT;
 if(departure!==null){
  if(departure<.35)frame=9;
  else if(departure<.7)frame=10;
  else if(departure<1)frame=11;
  else{const p=Math.min(1,(departure-1)/3.7),q=p*p*(3-2*p);size=285+(17-285)*q;feet=430+(184-430)*q;frame=12+Math.floor((departure-1)*10)%4;feet-=Math.sin(((departure-1)*2.5%1)*Math.PI)*size*.05;}
 }
 // The entire actor remains behind the oval glass; the rim and room never move.
 ctx.beginPath();ctx.ellipse(384,250,181,230,0,0,Math.PI*2);ctx.clip();
 if(departure===null||departure<4.7){const cell=images[1].width/4;ctx.drawImage(images[1],frame%4*cell,Math.floor(frame/4)*cell,cell,cell,x-128*size/256,feet-244*size/256,size,size);}
 ctx.restore();
}
export function retainMirror(previousRoot,nextRoot){
 const previous=previousRoot.querySelector('[data-mirror-pose]'),next=nextRoot.querySelector('[data-mirror-pose]');
 if(previous&&next){previous.dataset.mirrorPose=next.dataset.mirrorPose;next.replaceWith(previous)}
}
export async function revealMirror(figure){
 try{await loadMirrorAssets();if(!figure.isConnected)return;drawMirrorDialogue(figure.querySelector('canvas').getContext('2d'),Number(figure.dataset.mirrorPose));figure.querySelector('canvas').hidden=false;figure.querySelector('.scene-status').hidden=true;figure.setAttribute('aria-busy','false');}
 catch{if(!figure.isConnected)return;const status=figure.querySelector('.scene-status');status.textContent='그림을 불러오지 못했어요. ';const retry=document.createElement('button');retry.textContent='다시 불러오기';retry.onclick=()=>revealMirror(figure);status.append(retry);}
}
