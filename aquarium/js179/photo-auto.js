// Automatic shooting uses the same walking, framing, focus and shutter rules.
export function autoPhotoInput(game,dt){
 const a=game.autoShot,s=game.subjects.find(s=>s.id===a.id),p=game.player;
 let goal=a.bypass||game.autoPosition(s);
 if(a.bypass&&Math.hypot(goal.x-p.x,goal.y-p.y)<5){a.bypass=null;goal=game.autoPosition(s);}
 const dx=goal.x-p.x,dy=goal.y-p.y,length=Math.max(game.speed*dt,Math.hypot(dx,dy));
 return length?{x:dx/length,y:dy/length}:{};
}
export function trackPhotoBypass(game,before,dt){
 const a=game.autoShot;if(!a)return;const p=game.player,s=game.subjects.find(s=>s.id===a.id),goal=game.autoPosition(s);
 if(Math.hypot(p.x-before.x,p.y-before.y)<game.speed*dt*.3&&Math.hypot(goal.x-p.x,goal.y-p.y)>8)a.stuck=(a.stuck||0)+dt;else a.stuck=0;
 if(a.stuck>.2){const obstacle=game.subjects.map(s=>game.pose(s)).sort((x,y)=>Math.hypot(x.x-p.x,x.y-p.y)-Math.hypot(y.x-p.x,y.y-p.y))[0];a.bypass={x:Math.max(35,Math.min(355,obstacle.x+(p.x<obstacle.x?-43:43))),y:obstacle.y+(p.y<obstacle.y?30:-28)};a.stuck=0;}
}
