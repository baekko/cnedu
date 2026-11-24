export async function workshopAssets(folder,character,keys){
 const images={};await Promise.all(keys.map(key=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('그림을 불러오지 못했어요: '+key));im.src=new URL('../assets/'+folder+'/'+key+'.webp',import.meta.url).href;})));
 if(character)await Promise.all(['idle','walk'].map(key=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[character.id+'-'+key+'.webp']=im;resolve();};im.onerror=reject;im.src=new URL('../assets/hero-v153/'+character.id+'-'+key+'.webp',import.meta.url).href;})));
 images.clue=images.entrance;return images;
}
export async function artMetadata(folder,key){const r=await fetch(new URL('../assets/'+folder+'/'+key+'.json',import.meta.url));if(!r.ok)throw Error('그림 위치 정보 오류');return r.json();}

// Entrance texture is independent of the already collected puzzle picture.
export async function loadWorkshopEntrance(images,place){
 images.entrance=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=new URL('../assets/entrance-v129/'+place+'.webp',import.meta.url).href;});
}
