import { MOTIONS } from './config.js';
const cache=new Map();
export function loadMotion(character,action){
  const key=`${character.id}-${action}`;
  if(!cache.has(key))cache.set(key,new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{cache.delete(key);reject(new Error(`모션을 불러오지 못했어요: ${key}`));};
    img.src=new URL(`../assets/motions/${key}.webp`,import.meta.url).href;
  }));
  return cache.get(key);
}
export class SpritePlayer{
  constructor(canvas,image){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.image=image;this.elapsed=0;this.done=false;this.draw(0);}
  draw(dt){
    // 탭 전환/느린 프레임에서도 중간 동작을 건너뛰지 않도록 한 프레임씩 진행합니다.
    this.elapsed+=Math.min(.125,Math.max(0,dt));
    const index=Math.min(MOTIONS.frames-1,Math.floor(this.elapsed*MOTIONS.fps));
    this.done=this.elapsed>=MOTIONS.frames/MOTIONS.fps;
    this.canvas.dataset.frame=String(index);
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.ctx.drawImage(this.image,(index%4)*256,Math.floor(index/4)*256,256,256,0,0,this.canvas.width,this.canvas.height);
  }
}
