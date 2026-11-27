// The image, answer and hints are configured together for City Hall.
import {PURSUIT} from './pursuit-game.js?v243';
import {CITYHALL} from './cityhall-core.js';
import {MEMORY} from './memory-core.js?v211';
import {CINEMA} from './cinema-core.js?v268';
import {GYM} from './gym-core.js?v268';
import {POSTAL} from './postal-core.js?v268';
import {HOSPITAL} from './hospital-core.js?v295';
export const CLUE_PUZZLES=Object.freeze({
 hospital:{...HOSPITAL,image:'hospital/stethoscope.webp',prompt:'동물의 심장이나 숨소리를 들을 때 쓰는 그림 속 도구의 이름은 무엇일까요?',answer:'청진기',hints:['수의사가 동물의 몸에 대고 소리를 듣는 도구예요.','한쪽은 양쪽 귀에 끼우고, 반대쪽에는 둥근 판이 붙어 있어요.','청진기']},
 postal:{...POSTAL,image:'postal/mailbox.webp',prompt:'배달원이 집 앞에서 편지를 넣는 이 물건의 이름은 무엇일까요?'},
 pursuit:{...PURSUIT,image:'pursuit/handcuffs.webp',prompt:'경찰이 체포할 때 두 손목에 채우는 이 도구의 이름은 무엇일까요?'},
 memory:{...MEMORY,image:'memory-lab/album.webp',prompt:'찍은 사진을 붙여 모아 두는 이 물건은 무엇일까요?'},
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
