export const PURSUIT_MAP=Object.freeze({x:18,y:184,w:354,h:239,north:84,south:-65});

export function pursuitMapPoint(lon,lat,area=PURSUIT_MAP){
 return [area.x+(lon+180)*area.w/360,area.y+(area.north-lat)*area.h/(area.north-area.south)];
}

function clamp(value,min,max){return Math.min(max,Math.max(min,value));}

const pinCache=new WeakMap();
const offsets=[
 [0,0],[26,-12],[-26,-12],[0,27],[25,23],[-25,23],
 [34,0],[-34,0],[0,-34],[42,-27],[-42,-27],[42,27],[-42,27],
];

export function pursuitPins(choices){
 if(pinCache.has(choices))return pinCache.get(choices);
 const {x:left,y:top,w:width,h:height}=PURSUIT_MAP;
 const pins=[];
 for(const city of choices){
  const [originX,originY]=pursuitMapPoint(city.lon,city.lat);
  let best=null,bestValue=-Infinity;
  for(const [dx,dy] of offsets){
   const x=clamp(originX+dx,left+12,left+width-12);
   const y=clamp(originY+dy,top+12,top+height-12);
   const clearance=pins.reduce((r,p)=>Math.min(r,Math.hypot(x-p.x,y-p.y)),50);
   const value=Math.min(34,clearance)-Math.hypot(x-originX,y-originY)*.13;
   if(value>bestValue){best={x,y,originX,originY};bestValue=value;}
  }
  pins.push(best);
 }
 pinCache.set(choices,pins);
 return pins;
}

export function removePursuitPin(choices,id){
 const rejected=choices.findIndex(city=>city.id===id);
 const remaining=choices.filter((_,index)=>index!==rejected);
 pinCache.set(remaining,pursuitPins(choices).filter((_,index)=>index!==rejected));
 return remaining;
}

export function pursuitPinHit(choices,x,y){
 const area=PURSUIT_MAP;
 if(x<area.x||x>area.x+area.w||y<area.y||y>area.y+area.h)return -1;
 let best=-1,distance=22;
 for(const [i,p] of pursuitPins(choices).entries()){
  const next=Math.hypot(x-p.x,y-p.y);
  if(next<=distance){best=i;distance=next;}
 }
 return best;
}

export function pursuitNextPin(choices,selected,origin,dx,dy){
 const pins=pursuitPins(choices),horizontal=Math.sign(dx),vertical=Math.sign(dy);
 if((horizontal===0)===(vertical===0))return -1;
 const current=pins[selected];
 const [x,y]=current?[current.x,current.y]:pursuitMapPoint(origin.lon,origin.lat);
 let best=-1,lowest=Infinity,nearest=-1,nearestDistance=Infinity;
 for(const [i,pin] of pins.entries()){
  const xGap=pin.x-x,yGap=pin.y-y;
  const forward=xGap*horizontal+yGap*vertical;
  const distance=Math.hypot(xGap,yGap);
  if(distance<nearestDistance){nearest=i;nearestDistance=distance;}
  if(forward<=.5)continue;
  const cross=Math.abs(xGap*vertical+yGap*horizontal);
  const score=distance+cross*.45;
  if(score<lowest){best=i;lowest=score;}
 }
 // With no active selection, an arrow can enter the map from the current city.
 return best<0&&!current?nearest:best;
}

export function pursuitLabelBox(pin,pins,width){
 const area=PURSUIT_MAP,w=Math.min(width,area.w-10),h=23;
 const positions=[
  [pin.x-w/2,pin.y-h-14],[pin.x-w/2,pin.y+14],
  [pin.x+14,pin.y-h/2],[pin.x-w-14,pin.y-h/2],
 ];
 let best=null,bestScore=Infinity;
 for(const [i,[left,top]] of positions.entries()){
  const x=clamp(left,area.x+5,area.x+area.w-w-5);
  const y=clamp(top,area.y+5,area.y+area.h-h-5);
  const blocked=pins.reduce((count,p)=>{
   const gap=Math.hypot(p.x-clamp(p.x,x,x+w),p.y-clamp(p.y,y,y+h));
   return count+(gap<11?(p===pin?10:1):0);
  },0);
  const score=100*blocked+i;
  if(score<bestScore){best={x,y,w,h};bestScore=score;}
 }
 return best;
}
