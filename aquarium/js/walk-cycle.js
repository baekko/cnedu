// Dream Lab's normal pace, in scene pixels per second, for the 53px side view.
export const FLAT_WALK_SPEED=160;

// Four authored poses: left contact, passing, right contact, passing.
// Equal frame durations give both steps exactly half of the same cycle.
// Direction changes may mirror a side view; gait phase must NEVER mirror a body.
export const WALK_FPS=6;
export const WALK_FRAMES=4;
// Side profiles add a weight transfer and knee-forward swing within each step.
// Both formats keep the same 2/3-second cycle and equal half-steps.
export const SIDE_WALK_FRAMES=6;
// Movement is a rate, not a minimum distance per physics substep. A 16.7ms
// display frame may finish with a 0.033ms remainder after a 60/120Hz step.
// A fixed pixel threshold made that remainder replace a real walk with idle.
export function movedDuringStep(dx=0,dy=0,seconds=0){
 return Number.isFinite(seconds)&&seconds>0&&Math.hypot(dx,dy)>seconds*.1;
}
export function walkFrame(seconds=0,frames=WALK_FRAMES){
 const elapsed=Math.max(0,Number.isFinite(seconds)?seconds:0);
 const tick=Math.floor(elapsed*WALK_FPS*frames/WALK_FRAMES+1e-8);
 return tick%frames;
}
export function heroWalkFrame(seconds,row){
 return walkFrame(seconds,row>=2?SIDE_WALK_FRAMES:WALK_FRAMES);
}
export function distanceWalkFrame(distance=0,speed,frames=WALK_FRAMES){
 return walkFrame(Math.max(0,distance)/(speed>0?speed:1),frames);
}
