import {heroWalkFrame,walkFrame} from './walk-cycle.js';

const POSE=256;
const STEP_CELL=128;
const COLUMNS=12;
const LEG_TOP=196;
const LEG_HEIGHT=POSE-LEG_TOP;
const STRIP_TOP=4*POSE;

// Eight connected full-figure poses. Both steps keep the original 2/3s cycle.
// No separately animated upper/lower body in ordinary walking.
export function sideWalkFrame(seconds){
 return walkFrame(seconds,8);
}

export function hasWholeSideAnimation(image){
 return (image?.naturalWidth||image?.width||0)===8*POSE&&(image?.naturalHeight||image?.height||0)===4*POSE;
}

export function hasSideAnimation(image){
 return hasWholeSideAnimation(image)||(image?.naturalHeight||image?.height||0)>STRIP_TOP;
}

export function sideWalkCell(image,seconds,row){
 if(hasWholeSideAnimation(image))return {x:sideWalkFrame(seconds)*POSE,y:row*POSE,size:POSE};
 if(!hasSideAnimation(image))return {x:heroWalkFrame(seconds,row)*POSE,y:row*POSE,size:POSE};
 const phase=walkFrame(seconds,24);
 return {x:(phase%COLUMNS)*STEP_CELL,y:row*POSE+Math.floor(phase/COLUMNS)*STEP_CELL,size:STEP_CELL};
}

export function drawSideWalk(c,image,seconds,row,x,y,size){
 const cell=sideWalkCell(image,seconds,row);
 c.drawImage(image,cell.x,cell.y,cell.size,cell.size,x,y,size,size);
}

// Actions with a separate torso share the leg art without an arm in their crop.
export function drawWalkLegs(c,image,seconds,row,x,y,size){
 if(row>=2&&hasWholeSideAnimation(image)){
  const cell=sideWalkCell(image,seconds,row),k=size/POSE;
  c.drawImage(image,cell.x,cell.y+LEG_TOP,POSE,LEG_HEIGHT,x,y+LEG_TOP*k,size,LEG_HEIGHT*k);
  return;
 }
 const frame=heroWalkFrame(seconds,row);
 const sourceY=row>=2&&hasSideAnimation(image)?STRIP_TOP+(row-2)*LEG_HEIGHT:row*POSE+LEG_TOP;
 const k=size/POSE;
 c.drawImage(image,frame*POSE,sourceY,POSE,LEG_HEIGHT,x,y+LEG_TOP*k,size,LEG_HEIGHT*k);
}
