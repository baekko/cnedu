// The image, answer and hints are configured together for City Hall.
import {CITYHALL} from './cityhall-core.js';
import {CINEMA} from './cinema-core.js?v204-final40';
import {GYM} from './gym-core.js?v=161';
export const CLUE_PUZZLES=Object.freeze({
 cinema:{...CINEMA,image:'cinema/projector.webp',prompt:'스크린에 영화를 비추는 이 기계의 이름은 무엇일까요?'},
 cityhall:{...CITYHALL,image:'cityhall/seal.webp',prompt:'그림 속 결재 도구의 이름은 무엇일까요?'},
 gym:{...GYM,image:'gym-v161/whistle.webp',prompt:'그림 속 심판 도구의 이름은 무엇일까요?'},
});
const cache=new Map();
export async function prepareCluePuzzle(root,place){
 const spec=CLUE_PUZZLES[place];if(!spec)return;
 if(!cache.has(place))cache.set(place,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{const c=document.createElement('canvas');c.width=c.height=600;const ctx=c.getContext('2d');ctx.fillStyle='#ede1c8';ctx.fillRect(0,0,600,600);const k=540/Math.max(image.width,image.height);ctx.drawImage(image,(600-image.width*k)/2,(600-image.height*k)/2,image.width*k,image.height*k);resolve(c.toDataURL('image/png'));};image.onerror=()=>{cache.delete(place);reject(Error('단서 그림을 불러오지 못했어요.'));};image.src=new URL('../assets/'+spec.image,import.meta.url).href;}));
 root.style.setProperty('--configured-clue-image',`url("${await cache.get(place)}")`);
}
