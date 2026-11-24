import {spriteAnchor} from './layout.js';
import {ROOM_HERO_SIZE} from './hero-scale.js';
let atlas;
export async function loadDetectiveInspection(images){
 atlas ||= fetch(new URL('../assets/detective-v132/investigate.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('조사 동작 정보 오류');return r.json();});
 [images.inspectionAtlas,images.inspection]=await Promise.all([atlas,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('조사 동작 그림 오류'));im.src=new URL('../assets/detective-v132/investigate.webp',import.meta.url).href;})]);
 return images;
}
export function drawDetectiveInspection(c,images,character,p,age=0){
 const a=images.inspectionAtlas,frames=a.characters[character.id].frames,f=frames[Math.floor(Math.max(0,age)*a.fps)%frames.length],size=ROOM_HERO_SIZE;
 // Paper, both hands and magnifier belong to the same authored rear pose.
 // Keep the player's actual location and collider; no pose-driven teleporting.
 c.save();spriteAnchor(c,p.x,p.y);c.drawImage(images.inspection,f.sx,f.sy,256,256,-size/2,-244*size/256,size,size);c.restore();
}
