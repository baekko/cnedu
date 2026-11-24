// Complete illustrated poses, selected by the distance the giant actually moves.
// Body and hands share one frame/anchor. No runtime limb transforms.
export const GIANT_CLIMB_CYCLE=Object.freeze([0,1,2,3]);
export const GIANT_STEP_DISTANCE=34;
export const giantHasContactPose=h=>h.active&&(h.phase==='sweep'||h.phase==='warning'&&h.age>=.84);
// The last warning frames show the hand reaching its grip, not an attack.
// Damage begins only when that warning has finished and the hand is in place.
export const giantCanDamage=h=>h.active&&h.phase==='sweep';
export class GiantSpritePlayback{
 constructor(){this.states=new WeakMap();}
 sample(h,elapsed){
  let state=this.states.get(h);
  if(!state){state={y:h.displayY,travel:0,elapsed:NaN,pose:0};this.states.set(h,state);}
  if(state.elapsed!==elapsed){
   state.travel+=(state.y-h.displayY)/GIANT_STEP_DISTANCE;
   state.y=h.displayY;state.elapsed=elapsed;
   const step=((Math.floor(state.travel)%4)+4)%4;
   state.pose=GIANT_CLIMB_CYCLE[step];
  }
  // Keep the original clenched palm at exactly the original attack position.
  const contact=giantHasContactPose(h);
  return contact?{original:true,frame:h.hand?3:2}:{original:false,frame:state.pose};
 }
}
