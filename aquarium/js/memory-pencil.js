import {MEMORY_MARK_INSET} from './memory-targets.js?v209';

const markSize=MEMORY_MARK_INSET*2-6;

export function prepareMemoryPencil(image){
 const pad=5,stamp=document.createElement('canvas');
 stamp.width=image.width+pad*2;stamp.height=image.height+pad*2;
 const c=stamp.getContext('2d');
 // Widen the pigment while keeping the irregular edge and flecks of the stamp.
 c.globalAlpha=.55;
 for(const [x,y] of [[-5,0],[5,0],[0,-5],[0,5],[-3,-3],[-3,3],[3,-3],[3,3]]){
  c.drawImage(image,pad+x,pad+y);
 }
 c.globalAlpha=1;c.drawImage(image,pad,pad);
 c.globalCompositeOperation='source-atop';
 c.globalAlpha=.78;c.fillStyle='#fb192d';c.fillRect(0,0,stamp.width,stamp.height);
 return stamp;
}

// Both in-game marks have a fixed box, independent of their answer regions.
export function drawMemoryPencil(context,stamp,[x,y],size=markSize){
 context.drawImage(stamp,x-size/2,y-size/2,size,size);
}
