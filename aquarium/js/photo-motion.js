const TAU=Math.PI*2;
const smooth=u=>u*u*(3-2*u);
// Animation follows distance travelled on the unchanged subject paths.
function arcTable(point){const distances=[0];let previous=point(0);for(let i=1;i<=128;i++){const p=point(i/128);distances.push(distances.at(-1)+Math.hypot(p[0]-previous[0],p[1]-previous[1]));previous=p;}return distances;}
function arcAt(table,u){const f=Math.max(0,Math.min(128,u*128)),i=Math.min(127,Math.floor(f));return table[i]+(table[i+1]-table[i])*(f-i);}
const CAT_ARC=arcTable(u=>[96*smooth(u),Math.sin(Math.PI*u)*11.05]);
const CAT_STEPS=[3,3,4,4,2,2,6,6];
const DOG_ARC=arcTable(u=>[Math.cos(u*TAU)*52,Math.sin(u*TAU)*23]);
const RABBIT_POINTS=[[-1,0],[-.4,-.65],[.55,-.35],[1,.3],[.3,.75],[-.55,.4]];
function animalPath(s,time){
 const t=time+s.phase;
 if(s.animal==='cat'){
  const phase=t%7.8;let u,dx,dy,moving=false,facing=1;
  if(phase<.5){dx=-1;dy=0;}
  else if(phase<3.5){u=(phase-.5)/3;dx=-1+2*smooth(u);dy=Math.sin(Math.PI*u)*.65;moving=true;}
  else if(phase<4){dx=1;dy=0;facing=-1;}
  else{u=(phase-4)/3.8;dx=1-2*smooth(u);dy=-Math.sin(Math.PI*u)*.65;moving=true;facing=-1;}
  return {x:s.x+dx*48,groundY:s.y+dy*17,jump:0,moving,facing,frame:moving?CAT_STEPS[Math.floor(arcAt(CAT_ARC,u)/30*8)%8]:1};
 }
 if(s.animal==='dog'){
  const a=t*TAU/5.9;return {x:s.x+Math.cos(a)*52,groundY:s.y+Math.sin(a)*23,jump:0,moving:true,facing:Math.sin(a)>0?-1:1,frame:Math.floor((Math.floor(t/5.9)*DOG_ARC.at(-1)+arcAt(DOG_ARC,(t%5.9)/5.9))/34*8)%8};
 }
 const duration=1.3,cycle=t/duration,leg=Math.floor(cycle)%RABBIT_POINTS.length,phase=(cycle%1)*duration;
 const a=RABBIT_POINTS[leg],b=RABBIT_POINTS[(leg+1)%RABBIT_POINTS.length],air=phase>.55,u=air?(phase-.55)/.75:0,travel=smooth(u);
 return {x:s.x+(a[0]+(b[0]-a[0])*travel)*48,groundY:s.y+(a[1]+(b[1]-a[1])*travel)*22,jump:air?Math.sin(Math.PI*u)*12:0,moving:air,facing:b[0]>=a[0]?1:-1,frame:air?(u<.16?2:u<.35?3:u<.65?4:u<.9?5:6):phase<.12?6:phase<.28?7:phase<.43?0:1};
}
export function subjectPose(s,time){
 if(s.animal){const p=animalPath(s,time);return {...p,y:p.groundY-p.jump,ready:true,warning:false,cycle:(time+s.phase)%7.8,pose:0,rotation:0};}
 const cycle=(time+s.phase)%s.period,ready=cycle>=2.1&&cycle<3.75,warning=cycle>=1.25&&cycle<2.1;
 return {x:s.x+Math.sin(time*.83+s.phase)*s.amp,y:s.y,groundY:s.y,jump:0,ready,warning,cycle,pose:ready?0:1,rotation:s.room===0?Math.sin(time*1.4+s.phase)*.06:0};
}
