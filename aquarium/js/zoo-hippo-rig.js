import {hippoVertex} from './zoo-hippo-motion.js';
const XS=[20,34,60,84.18,110,130,140,150,160,170,185,205,220,250,290,330,362];
const YS=[96,120,140,160,180,195,205,217,230,245,251.9,270,290,310,325,334,352,360];
function triangle(c,image,src,dst){
 const [p,q,r]=src,[u,v,w]=dst;
 const sx=q.x-p.x,sy=q.y-p.y,tx=r.x-p.x,ty=r.y-p.y,det=sx*ty-sy*tx;
 const dx=v.x-u.x,dy=v.y-u.y,ex=w.x-u.x,ey=w.y-u.y;
 const a=(dx*ty-ex*sy)/det,b=(dy*ty-ey*sy)/det,d=(ey*sx-dy*tx)/det,e=(ex*sx-dx*tx)/det;
 c.save();c.beginPath();const cx=(u.x+v.x+w.x)/3,cy=(u.y+v.y+w.y)/3;
 for(let i=0;i<3;i++){const p=dst[i],rx=p.x-cx,ry=p.y-cy,k=1+.24/(Math.hypot(rx,ry)||1);i?c.lineTo(cx+rx*k,cy+ry*k):c.moveTo(cx+rx*k,cy+ry*k);}c.closePath();c.clip();
 c.transform(a,b,e,d,u.x-a*p.x-e*p.y,u.y-b*p.x-d*p.y);
 c.drawImage(image,0,0,384,384,0,0,384,384);c.restore();
}
export class HippoRig{
 constructor(image){this.image=image;this.cache=new Map();}
 frame(rig){
  // Subpixel-scale pose steps; bounded cache avoids repeated mesh work.
  const lift=Math.round(rig.lift*64)/64,jaw=Math.round(rig.jaw*64)/64,key=lift+':'+jaw;
  if(this.cache.has(key)){const frame=this.cache.get(key);this.cache.delete(key);this.cache.set(key,frame);return frame;}
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=264;const c=canvas.getContext('2d');c.translate(0,-96);
  for(let row=YS.length-2;row>=0;row--)for(let col=0;col<XS.length-1;col++){
   const p=[{x:XS[col],y:YS[row]},{x:XS[col+1],y:YS[row]},{x:XS[col+1],y:YS[row+1]},{x:XS[col],y:YS[row+1]}],d=p.map(p=>hippoVertex(p.x,p.y,{lift,jaw}));
   triangle(c,this.image,[p[0],p[1],p[2]],[d[0],d[1],d[2]]);triangle(c,this.image,[p[0],p[2],p[3]],[d[0],d[2],d[3]]);
  }
  this.cache.set(key,canvas);if(this.cache.size>48)this.cache.delete(this.cache.keys().next().value);return canvas;
 }
}
