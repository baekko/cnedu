// One mouth position drives both the painted head and the actual bite.
// The warning circle describes the destination; it is never a collider.
export const SCYLLA=Object.freeze({baseZ:3070*1.5,denX:370,denZ:3070*1.5+5,reach:.18,withdraw:.24,biteHold:.12,enter:.94,release:1.08,return:1.42,headAspect:255/322,mouthU:.22,mouthV:.81});
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{const t=clamp(n);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
export function scyllaRest(head,time=0){
 const size=37,x=[278,315,351,272,315,362][head],z=SCYLLA.baseZ-[18,47,19,78,107,74][head]*1.5-Math.sin(time*2+head)*4;
 return {mouth:{x:x+size*(SCYLLA.mouthU-.5),z:z-12-size*SCYLLA.headAspect*(SCYLLA.mouthV-.6)},size,phase:'rest'};
}
export function scyllaAttackPose(h,time=0){
 const rest=h.fromCave?{mouth:{x:SCYLLA.denX,z:SCYLLA.denZ},size:34,phase:'rest'}:scyllaRest(h.head,h.age<h.warn?time:0),age=h.age-h.warn;
 if(age<0)return {...rest,phase:'warning'};
 if(h.age>=h.life)return rest;
 const retract=h.age>=h.life-SCYLLA.withdraw;
 const extension=retract?ease((h.life-h.age)/SCYLLA.withdraw):ease(age/SCYLLA.reach);
 return {mouth:{x:mix(rest.mouth.x,h.x,extension),z:mix(rest.mouth.z,h.z+30,extension)},size:37+12*extension,phase:retract?'withdraw':age<SCYLLA.reach?'lunge':'bite'};
}
export function scyllaSpritePose(motion,project=z=>-z){
 const width=motion.size,height=width*SCYLLA.headAspect,left=motion.mouth.x-width*SCYLLA.mouthU,top=project(motion.mouth.z)-height*SCYLLA.mouthV;
 return {left,top,width,height,joint:{x:left+width*.73,y:top+height*.91},neckWidth:width*.23};
}
export function scyllaBiteContact(h,player){
 const pose=scyllaAttackPose(h);
 if(h.bit||pose.phase!=='bite')return false;
 // Small mouth + seated explorer's torso, rather than the whole boat/shadow.
 return ((pose.mouth.x-player.x)/19)**2+((pose.mouth.z-(player.z+30))/20)**2<=1;
}
export function scyllaGrabPose(grab){
 const t=grab.age,pull=ease((t-SCYLLA.biteHold)/(SCYLLA.enter-SCYLLA.biteHold));
 const mouth={x:mix(grab.from.mouth.x,SCYLLA.denX,pull),z:mix(grab.from.mouth.z,SCYLLA.denZ,pull)+Math.sin(pull*Math.PI)*20};
 const size=mix(grab.from.size,34,pull),grip={x:mouth.x-12,z:mouth.z-18};
 let hero={...grip},returning=t>=SCYLLA.release&&!grab.defeated;
 if(t<SCYLLA.biteHold){const close=ease(t/SCYLLA.biteHold);hero={x:mix(grab.boat.x,grip.x,close),z:mix(grab.boat.z+11,grip.z,close)};}
 if(returning){const u=clamp((t-SCYLLA.release)/(SCYLLA.return-SCYLLA.release)),f=ease(u);hero={x:mix(grip.x,grab.boat.x,f),z:mix(grip.z,grab.boat.z+11,f)+Math.sin(u*Math.PI)*38};}
 return {mouth,size,phase:'grab',hero,returning,inside:t>=SCYLLA.enter&&!returning,headVisible:t<SCYLLA.enter,heroVisible:t<SCYLLA.enter||returning};
}
