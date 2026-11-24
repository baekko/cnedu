import {spriteAnchor} from './layout.js';
import {ROOM_HERO_SIZE} from './hero-scale.js';
import {drawHeldWalk} from './heroes.js?v=155';
let metadata;
export async function loadPlayerActions(images,character){
 metadata ||= fetch(new URL('../assets/player-actions-v128/actions.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('동작 정보 오류');return r.json();});
 const [data,im]=await Promise.all([metadata,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('탐험가 동작 그림 오류'));im.src=new URL('../assets/player-actions-v128/'+character.id+'.webp',import.meta.url).href;})]);images.playerActions=im;images.actionAtlas=data;return images;
}
export function actionFrame(images,character,action,frame=0){const a=images.actionAtlas;return a.characters[character.id].frames[a.rowsByAction[action]*4+(frame%4)];}
export function drawPlayerAction(c,images,character,p,action,frame=0,flip=false,walkRow=null){
 const b=actionFrame(images,character,action,frame),size=ROOM_HERO_SIZE;c.save();spriteAnchor(c,p.x,p.y);if(flip)c.scale(-1,1);
 if(p.moving&&walkRow!==null)drawHeldWalk(c,images[character.id+'-walk.webp'],images.playerActions,{walkRow,walk:p.walk,size,sx:b.sx,sy:b.sy,footY:244});
 else c.drawImage(images.playerActions,b.sx,b.sy,256,256,-size/2,-244*size/256,size,size);
 c.restore();
}
export function leverStandpoint(images,character,lever,prop){
 const b=actionFrame(images,character,'leverUp',1),palms=b.palms||[b.tip],p=palms.filter(Boolean),hand=p.length?p.reduce((s,v)=>[s[0]+v[0]/p.length,s[1]+v[1]/p.length],[0,0]):[128,121],k=30/(prop.opaqueBounds[3]-prop.opaqueBounds[1]);
 return{x:lever.x+(prop.handle[0]-prop.anchor[0])*k-(hand[0]-128)*ROOM_HERO_SIZE/256,y:lever.y+(prop.handle[1]-prop.anchor[1])*k-(hand[1]-244)*ROOM_HERO_SIZE/256};
}
