import {ROCKY_RED_GLOVE_FRONT_MAX178,ROCKY_RIGID_BAG178} from './rocky-contacts178.js?v178';
const contour=ROCKY_RIGID_BAG178.localSideContoursWorld;
const hits=[[.5,7],[.75,5],[1,6],[1.25,4],[1.5,5],[2,8],[3,6],[4,7],[4.75,9],[5.25,6],[6.5,8],[7,10],[7.25,7]];
const geometry=dx=>{const theta=Math.asin(dx/83);return{theta,ring:[165+dx,19+Math.sqrt(83*83-dx*dx)],pivot:[165,19]}};
export function rockyBagLeftAt(dx,worldY){
 const b=geometry(dx),cs=Math.cos(b.theta),sn=Math.sin(b.theta),edge=[];
 for(const [v,u]of contour)edge.push([b.ring[0]+u*cs+v*sn,b.ring[1]-u*sn+v*cs]);
 let left=Infinity;
 for(let i=1;i<edge.length;i++){const a=edge[i-1],d=edge[i];if(worldY>=Math.min(a[1],d[1])&&worldY<=Math.max(a[1],d[1])&&Math.abs(d[1]-a[1])>.00001){const q=(worldY-a[1])/(d[1]-a[1]);left=Math.min(left,a[0]+q*(d[0]-a[0]));}}
 return left;
}
export function rockyBagPose(time,index){
 // Every new punch contributes momentum; no bag or human footage is cycled.
 let dx=2;
 for(const [at,force]of hits)if(time>=at){const age=time-at;dx+=force*Math.exp(-age*1.45)*Math.sin(age*6.1);}
 dx=Math.max(-6,Math.min(25,dx));
 const fist=ROCKY_RED_GLOVE_FRONT_MAX178[index],front=fist[0]+.7;
 if(rockyBagLeftAt(dx,fist[1])<front){let low=dx,high=28;for(let n=0;n<18;n++){const mid=(low+high)/2;if(rockyBagLeftAt(mid,fist[1])<front)low=mid;else high=mid;}dx=high;}
 const b=geometry(dx);return{...b,dx,fist,front,leftAtFist:rockyBagLeftAt(dx,fist[1]),drawSize:ROCKY_RIGID_BAG178.worldDrawSize,localRing:ROCKY_RIGID_BAG178.ringAnchorLocalWorld};
}

