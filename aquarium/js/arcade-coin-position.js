import {hookPose,laneOffset,LANTERN_ROUTE,monasteryFloor} from './monastery-core.js?v228';
import {pursuitMapPoint} from './pursuit-map.js?v235';

const ROOM_TOP=170;
const GAME_WIDTH=390;

function rewardPoint(place,game,event){
 if(!Number.isFinite(event?.x)||!Number.isFinite(event.y))return;
 const {x,y}=event;
 const time=game.elapsed||0;
 switch(place){
  case 'history':
   return {x,y:ROOM_TOP+y-13};
  case 'temple':
   return {x,y:ROOM_TOP+420-(y-game.cameraZ)-14};
  case 'language':
   return {x:x-game.camera.x,y:ROOM_TOP+y+Math.sin(time*3)*1.5};
  case 'space':
   return {x:x-game.camera.x,y:ROOM_TOP+y-game.camera.y};
  case 'literature':
   return {x,y:ROOM_TOP+y-game.camera.y-34};
  case 'monastery': {
   const lantern=LANTERN_ROUTE.find(route=>Math.abs(route.hook-game.camera.x-x)<.01);
   if(!lantern)return {x,y};
   const hook=hookPose(lantern,time);
   const floor=monasteryFloor(lantern.hook,time)+laneOffset(lantern.hookLane);
   const loop=floor-128+Math.sqrt(900-hook.offset**2);
   return {x:hook.x-game.camera.x,y:ROOM_TOP+loop+20};
  }
  case 'pursuit': {
   const city=game.arrival?.city;
   if(!city)return {x,y};
   const [mapX,mapY]=pursuitMapPoint(city.lon,city.lat);
   return {x:mapX,y:ROOM_TOP+mapY};
  }
  case 'ai':
   return {x:128,y:ROOM_TOP+385};
  case 'cinema':
   return {x,y:ROOM_TOP+242};
  case 'robot':
   return {x,y:y-10};
  default:
   return {x,y};
 }
}

function elementCenter(element){
 const rect=element?.getBoundingClientRect();
 if(rect?.width&&rect.height)return {x:rect.left+rect.width/2,y:rect.top+rect.height/2};
}

function rewardScreenPoint(place,game,event,layout){
 if(place==='cityhall'){
  const approval=elementCenter(layout.app.querySelector('#city-approval'));
  if(approval)return approval;
 }
 if(place==='exchange'){
  const capital=elementCenter(layout.app.querySelector('.final-digits'))||
   elementCenter(layout.app.querySelector('#ex-capital'));
  if(capital)return capital;
 }

 const point=rewardPoint(place,game,event);
 const canvas=layout.canvas.getBoundingClientRect();
 if(!point||!canvas.width||!canvas.height)return;
 const top=layout.target?.sourceY??(place==='aquarium'?142:ROOM_TOP);
 const height=layout.target?.sourceHeight??(place==='aquarium'?536:500);
 const sceneY=layout.world?.scene?.y(point.y)??point.y;
 return {
  x:canvas.left+point.x*canvas.width/GAME_WIDTH,
  y:canvas.top+(sceneY-top)*canvas.height/height,
 };
}

// The game column applies a CSS scale. Convert client coordinates back to
// overlay coordinates so the coin originates at the reward at every size.
export function arcadeCoinPosition({place,game,event,layout,overlay}){
 if(!overlay||!layout)return;
 const area=overlay.getBoundingClientRect();
 if(!area.width||!area.height)return;
 const point=rewardScreenPoint(place,game,event,layout);
 if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return;
 return {
  x:(point.x-area.left)*overlay.clientWidth/area.width+'px',
  y:(point.y-area.top)*overlay.clientHeight/area.height+'px',
 };
}
