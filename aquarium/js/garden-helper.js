// The bell reserves one chosen plant; other plants and the game clock continue.
export const GARDENER_TIMING=Object.freeze({arrive:.65,work:1.2,leave:.45});
export function gardenerTarget(g){
 if(g.ended||g.flashes<=0||g.gardener)return null;
 const y=g.room===0?310:382;
 return g.plants.filter(s=>!s.bloom).map(s=>({plant:s,d:Math.hypot(s.x-g.player.x,y-g.player.y)})).filter(o=>o.d<65).sort((a,b)=>a.d-b.d)[0]?.plant||null;
}
export function callGardener(g){
 const s=gardenerTarget(g);if(!s)return false;
 const side=s.x<195?1:-1,footY=s.room===0?323:373;
 g.flashes--;g.gardener={id:s.id,room:s.room,age:0,phase:'arrive',x:side>0?18:372,y:463,fromX:side>0?18:372,fromY:463,toX:s.x+side*31,toY:footY,face:side>0?1:-1,temperature:s.temperature,startProgress:s.progress,startPollen:s.pollinate||0,complete:false};
 g.say('정원사가 '+s.name+'의 남은 작업을 맡아요',1.4);g.onEvent({type:'gardenHelperCall',id:s.id,room:s.room});return true;
}
export function tickGardener(g,dt){
 const h=g.gardener;if(!h||g.ended)return;h.age+=dt;const s=g.beds[h.id-1],{arrive,work,leave}=GARDENER_TIMING;
 if(h.age<arrive){const u=h.age/arrive;h.x=h.fromX+(h.toX-h.fromX)*u;h.y=h.fromY+(h.toY-h.fromY)*u;return;}
 h.x=h.toX;h.y=h.toY;h.phase='work';const u=Math.min(1,(h.age-arrive)/work);
 if(!h.complete){
  if(h.room===0){s.active=true;s.cover=u>.7;const [low,high]=g.band(s);s.temperature=h.temperature+((low+high)/2-h.temperature)*u;s.velocity=0;s.progress=h.startProgress+(s.seconds[0]-h.startProgress)*u;}
  else if(h.room===1)s.pollinate=Math.min(3,h.startPollen+Math.floor((3-h.startPollen)*u));
  else{const remaining=4-Math.floor(4*u);for(const [i,b]of g.bugs.filter(b=>b.source===s.id).entries())b.hp=Math.min(b.hp,Math.max(0,Math.min(2,remaining-i*2)));}
  if(u>=1){h.complete=true;s.bloom=true;s.bloomAge=0;s.active=true;if(h.room===1)s.pollinate=3;
   g.onEvent({type:'gardenHelperComplete',id:s.id,room:s.room});g.award(s.id,s.x,h.room===0?245:315);g.say(s.name+'의 남은 작업을 마쳤어요',1.2);
  }
 }
 if(h.age>=arrive+work){h.phase='leave';if(h.age>=arrive+work+leave)g.gardener=null;}
}
