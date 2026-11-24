import {roomSolids} from './literature-layout.js';
// Foot-contact boundaries traced against each painted floor, in 390 x 500 space.
// Dense samples on curved curbs let a held direction follow the edge continuously.
export const FLOORS=[
 [[0,480],[390,480],[390,230],[384,205],[377,180],[366,156],[352,138],[334,127],[311,116],[285,106],[258,98],[239,94],[231,90],[231,83],[160,83],[160,90],[151,94],[132,98],[105,106],[79,116],[56,127],[38,138],[24,156],[13,180],[6,205],[0,230]],
 [[96,480],[303,480],[342,383],[353,290],[341,230],[302,192],[250,161],[218,112],[172,112],[145,158],[80,191],[39,241],[36,345]],
 [[0,480],[390,480],[390,230],[383,210],[377,174],[372,139],[366,103],[360,73],[356,45],[349,42],[234,42],[234,38],[156,38],[156,42],[34,42],[30,48],[26,82],[22,110],[17,144],[12,175],[6,210],[0,230]],
 [[12,480],[378,480],[378,232],[289,232],[278,182],[245,161],[230,112],[160,112],[151,205],[35,205],[12,228]],
 [[95,480],[302,480],[320,416],[314,345],[329,292],[321,224],[290,174],[247,128],[195,128],[148,171],[89,220],[64,285],[86,350],[82,402]],
 [[0,480],[390,480],[390,300],[382,240],[371,193],[348,170],[316,153],[270,143],[240,140],[150,140],[111,149],[75,161],[40,179],[23,205],[10,245],[0,300]],
 [[0,480],[390,480],[390,280],[384,236],[368,194],[346,178],[335,142],[55,142],[43,175],[25,192],[10,234],[0,280]],
 [[0,480],[390,480],[390,295],[383,240],[370,186],[351,159],[310,139],[260,138],[245,142],[145,142],[130,138],[80,139],[39,159],[20,186],[7,240],[0,295]],
 [[0,480],[390,480],[390,280],[381,215],[364,177],[334,150],[280,131],[278,156],[112,156],[110,131],[56,150],[26,177],[9,215],[0,280]]
];
// The two dock walkways remain open all the way to the upper crosswalk.
export const WATER=[[71,83],[317,83],[334,221],[54,221]];
export const EXITS=[{x:195,y:104},{x:195,y:134},{x:195,y:59},{x:195,y:123},{x:220,y:150},{x:310,y:210},{x:280,y:190},{x:320,y:193},{x:320,y:194}];
function inside(p,poly){let v=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
function edgeDistance2(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return (x-a[0]-dx*u)**2+(y-a[1]-dy*u)**2;}
function edgeClear(poly,x,y,r){return poly.every((a,k)=>edgeDistance2(x,y,a,poly[(k+1)%poly.length])>=r*r-1e-7);}
export function walkable(i,x,y,r=7,solids=roomSolids(i)){return inside({x,y},FLOORS[i])&&edgeClear(FLOORS[i],x,y,r)&&!(i===2&&(inside({x,y},WATER)||!edgeClear(WATER,x,y,r)))&&!solids.some(poly=>inside({x,y},poly)||!edgeClear(poly,x,y,r));}
const slideAngles=Array.from({length:17},(_,n)=>{const a=(n+1)*5*Math.PI/180;return [Math.cos(a),Math.sin(a)];});
export function moveOnFloor(i,x,y,dx,dy,r=7,solids=roomSolids(i)){
 // Advance at most two pixels at a time, including low-frame-rate updates.
 // At contact, rotate the step toward the closest legal tangent. Unlike separate
 // X/Y rejection this follows sloping walls with one held arrow, without warping
 // the player to a corridor centre or walking through water / wall corners.
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/2)),sx=dx/steps,sy=dy/steps;
 for(let n=0;n<steps;n++){
  if(walkable(i,x+sx,y+sy,r,solids)){x+=sx;y+=sy;continue;}
  // A perpendicular push into a flat wall has no natural slide direction.
  // Use only the remaining clearance, rather than picking an arbitrary side.
  let closest=Infinity,tangent=0;
  for(const poly of [FLOORS[i],...(i===2?[WATER]:[]),...solids])for(let k=0;k<poly.length;k++){
   const a=poly[k],b=poly[(k+1)%poly.length],d=edgeDistance2(x,y,a,b);
   if(d<closest){closest=d;const ex=b[0]-a[0],ey=b[1]-a[1];tangent=Math.abs((ex*sx+ey*sy)/(Math.hypot(ex,ey)*Math.hypot(sx,sy)||1));}
  }
  if(tangent<.02){let lo=0,hi=1;for(let k=0;k<10;k++){const m=(lo+hi)/2;if(walkable(i,x+sx*m,y+sy*m,r,solids))lo=m;else hi=m;}x+=sx*lo;y+=sy*lo;break;}
  let moved=false;
  for(const [co,si] of slideAngles){for(const sign of [1,-1]){const tx=sx*co-sy*si*sign,ty=sx*si*sign+sy*co;if(walkable(i,x+tx,y+ty,r,solids)){x+=tx;y+=ty;moved=true;break;}}if(moved)break;}
  if(!moved)break;
 }
 return {x,y};
}
export const salvagePoints=[{x:92,y:305},{x:292,y:245}],raftPoint={x:305,y:404};
export const windProps=[{x:102,y:346},{x:288,y:263}],knightPoint={x:105,y:201};
export const ropePoints=[{x:87,y:330},{x:300,y:275},{x:180,y:196}];
export const valvePoints=[{x:105,y:282},{x:285,y:349}];
export const valveWorkPoint=k=>({x:valvePoints[k].x+18,y:valvePoints[k].y+15});
export const VALVE_SECONDS=1.85;
export const FISHING=Object.freeze({taps:12,biteSeconds:.65,graceSeconds:.5,decayPerSecond:3,tapCooldown:0});
export const SEWING=Object.freeze({seconds:7.5,speed:65,tolerance:22,point:{x:128,y:217},work:{x:160,y:185},contact:{x:131,y:166}});
export const seamX=t=>195+62*Math.sin(t*1.05);
export const elephantStart={x:242,y:425};
export const elephantGates=[{x:275,y:365},{x:115,y:278},{x:265,y:196}];
export const elephantObstacles=[{x:128,y:365,rx:64,ry:27},{x:270,y:278,rx:63,ry:27},{x:120,y:196,rx:51,ry:25}];
export const surfAt=t=>{const p=t%5.4;return {warning:p<1,active:p>=1&&p<2.6,x:365-Math.max(0,p-1)*205,y:292,gap:335,gapWidth:76,phase:p};};
export const reelAt=t=>{const p=t%7.4;return {phase:p,value:p/7.4,good:p>=3.6&&p<7.4,warning:p<1.4,tug:p>=1.4&&p<3.6,cycle:Math.floor(t/7.4),direction:Math.floor(t/7.4)%2?1:-1,remaining:p>=3.6?7.4-p:3.6-p};};
export const sheepAt=(t,k)=>{const p=(t+k*2.6)%5.2,dir=k?-1:1;return {x:dir>0?-70+Math.max(0,p-1)*155:460-Math.max(0,p-1)*155,y:k?263:346,dir,warning:p<1,active:p>=1&&p<4.5,phase:p};};
export const patrolAt=(t,k)=>{const p=(t+k*1.45)%8,forward=p<4,u=forward?Math.min(p/2.6,1):1-Math.min((p-4)/2.6,1);return {x:32+326*u,y:ropePoints[k].y-4,dir:forward?1:-1,moving:forward?p<2.6:p<6.6};};
export const ropeWorkPoint=k=>({x:ropePoints[k].x+22,y:ropePoints[k].y-4});
export const patrolMembers=(t,k)=>{const h=patrolAt(t,k);return [-1,0,1].map(j=>({...h,x:h.x+j*21,j}));};
// Only the visible grounded bodies/shadows touch. No invisible group-wide box.
export const soldierTouches=(p,h)=>((p.x-h.x)/14)**2+((p.y-h.y)/11)**2<=1;
export function patrolWorkWindow(t,k){const p=ropeWorkPoint(k);for(let dt=0;dt<=2;dt+=.08)if(patrolMembers(t+dt,k).some(h=>soldierTouches(p,h)))return false;return true;}
// Each arm's clock starts when its valve is approached. The first strike lands
// before an uninterrupted valve job can finish; retreat leaves a fair work gap.
export const tentacleAt=(t,k=0)=>{const p=t<0?-1:t%6.5;return {phase:p,k,warning:p>=0&&p<1.2,active:p>=1.55&&p<2.15,retreat:p>=2.15&&p<3.2,present:p>=0&&p<3.2,rest:p<0||p>=3.2,remaining:p<0?0:6.5-p};};
const ease=n=>{const v=Math.max(0,Math.min(1,n));return v*v*(3-2*v);};
function cubic(a,b,c,d,u){const v=1-u;return {x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c.x+u*u*u*d.x,y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c.y+u*u*u*d.y};}
// Root stays inside the porthole; one continuous spine bends, hits, then retracts.
export function tentaclePose(t,k){
 const h=tentacleAt(t,k),p=valveWorkPoint(k),sign=k?-1:1,root={x:k?350:40,y:112};
 const reach=h.phase<0?0:h.phase<.85?ease(h.phase/.85):h.phase>2.4?1-ease((h.phase-2.4)/.8):1;
 const lift=h.phase<1.2?52+10*Math.sin(Math.max(0,h.phase)/1.2*Math.PI):h.phase<1.55?52*(1-ease((h.phase-1.2)/.35)):h.phase<2.15?0:50*ease((h.phase-2.15)/.65);
 const end={x:p.x+sign*38,y:p.y+43},b={x:root.x+sign*50,y:root.y+100},u=.8,v=1-u;
 // Solve the cubic so its grounded middle passes through the exact work point.
 const d={x:(p.x-v*v*v*root.x-3*v*v*u*b.x-u*u*u*end.x)/(3*v*u*u),y:(p.y-v*v*v*root.y-3*v*v*u*b.y-u*u*u*end.y)/(3*v*u*u)};
 const ground=Array.from({length:41},(_,i)=>({...cubic(root,b,d,end,i/40),u:i/40}));
 const points=ground.map(a=>({u:a.u,x:root.x+(a.x-root.x)*reach+sign*12*Math.sin(a.u*Math.PI*2)*Math.sin(a.u*Math.PI)*lift/65*reach,y:root.y+(a.y-root.y)*reach-lift*Math.sin(a.u*Math.PI/2)*reach}));
 return {...h,root,points,ground,reach,lift};
}
const ARM_EDGES=[[16,203],[51,193],[61,180],[75,166],[86,156],[90,152],[94,146],[101,143],[108,140],[113,136],[107,113]];
export function tentacleBand(u){const z=Math.min(9.999,u*10),i=Math.floor(z),f=z-i,lo=ARM_EDGES[i][0]*(1-f)+ARM_EDGES[i+1][0]*f,hi=ARM_EDGES[i][1]*(1-f)+ARM_EDGES[i+1][1]*f;return {offset:(110-(lo+hi)/2)*60/220,r:(hi-lo)/2*60/220};}
export function tentacleTouches(p,t,k){const h=tentaclePose(t,k);if(!h.active)return false;for(let i=22;i<h.points.length-1;i++){const a=h.points[i],b=h.points[i+1],band=tentacleBand(a.u),dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy)||1,ox=-dy/n*band.offset,oy=dx/n*band.offset;if(edgeDistance2(p.x,p.y,[a.x+ox,a.y+oy],[b.x+ox,b.y+oy])<=(band.r+7)**2)return true;}return false;}

export const LOCK_WORK=Object.freeze({point:{x:232,y:209},contact:{x:206,y:187}});

// Landing/recoil endpoints must be legal after dynamic props change shape.
export function nearestWalkable(i,point,r=7,solids=roomSolids(i),allowed=()=>true){
 const valid=(x,y)=>walkable(i,x,y,r,solids)&&allowed({x,y});
 if(valid(point.x,point.y))return {...point};
 for(let d=2;d<=180;d+=2){const count=Math.max(16,Math.ceil(Math.PI*d));for(let k=0;k<count;k++){const a=Math.PI/2+k*Math.PI*2/count,x=point.x+Math.cos(a)*d,y=point.y+Math.sin(a)*d;if(valid(x,y))return {x,y};}}
 throw new Error('No walkable landing in literature room '+i);
}
