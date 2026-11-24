import {sprayMuzzle} from './garden-spray.js';
export const POLLEN_COLORS=['#e5b747','#d887a8','#7aa8cc'];
export const POLLEN_NAMES=['금빛','분홍','파란'];
export const DONORS=[{x:72,y:268,color:0},{x:195,y:268,color:1},{x:318,y:268,color:2}];
export const POLLEN_TRANSFERS=3;
export function initGardenCare(g){
 g.pollen=null;g.pollenCharges=0;g.working=false;g.careWait=0;g.pestHold=0;g.pestTime=0;g.sprayAge=99;
 for(const s of g.beds){if(s.room===1){s.pollenNeed=[2,0,1][s.id-4];s.pollinate=0;}if(s.room===2)s.bugCount=2;}
 g.bugs=Array.from({length:6},(_,i)=>({id:i,source:7+Math.floor(i/2),kind:i%2?'beetle':'moth',side:i%2?1:-1,hp:2,phase:i*.73,hitAge:99}));
}
// Petals are always ready: transferring pollen never requires waiting or holding.
export function petalPose(){return {open:true,warning:false,amount:1};}
export function gardenBugPose(g,b){
 const s=g.beds[b.source-1],period=4.8,phase=(g.pestTime+b.phase)%period,land=phase<2.6,a=(phase-2.6)*4;
 return {x:s.x+(land?b.side*15+Math.sin(g.pestTime*1.8+b.phase)*4:Math.cos(a+b.phase)*31),y:land?322+Math.cos(g.pestTime*1.5+b.phase)*4:316+Math.sin(a)*19,land,frame:Math.floor(g.pestTime*8)%2};
}
export function careTarget(g){
 const p=g.player,nodes=g.room===1?[...DONORS.map(d=>({...d,part:'pollen'})),...g.plants.filter(s=>!s.bloom&&g.gardener?.id!==s.id).map(s=>({part:'pollinate',id:s.id,x:s.x,y:382}))]:g.plants.filter(s=>!s.bloom&&g.gardener?.id!==s.id).map(s=>({part:'spray',id:s.id,x:s.x,y:382}));
 return nodes.map(t=>({...t,d:Math.hypot(p.x-t.x,p.y-t.y)})).filter(t=>t.d<(t.part==='spray'?67:43)).sort((a,b)=>a.d-b.d)[0]||null;
}
export function careLabel(g){const t=careTarget(g);return !t?'조작':t.part==='pollen'?'받기':t.part==='pollinate'?'옮기기':'분무';}
export function carePrompt(g){
 if(g.messageLeft>0)return g.message;
 const t=careTarget(g);
 if(g.room===1){if(g.pollen===null)return '윗줄 꽃에서 꽃가루를 받아요';if(t?.part==='pollinate')return '같은 색 꽃에 옮기기를 눌러요 · 꽃마다 세 번';return POLLEN_NAMES[g.pollen]+' 꽃가루 · 같은 색 표시의 꽃으로 가요';}
 return '벌레 쪽을 보고 분무해요 · 잎에 앉았을 때 맞혀요';
}
function spray(g){
 const origin=sprayMuzzle(g.player,g.characterId);g.sprayAge=0;
 g.effects.push({type:'spray',age:0,...origin});
 const hits=g.bugs.filter(b=>b.hp>0).map(b=>{const q=gardenBugPose(g,b),dx=q.x-origin.x,dy=q.y-origin.y,len=Math.hypot(dx,dy);return {b,q,len,along:dx*origin.dx+dy*origin.dy,across:Math.abs(dx*origin.dy-dy*origin.dx)};}).filter(o=>o.q.land&&o.len<=70&&o.along>0&&o.across<=Math.min(25,o.along*.5+4)).sort((a,b)=>a.across-b.across||a.len-b.len);
 if(hits.length){const b=hits[0].b;b.hp--;b.hitAge=0;g.onEvent({type:'gardenPestHit',id:b.id});const s=g.beds[b.source-1];if(g.bugs.filter(b=>b.source===s.id).every(b=>b.hp===0)){s.bloom=true;s.bloomAge=0;g.award(s.id,s.x,317);g.say(s.name+'의 벌레를 모두 쫓았어요',1.1);}}
 return true;
}
export function actGardenCare(g){
 const t=careTarget(g);if(g.ended||g.careWait>0||!t)return false;g.turns++;
 if(t.part==='pollen'){g.pollen=t.color;g.pollenCharges=1;g.say(POLLEN_NAMES[t.color]+' 꽃가루를 받았어요',.6);g.onEvent({type:'gardenPollen',color:t.color});return true;}
 if(t.part==='spray'){g.careWait=.48;return spray(g);}
 const s=g.beds[t.id-1];
 if(g.pollen!==s.pollenNeed||g.pollenCharges<=0){g.say(POLLEN_NAMES[s.pollenNeed]+' 꽃가루가 필요해요',.7);return false;}
 const color=g.pollen;g.pollenCharges--;if(g.pollenCharges===0)g.pollen=null;
 s.pollinate=Math.min(POLLEN_TRANSFERS,s.pollinate+1);
 g.effects.push({type:'pollen',age:0,x:g.player.x,y:g.player.y-28,toX:s.x,toY:322,color});
 g.onEvent({type:'gardenPollinate',id:s.id,count:s.pollinate});
 if(s.pollinate===POLLEN_TRANSFERS){s.bloom=true;s.bloomAge=0;g.award(s.id,s.x,315);g.say(s.name+'에 꽃가루를 세 번 옮겼어요',.8);}else g.say(s.name+' · 꽃가루 '+s.pollinate+' / '+POLLEN_TRANSFERS,.6);
 return true;
}
export function tickGardenCare(g,dt){
 g.careWait=Math.max(0,g.careWait-dt);g.sprayAge+=dt;g.pestHold=Math.max(0,g.pestHold-dt);if(g.pestHold<=0)g.pestTime+=dt;g.bugs.forEach(b=>b.hitAge+=dt);
}
