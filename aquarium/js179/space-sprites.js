export const SPACE_HERO_SIZE=68;
export const SPACE_DEBRIS=Object.freeze([
 Object.freeze({asset:'debris-a',width:40,spin:1.3}),
 Object.freeze({asset:'debris-b',width:40,spin:-1}),
 Object.freeze({asset:'debris-c',width:44,spin:.8})
]);
export function spaceHeroFrame(p){const row=p.dir==='up'?1:['left','right'].includes(p.dir)?2:0,col=p.thrust?[1,2,1,0][Math.floor(p.walk*5)%4]:Math.floor(p.walk*1.5)%3;return {row,col,flip:p.dir==='left',key:`${row}:${col}:${p.dir==='left'?1:0}`};}
export const spaceHeroAngle=(t,stun=0)=>stun>0?(1-stun/2)*Math.PI*2:Math.sin(t*1.6)*.025;
export const spaceDebrisInfo=kind=>SPACE_DEBRIS[kind%SPACE_DEBRIS.length];
export const spaceDebrisAngle=(d,t)=>t*spaceDebrisInfo(d.kind).spin;
export const spaceDroneAngle=(d,t)=>Math.sin(t*1.7+d.id)*.07;

