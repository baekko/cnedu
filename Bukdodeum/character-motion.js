/** Eight complete aquarium-style poses. Scale the gait to actual travel,
 * while world position advances continuously between drawings. */
export const WALK_CYCLE_DISTANCE=160;
export function walkingPose(distance,size=370){
 const travel=Math.max(0,distance),cycleDistance=WALK_CYCLE_DISTANCE*size/256;
 return {frame:Math.floor((travel/cycleDistance%1)*8),travel};
}
export function happyPose(t){
 for(const start of [.6,2.5]){
  const p=(t-start)/.85;
  if(p>=0&&p<1)return{frame:p<.2?2:p<.56?3:4,air:Math.sin(p*Math.PI)*34};
  if(p>=1&&p<1.23)return{frame:5,air:0};
  if(t>=start-.22&&t<start)return{frame:1,air:0};
 }
 return{frame:t<.38?0:t<4.45?6:7,air:0};
}
