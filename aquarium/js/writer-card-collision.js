import {writerHeroSprite,writerCardSprite,WRITER_CARD_ART} from './writer-sprites-v99.js?v=155';
const W=128,H=128,OX=64,OY=112;
export function visibleMasksTouch(a,ax,ay,b,bx,by){
 const dx=Math.round(ax-bx),dy=Math.round(ay-by);
 for(let i=0;i<a.points.length;i+=2){const x=a.points[i]+dx,y=a.points[i+1]+dy;if(x>=0&&x<W&&y>=0&&y<H&&b.solid[y*W+x])return true;}return false;
}
export function createWriterCardCollider(images,character){
 const heroes=new Map(),guards=new Map();
 const mask=draw=>{const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d',{willReadFrequently:true});c.translate(OX,OY);draw(c);const rgba=c.getImageData(0,0,W,H).data,solid=new Uint8Array(W*H),points=[];
  // Strict opaque overlap: no expanded rectangle, extra radius or transparent
  // padding. Thin antialias fringes cannot deduct health before visible contact.
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(rgba[(y*W+x)*4+3]>=128){solid[y*W+x]=1;points.push(x,y);}return {solid,points};};
 const heroMask=(p,g)=>{const f=writerHeroSprite(g,character,images),cell=f.cell??256,key=[f.file,f.column,f.row,p.size,f.flip].join(':');if(!heroes.has(key))heroes.set(key,mask(c=>{if(f.flip)c.scale(-1,1);c.drawImage(images[f.file],f.column*cell,f.row*cell,cell,cell,-f.size/2,-f.size*f.anchor,f.size,f.size);}));return heroes.get(key);};
 const guardMask=q=>{const f=writerCardSprite(q),key=f.frame+':'+f.flip;if(!guards.has(key))guards.set(key,mask(c=>{if(f.flip)c.scale(-1,1);c.drawImage(images['card-soldier'],f.column*256,f.row*256,256,256,-31,-62*f.anchor,62,62);}));return guards.get(key);};
 const touches=(p,q,time,g)=>{
  if(Math.abs(p.x-q.x)>65||Math.abs(p.y-q.y)>105)return false;
  return visibleMasksTouch(heroMask(p,g),p.x,p.y,guardMask(q),q.x,q.y);
 };
 touches.masks={heroes,guards};touches.heroMask=(g)=>heroMask(g.player,g);touches.guardMask=guardMask;return touches;
}
