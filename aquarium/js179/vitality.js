export const MAX_HEALTH=3;
export function damage(game,event,kind='hit',invKey='invincibleLeft'){
 if(game.ended||game[invKey]>0||game.shieldLeft>0)return false;
 game.health=Math.max(0,game.health-1);game.hits=(game.hits||0)+1;game.stunLeft=0;game.hitFlash=.32;game[invKey]=1.3;
 game.onEvent({type:event,kind,health:game.health});
 if(game.health===0)game.finish(false);return true;
}
export function collectRecovery(game,point){
 if(game.ended)return false;
 const item=game.recoveryItems?.find(i=>!i.collected&&Math.hypot(i.x-point.x,(i.z??i.y)-(point.z??point.y))<29);
 if(!item)return false;item.collected=true;const before=game.health;game.health=Math.min(MAX_HEALTH,game.health+1);game.healAmount=game.health-before;game.healGlow=.65;
 game.onEvent({type:'heal',x:point.x,y:point.y??point.z,recovered:game.healAmount>0});return true;
}
export function tickVitality(game,dt){game.hitFlash=Math.max(0,(game.hitFlash||0)-dt);game.healGlow=Math.max(0,(game.healGlow||0)-dt);}
