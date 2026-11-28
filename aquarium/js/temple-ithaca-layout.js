// The 1:3 illustration is registered at its native proportions. These
// measured anchor points keep the explorer's feet clear of raised walls.
export const ITHACA_TILE=Object.freeze({topZ:8160,width:390,height:1170});
const PAVEMENT=[
 [345,115,270],[375,113,272],[405,105,268],[435,100,269],
 [465,100,272],[495,101,272],[525,106,268],[555,104,269],
 [585,104,271],[615,111,270],[645,111,271],[675,110,266],
 [705,107,262],[735,111,270],[765,105,269],[795,112,269],
 [825,113,273],[855,113,273],[885,114,268],[915,113,268],
 [945,108,268],[975,105,272],[1005,100,285],[1035,104,286]
];

export function ithacaWalkBounds(z){
 const y=ITHACA_TILE.topZ-z;
 if(y<=PAVEMENT[0][0])return {left:PAVEMENT[0][1],right:PAVEMENT[0][2]};
 for(let i=1;i<PAVEMENT.length;i++){
  const [bottom,left,right]=PAVEMENT[i];
  if(y>bottom)continue;
  const [top,topLeft,topRight]=PAVEMENT[i-1],u=(y-top)/(bottom-top);
  return {left:topLeft+(left-topLeft)*u,right:topRight+(right-topRight)*u};
 }
 const [,left,right]=PAVEMENT.at(-1);
 return {left,right};
}
